import fs from 'node:fs';
import assert from 'node:assert/strict';
import postgres from 'postgres';

const local = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const target = new URL(local.DB_URL);
assert.equal(target.hostname, '127.0.0.1');
assert.equal(target.port, '54322');
assert.equal(target.pathname, '/postgres');
const mode = process.argv[2];
assert.ok(['create', 'remove'].includes(mode));
const id = '40000000-0000-4000-a000-000000000016';
const title = 'PRUEBA LOCAL - Guadalmina';
const sql = postgres(local.DB_URL, { max: 1, connect_timeout: 5, onnotice: () => {} });
try {
  if (mode === 'create') {
    assert.equal((await sql`SELECT id FROM public.activity_events WHERE id=${id}`).length, 0);
    await sql`INSERT INTO public.activity_events(id,category,slug,title,starts_at,capacity_total,status,event_type,price_cents,meeting_point_public)
      VALUES(${id},'barranquismo','guadalmina',${title},now()+interval '2 days',6,'publicada','open_group',3500,'LUGAR FICTICIO LOCAL')`;
  } else {
    const removed = await sql`DELETE FROM public.activity_events WHERE id=${id} AND title=${title} RETURNING id`;
    assert.equal(removed.length, 1);
  }
  console.log(`Local calendar fixture ${mode} OK`);
} finally { await sql.end(); }
