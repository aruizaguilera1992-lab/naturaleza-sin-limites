import fs from 'node:fs';
import assert from 'node:assert/strict';
import postgres from 'postgres';
const local = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const url = new URL(local.DB_URL);
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '54322');
const sql = postgres(local.DB_URL, { max: 1, connect_timeout: 5, onnotice: () => {} });
try {
  const rows = await sql`SELECT id,number_of_people,event_id FROM public.bookings WHERE email='local-browser-20261016@example.test' AND name='PRUEBA LOCAL NSL'`;
  assert.equal(rows.length, 1);
  const id = rows[0].id;
  try {
    assert.equal(rows[0].number_of_people, '6');
    assert.equal(rows[0].event_id, null);
    assert.equal((await sql`SELECT 1 FROM public.payment_requests WHERE booking_id=${id}`).length, 0);
    assert.equal((await sql`SELECT 1 FROM public.activity_event_bookings WHERE booking_id=${id}`).length, 0);
    const notices = await sql`SELECT status FROM public.notification_log WHERE booking_id=${id}`;
    assert.equal(notices.length, 2);
    assert.ok(notices.every(n => n.status === 'omitido'));
    console.log('PASS: one browser request, six people, two omitted notices, no payment or seat hold');
  } finally {
    await sql`DELETE FROM public.notification_log WHERE booking_id=${id}`;
    await sql`DELETE FROM public.bookings WHERE id=${id}`;
    console.log('PASS: fictitious browser request cleaned up');
  }
} finally { await sql.end(); }
