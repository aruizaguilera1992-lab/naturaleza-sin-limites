import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
const config = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
const target = new URL(config.DB_URL);
assert.equal(target.hostname, '127.0.0.1'); assert.equal(target.port, '54322');
assert.equal(target.pathname, '/postgres');
const options = { max: 1, prepare: false, connect_timeout: 5, onnotice: () => {} };
const sql = postgres(config.DB_URL, options), a = postgres(config.DB_URL, options), b = postgres(config.DB_URL, options);
const event = randomUUID(), ids = Array.from({ length: 4 }, randomUUID);
const counts = async expected => assert.equal((await sql`SELECT seats_reserved FROM public.activity_events WHERE id=${event}`)[0].seats_reserved, expected);
const reserve = async (connection, id, people) => connection.begin(async tx => {
  await tx`SET LOCAL ROLE service_role`;
  await tx`SET LOCAL statement_timeout='5s'`;
  return (await tx`SELECT public.reserve_event_seats(${event}::uuid,${id}::uuid,${people},30) AS result`)[0].result;
});
const checks = [];
try {
  await sql`INSERT INTO public.activity_events(id,category,slug,title,starts_at,capacity_total,status,event_type)
    VALUES(${event},'barranquismo','guadalmina','LOCAL SEATS FIXTURE',now()+interval '10 days',6,'publicada','open_group')`;
  for (const id of ids) await sql`INSERT INTO public.bookings(id,activity,contact) VALUES(${id},'LOCAL SEATS FIXTURE','fixture@example.test')`;
  assert.equal((await reserve(a, ids[0], 7)).reason, 'invalid_participants');
  await counts(0);
  assert.equal((await reserve(a, ids[0], 4)).ok, true);
  assert.equal((await reserve(a, ids[0], 4)).ok, false);
  await counts(4);
  checks.push('seven rejected; retry does not double four seats');
  assert.notEqual((await a`SELECT pg_backend_pid() AS id`)[0].id, (await b`SELECT pg_backend_pid() AS id`)[0].id);
  let ready;
  const locked = new Promise(resolve => { ready = resolve; });
  const winner = a.begin(async tx => {
    await tx`SET LOCAL ROLE service_role`;
    await tx`SET LOCAL statement_timeout='5s'`;
    const result = (await tx`SELECT public.reserve_event_seats(${event}::uuid,${ids[1]}::uuid,2,30) AS result`)[0].result;
    ready();
    await tx`SELECT pg_sleep(0.25)`;
    return result;
  }).catch(error => { ready(); throw error; });
  const loser = (async () => { await locked; return reserve(b, ids[2], 2); })();
  const results = await Promise.all([winner, loser]);
  assert.equal(results[0].ok, true); assert.equal(results[1].reason, 'sin_plazas');
  await counts(6);
  checks.push('two independent connections: last two seats awarded once, loser rejected');
  assert.equal((await sql`SELECT public.confirm_event_seats(${ids[0]}::uuid) AS r`)[0].r.ok, true);
  assert.equal((await sql`SELECT public.confirm_event_seats(${ids[0]}::uuid) AS r`)[0].r.already, true);
  await counts(6);
  assert.equal((await sql`SELECT public.release_event_seats(${ids[0]}::uuid,'local test') AS r`)[0].r.ok, true);
  assert.equal((await sql`SELECT public.release_event_seats(${ids[0]}::uuid,'local retry') AS r`)[0].r.already, true);
  await counts(2);
  checks.push('confirmation and release retries preserve seat totals');
  await sql`UPDATE public.activity_event_bookings SET hold_expires_at=now()-interval '1 minute' WHERE booking_id=${ids[1]}`;
  await sql`SELECT public.release_expired_event_holds()`;
  await counts(0);
  assert.equal((await reserve(a, ids[3], 6)).ok, true);
  assert.equal((await sql`SELECT public.confirm_event_seats(${ids[1]}::uuid) AS r`)[0].r.reason, 'sin_plazas');
  await counts(6);
  checks.push('expiry frees seats; late confirmation fails when seats have been reassigned');
  const denied = await fetch(config.API_URL + '/rest/v1/rpc/reserve_event_seats', {
    method: 'POST', headers: { apikey: config.PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ _event_id: event, _booking_id: ids[2], _participants: 1 }),
    signal: AbortSignal.timeout(5000),
  });
  assert.ok([401, 403].includes(denied.status));
  checks.push('anonymous REST cannot call seat reservation RPC');
} finally {
  await Promise.all([a.end(), b.end()]);
  await sql`DELETE FROM public.activity_events WHERE id=${event}`;
  for (const id of ids) await sql`DELETE FROM public.bookings WHERE id=${id}`;
  await sql.end();
}
const report = { localOnly: true, checks, fixturesRemoved: true, paymentsUsed: false };
fs.writeFileSync('.tools/local-supabase/seats-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
