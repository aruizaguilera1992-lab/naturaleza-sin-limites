/* global process, console */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import postgres from 'postgres';
import {validateTarget} from './target.mjs';
import {schemaInventory} from './schema-inventory.mjs';

const [flag,name,...extra]=process.argv.slice(2);
if(flag!=='--database'||extra.length)throw Error('Expected --database nsl_rebuild_<fixture>');
const config=JSON.parse(fs.readFileSync('.tools/local-postgres/credentials.local.json','utf8'));
const source=validateTarget(config,name);
const destination=validateTarget(config,name+'_restore');
const options={max:1,prepare:false,connect_timeout:3,onnotice:()=>{}};
const admin=postgres({...source,...options,database:'postgres'});
const sql=postgres({...source,...options});
let restored;
const output=path.resolve('.tools/local-postgres/recovery',name);
try {
  const marker=await sql`SELECT shobj_description(oid,'pg_database') AS description FROM pg_database WHERE datname=current_database()`;
  assert.equal(marker[0].description,'NSL LOCAL FIXTURE ONLY; not a production copy');
  assert.equal((await admin`SELECT 1 FROM pg_database WHERE datname=${destination.database}`).length,0,'Restore target must not exist');
  fs.mkdirSync(output,{recursive:true});
  const before=await schemaInventory(sql);
  assert.equal((await sql`SELECT current_setting('search_path') AS value`)[0].value,'public, extensions');
  const counts=async db=>{
    const result={};
    for(const {schema,relname,relkind} of before.relations)if(['r','p'].includes(relkind))result[`${schema}.${relname}`]=Number((await db`SELECT count(*) AS n FROM ${db(schema+'.'+relname)}`)[0].n);
    return result;
  };
  const beforeCounts=await counts(sql);
  const bin=process.platform==='win32'?path.resolve('.tools/local-postgres/node_modules/@embedded-postgres/windows-x64/native/bin'):'';
  const run=(command,args)=>{
    const result=spawnSync(bin?path.join(bin,command+'.exe'):command,args,{env:{...process.env,PGPASSWORD:source.password},encoding:'utf8',windowsHide:true,timeout:60000});
    if(result.status!==0)throw Error(command+' failed; exit '+result.status+'; '+(result.error?.code??'tool failure')); // Never log credentials or raw tool output.
  };
  const connection=['--host','127.0.0.1','--port','55432','--username','nsl_local_admin','--no-password'];
  const dump=path.join(output,'fixture.dump');
  run('pg_dump',[...connection,'--dbname',name,'--format=custom','--file',dump]);
  await admin`CREATE DATABASE ${admin(destination.database)}`;
  // pg_dump without --create does not restore database-level settings.
  // This fixture explicitly requires its extension schema in search_path.
  await admin`ALTER DATABASE ${admin(destination.database)} SET search_path TO public, extensions`;
  restored=postgres({...destination,...options});
  run('pg_restore',[...connection,'--dbname',destination.database,'--exit-on-error','--single-transaction',dump]);
  assert.deepEqual(await schemaInventory(restored),before,'Restored structure must match exactly');
  assert.deepEqual(await counts(restored),beforeCounts,'Every inventoried table count must match');
  assert.deepEqual(await schemaInventory(sql),before,'Source structure must remain unchanged');
  assert.deepEqual(await counts(sql),beforeCounts,'Source counts must remain unchanged');
  fs.writeFileSync(path.join(output,'schema.json'),JSON.stringify(before,null,2)+'\n');
  const report={source:name,restored:destination.database,localFixtureOnly:true,productionEquivalent:false,restoredDatabaseSettings:{search_path:'public, extensions'},sha256:createHash('sha256').update(fs.readFileSync(dump)).digest('hex'),sections:Object.fromEntries(Object.entries(before).map(([k,v])=>[k,v.length])),counts:beforeCounts,structureMatches:true,countsMatch:true,sourceUnchanged:true};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally {await restored?.end();await sql.end();await admin.end();}
