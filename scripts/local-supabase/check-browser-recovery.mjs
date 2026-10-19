import fs from 'node:fs';
import assert from 'node:assert/strict';
import postgres from 'postgres';
const config = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const url = new URL(config.DB_URL);
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '54322');
const sql = postgres(config.DB_URL, { max: 1, connect_timeout: 5, onnotice: () => {} });
try {
  const rows = await sql`SELECT id,event_id FROM public.bookings WHERE email='local-recovery-browser@example.test' AND name='LOCAL RECOVERY FIXTURE'`;
  assert.equal(rows.length, 1);
  const booking = rows[0];
  try {
    assert.equal((await sql`SELECT seats_reserved FROM public.activity_events WHERE id=${booking.event_id}`)[0].seats_reserved, 6);
    assert.equal((await sql`SELECT 1 FROM public.payment_requests WHERE booking_id=${booking.id}`).length, 1);
    assert.equal((await sql`SELECT 1 FROM public.deposit_intents WHERE booking_id=${booking.id}`).length, 1);
    console.log('PASS: browser recovery retained one booking, one payment, one intent and six seats');
  } finally {
    await sql`DELETE FROM public.notification_log WHERE booking_id=${booking.id}`;
    await sql`DELETE FROM public.payment_requests WHERE booking_id=${booking.id}`;
    await sql`DELETE FROM public.bookings WHERE id=${booking.id}`;
  }
} finally { await sql.end(); }
