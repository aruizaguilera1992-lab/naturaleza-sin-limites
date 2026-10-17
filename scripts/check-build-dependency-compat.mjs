import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const core = require('@esbuild-kit/core-utils');
const coreRequire = createRequire(require.resolve('@esbuild-kit/core-utils'));
const mcpRequire = createRequire(require.resolve('@lovable.dev/mcp-js'));
assert.equal(coreRequire('esbuild').version, '0.25.12');
assert.equal(mcpRequire('esbuild').version, '0.28.2');
const source = 'const value: number = 42; export default value;';
const transformed = await core.transform(source, path.resolve('dependency-fixture.ts'), { format: 'esm' });
const evaluated = await import('data:text/javascript;base64,' + Buffer.from(transformed.code).toString('base64'));
assert.equal(evaluated.default, 42);
const sync = core.transformSync(source, path.resolve('dependency-fixture-sync.ts'), { format: 'cjs' });
const compiled = { exports: {} };
new Function('module', 'exports', sync.code)(compiled, compiled.exports);
assert.equal(compiled.exports.default, 42);
const bundled = await mcpRequire('esbuild').build({ stdin: { contents: source, loader: 'ts' },
  write: false, bundle: true, format: 'esm', platform: 'neutral' });
assert.ok(bundled.outputFiles[0].text.includes('42'));

// Generate SQL only. No connection URL, migrate, push, studio or remote target.
const output = path.resolve('.tools/local-supabase', `dependency-schema-${randomUUID()}`);
const localEnvironment = new Set(['PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA']);
const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => localEnvironment.has(name.toUpperCase())));
execFileSync(process.execPath, ['node_modules/drizzle-kit/bin.cjs', 'generate', '--dialect=postgresql',
  '--schema=./scripts/fixtures/dependency-schema.ts', `--out=${output}`, '--name=nsl_dependency_fixture'],
{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env, timeout: 30000, windowsHide: true });
const sqlFile = fs.readdirSync(output).find(name => name.endsWith('.sql'));
assert.ok(sqlFile);
const sql = fs.readFileSync(path.join(output, sqlFile), 'utf8');
assert.match(sql, /CREATE TABLE "nsl_dependency_fixture"/);
assert.match(sql, /"id" uuid PRIMARY KEY/);
assert.match(sql, /"title" text NOT NULL/);
assert.match(sql, /"capacity" integer DEFAULT 6 NOT NULL/);
if (process.argv[2] === '--compare-css') {
  const before = fs.readFileSync(process.argv[3]), after = fs.readFileSync(process.argv[4]);
  assert.deepEqual(after, before, 'Dependency change must not alter the baseline CSS');
  console.log(JSON.stringify({ cssBytes: after.length, sha256: createHash('sha256').update(after).digest('hex'), identical: true }));
}
console.log('PASS: scoped esbuild versions, async/sync TypeScript execution, MCP build API and Drizzle SQL generation without database');
