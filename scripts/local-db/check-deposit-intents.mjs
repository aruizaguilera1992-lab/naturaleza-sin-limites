import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { validateTarget } from './target.mjs';

assert.equal(process.argv[2], '--database');
const config = JSON.parse(fs.readFileSync('.tools/local-postgres/credentials.local.json', 'utf8'));
const target = validateTarget(config, process.argv[3]);
const options = { ...target, max: 1, prepare: false, connect_timeout: 5, onnotice: () => {} };
const sql = postgres(options), a = postgres(options), b = postgres(options);
const event = randomUUID(), intent = randomUUID(), email = `atomic-ci-${randomUUID()}@example.test`;
const payload = { eventId: event, category: 'barranquismo', slug: 'guadalmina', participants: 2, environment: 'sandbox',
  rgpd: true, email, name: 'CI fictitious', phone: '+34000000000', activityLabel: 'LOCAL ATOMIC CI', catalogueUnitCents: 3500 };
let fault = false;
try {
  assert.equal((await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`)[0].n, 15);
  for (const role of ['anon', 'authenticated']) {
    const [permissions] = await sql`SELECT has_function_privilege(${role},'public.create_deposit_intent(uuid,jsonb)','EXECUTE') AS rpc,
      has_table_privilege(${role},'public.deposit_intents','SELECT') AS data`;
    assert.deepEqual({ ...permissions }, { rpc: false, data: false });
  }
  await sql`INSERT INTO public.activity_events(id,category,slug,title,starts_at,capacity_total,status,event_type,price_cents)
    VALUES(${event},'barranquismo','guadalmina','LOCAL ATOMIC CI',now()+interval '7 days',6,'publicada','open_group',4000)`;
  await Promise.all([a`SET ROLE service_role`, b`SET ROLE service_role`]);
  const create = async (client, id, value = payload) => (await client`SELECT public.create_deposit_intent(${id}::uuid,${client.json(value)}::jsonb) AS result`)[0].result;
  const pair = await Promise.all([create(a, intent), create(b, intent)]);
  assert.ok(pair.every(result => result.ok));
  assert.equal(pair[0].token, pair[1].token);
  assert.equal(pair[0].amount_cents, 2400); assert.equal(pair[0].total_cents, 8000);
  assert.equal((await sql`SELECT count(*)::int AS n FROM bookings WHERE email=${email}`)[0].n, 1);
  assert.equal((await sql`SELECT seats_reserved FROM activity_events WHERE id=${event}`)[0].seats_reserved, 2);
  assert.equal((await create(a, intent, { ...payload, participants: 3 })).reason, 'intent_mismatch');
  const remaining = await Promise.all([create(a, randomUUID(), { ...payload, participants: 4 }), create(b, randomUUID(), { ...payload, participants: 4 })]);
  assert.equal(remaining.filter(result => result.ok).length, 1);
  assert.equal(remaining.filter(result => result.reason === 'sin_plazas').length, 1);
  assert.equal((await sql`SELECT seats_reserved FROM activity_events WHERE id=${event}`)[0].seats_reserved, 6);
  await sql`UPDATE activity_event_bookings SET hold_expires_at=now()-interval '1 minute' WHERE booking_id=${pair[0].booking_id}`;
  assert.equal((await create(a, intent)).reason, 'intent_expired');

  // Payment insertion fault must roll back every row and the seat counter.
  for (const booking of await sql`SELECT id FROM bookings WHERE email=${email}`) {
    await sql`SELECT public.release_event_seats(${booking.id}::uuid)`;
  }
  const before = (await sql`SELECT count(*)::int AS n FROM bookings WHERE email=${email}`)[0].n;
  await sql.unsafe("ALTER TABLE payment_requests ADD CONSTRAINT nsl_ci_atomic_fault CHECK (customer_email <> '" + email + "') NOT VALID"); fault = true;
  await assert.rejects(create(a, randomUUID()), error => error.code === '23514');
  assert.equal((await sql`SELECT count(*)::int AS n FROM bookings WHERE email=${email}`)[0].n, before);
  assert.equal((await sql`SELECT seats_reserved FROM activity_events WHERE id=${event}`)[0].seats_reserved, 0);
  console.log('PASS: 0014 permissions, parallel replay, authoritative price, mismatch, last-seat race, expiry and full rollback');
} finally {
  if (fault) await sql`ALTER TABLE payment_requests DROP CONSTRAINT nsl_ci_atomic_fault`;
  for (const booking of await sql`SELECT id FROM bookings WHERE email=${email}`) {
    await sql`DELETE FROM payment_requests WHERE booking_id=${booking.id}`;
    await sql`DELETE FROM bookings WHERE id=${booking.id}`;
  }
  await sql`DELETE FROM activity_events WHERE id=${event}`;
  await Promise.all([sql.end(), a.end(), b.end()]);
}
