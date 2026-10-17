import assert from 'node:assert/strict';
import fs from 'node:fs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Explicit one-time LOCAL fixture bootstrap. No reset, no remote URLs, no .env.
const settings = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8').replace(/^\uFEFF/, ''));
const url = new URL(settings.DB_URL);
assert.equal(url.hostname, '127.0.0.1');
assert.equal(url.port, '54322');
assert.equal(url.pathname, '/postgres');
assert.equal(url.username, 'postgres');
assert.equal(url.search, '');
assert.equal(settings.API_URL, 'http://127.0.0.1:54321');
assert.match(fs.readFileSync('.tools/local-supabase/project/supabase/config.toml', 'utf8'), /^project_id = "nsl-isolated-local"/);
const sql = postgres(settings.DB_URL, { max: 1, prepare: false, connect_timeout: 5, onnotice: () => {} });
try {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  assert.equal(tables.length, 0, 'Public schema must be empty; refusing to overwrite or retry');
  assert.ok((await sql`SELECT 1 FROM information_schema.tables WHERE table_schema='auth' AND table_name='users'`).length);
  await sql`SET search_path TO public,extensions`;
  await sql.unsafe(fs.readFileSync('scripts/local-db/before-supabase.sql', 'utf8'));
  const migrations = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort();
  for (const file of migrations) await sql.begin(tx => tx.unsafe(fs.readFileSync(`supabase/migrations/${file}`, 'utf8')));
  await sql.unsafe(fs.readFileSync('scripts/local-db/before-drizzle.sql', 'utf8'));
  await migrate(drizzle(sql), { migrationsFolder: 'drizzle/migrations' });
  const history = await sql`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`;
  assert.equal(history.length, JSON.parse(fs.readFileSync('drizzle/migrations/meta/_journal.json', 'utf8')).entries.length);
  await migrate(drizzle(sql), { migrationsFolder: 'drizzle/migrations' });
  assert.deepEqual(await sql`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`, history);
  const report = { localOnly: true, realLocalAuth: true, productionEquivalent: false, supabaseMigrations: migrations.length, drizzleMigrations: history.length, repeatDrizzleStable: true };
  fs.writeFileSync('.tools/local-supabase/bootstrap-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await sql.end();
}
