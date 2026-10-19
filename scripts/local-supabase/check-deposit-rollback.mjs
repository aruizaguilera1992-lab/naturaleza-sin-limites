import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
const config = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const url = new URL(config.DB_URL);
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '54322'); assert.equal(url.pathname, '/postgres');
const sql = postgres(config.DB_URL, { max: 1, prepare: false, onnotice: () => {} });
const event = randomUUID(), intent = randomUUID(), email = `rollback-${randomUUID()}@example.test`;
let constraint = false;
try {
  assert.equal((await sql`SELECT 1 FROM pg_constraint WHERE conname='nsl_local_reject_deposit_fixture'`).length, 0);
  await sql`INSERT INTO public.activity_events(id,category,slug,title,starts_at,capacity_total,status,event_type,price_cents)
    VALUES(${event},'barranquismo','guadalmina','LOCAL ROLLBACK FIXTURE',now()+interval '7 days',6,'publicada','open_group',3500)`;
  // Scoped fault injection: rejects only this random fixture email, never other rows.
  await sql.unsafe('ALTER TABLE public.payment_requests ADD CONSTRAINT nsl_local_reject_deposit_fixture CHECK (customer_email <> ' + "'" + email + "') NOT VALID");
  constraint = true;
  const payload = { eventId: event, category: 'barranquismo', slug: 'guadalmina', participants: 2, environment: 'sandbox',
    rgpd: true, email, name: 'Fictitious rollback', phone: '+34000000000', activityLabel: 'LOCAL ROLLBACK', catalogueUnitCents: 3500 };
  await assert.rejects(sql`SELECT public.create_deposit_intent(${intent}::uuid,${sql.json(payload)}::jsonb)`, e => e.code === '23514');
  assert.equal((await sql`SELECT 1 FROM public.bookings WHERE email=${email}`).length, 0);
  assert.equal((await sql`SELECT 1 FROM public.activity_event_bookings WHERE event_id=${event}`).length, 0);
  assert.equal((await sql`SELECT 1 FROM public.deposit_intents WHERE id=${intent}`).length, 0);
  assert.equal((await sql`SELECT seats_reserved FROM public.activity_events WHERE id=${event}`)[0].seats_reserved, 0);
  console.log('PASS: payment insert fault rolls back booking, hold, counter and intent');
} finally {
  if (constraint) await sql`ALTER TABLE public.payment_requests DROP CONSTRAINT nsl_local_reject_deposit_fixture`;
  await sql`DELETE FROM public.activity_events WHERE id=${event}`;
  await sql.end();
}
