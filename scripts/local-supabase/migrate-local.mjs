import fs from 'node:fs';
import assert from 'node:assert/strict';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
const local = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const url = new URL(local.DB_URL);
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '54322'); assert.equal(url.pathname, '/postgres');
assert.equal(local.API_URL, 'http://127.0.0.1:54321');
const sql = postgres(local.DB_URL, { max: 1, prepare: false, onnotice: () => {} });
try {
  await sql`SET search_path TO public,extensions`;
  const before = await sql`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`;
  assert.ok([14, 15].includes(before.length), 'Expected known local migration baseline');
  await migrate(drizzle(sql), { migrationsFolder: 'drizzle/migrations' });
  const after = await sql`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`;
  assert.equal(after.length, 15);
  assert.deepEqual(Array.from(after.slice(0, before.length)), Array.from(before));
  await sql`NOTIFY pgrst,'reload schema'`;
  console.log('Local migration history: 15 entries; previous entries preserved');
} finally { await sql.end(); }
