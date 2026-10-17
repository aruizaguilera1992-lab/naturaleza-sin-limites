import fs from 'node:fs';
import assert from 'node:assert/strict';
import postgres from 'postgres';

const local = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const target = new URL(local.DB_URL);
assert.equal(local.API_URL, 'http://127.0.0.1:54321');
assert.equal(target.hostname, '127.0.0.1'); assert.equal(target.port, '54322'); assert.equal(target.pathname, '/postgres');
const sql = postgres(local.DB_URL, { max: 1, prepare: false, connect_timeout: 5, onnotice: () => {} });
try {
  const removed = await sql.begin(async tx => {
    const events = await tx`SELECT id FROM activity_events WHERE title='LOCAL PAYMENT FIXTURE' FOR UPDATE`;
    let bookings = 0;
    for (const event of events) {
      const rows = await tx`SELECT b.id,b.email FROM bookings b JOIN activity_event_bookings l ON l.booking_id=b.id WHERE l.event_id=${event.id}`;
      assert.ok(rows.every(row => /^browser-payment-[0-9a-f-]{36}@example\.test$/.test(row.email)), 'Refusing non-synthetic data');
      for (const row of rows) {
        await tx`DELETE FROM notification_log WHERE booking_id=${row.id}`;
        await tx`DELETE FROM payment_requests WHERE booking_id=${row.id}`;
        await tx`DELETE FROM bookings WHERE id=${row.id}`;
        bookings++;
      }
      await tx`DELETE FROM activity_events WHERE id=${event.id}`;
    }
    return { events: events.length, bookings };
  });
  console.log(JSON.stringify({ syntheticFixturesRemoved: removed }));
} finally { await sql.end(); }
