import assert from 'node:assert/strict';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleDeposit } from '../../supabase/functions/create-activity-deposit/handler.ts';

Deno.test('initial deposit replay and concurrent retries reuse one hold and reject changed payload', async () => {
  const config = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
  assert.equal(config.API_URL, 'http://127.0.0.1:54321');
  const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const must = async (q: PromiseLike<any>) => { const r = await q; if (r.error) throw Error(r.error.message); return r.data; };
  const event = crypto.randomUUID(), email = `local-replay-${crypto.randomUUID()}@example.test`;
  await must(db.from('activity_events').insert({ id: event, category: 'barranquismo', slug: 'guadalmina', title: 'LOCAL REPLAY FIXTURE',
    starts_at: new Date(Date.now() + 7 * 86400000).toISOString(), capacity_total: 6, status: 'publicada', event_type: 'open_group', price_cents: 3500 }));
  try {
    const input = { requestId: crypto.randomUUID(), category: 'barranquismo', slug: 'guadalmina', participants: 2, eventId: event,
      name: 'Persona ficticia', email, phone: '+34000000000', rgpd: true, environment: 'sandbox', origin: 'http://127.0.0.1:8082' };
    const deps = { db, notify: async () => ({ status: 'omitido' }), businessRecipients: () => [] };
    // First request completes on the server; its response is deliberately discarded.
    const first = await handleDeposit(input, deps);
    assert.equal(first.status, 200);
    const replay = await handleDeposit(input, deps);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.token, first.body.token);
    const concurrent = await Promise.all([handleDeposit(input, deps), handleDeposit(input, deps)]);
    assert.ok(concurrent.every(r => r.status === 200 && r.body.token === first.body.token));
    const changed = await handleDeposit({ ...input, participants: 3 }, deps);
    assert.equal(changed.status, 409);
    assert.equal(changed.body.reason, 'intent_mismatch');
    const bookings = await must(db.from('bookings').select('id').eq('email', email));
    const eventRow = await must(db.from('activity_events').select('seats_reserved').eq('id', event).single());
    assert.equal(bookings.length, 1);
    assert.equal(eventRow.seats_reserved, 2);
    const recovered = await handleDeposit({ action: 'recover', requestId: input.requestId }, deps);
    assert.equal(recovered.status, 200);
    assert.equal(recovered.body.token, first.body.token);
    assert.equal((await handleDeposit({ action: 'recover', requestId: crypto.randomUUID() }, deps)).status, 404);
    await must(db.from('activity_events').update({ price_cents: 4000 }).eq('id', event));
    const distinct = await handleDeposit({ ...input, requestId: crypto.randomUUID() }, deps);
    assert.equal(distinct.status, 200);
    assert.notEqual(distinct.body.token, first.body.token);
    assert.equal(distinct.body.totalCents, 8000);
    assert.equal(distinct.body.amountCents, 2400);
    const newIntent = { ...input, requestId: crypto.randomUUID() };
    const initialRace = await Promise.all([handleDeposit(newIntent, deps), handleDeposit(newIntent, deps)]);
    assert.ok(initialRace.every(r => r.status === 200));
    assert.equal(initialRace[0].body.token, initialRace[1].body.token);
    assert.equal((await must(db.from('activity_events').select('seats_reserved').eq('id', event).single())).seats_reserved, 6);
    await must(db.from('activity_event_bookings').update({ hold_expires_at: new Date(Date.now()-60000).toISOString() }).eq('booking_id', bookings[0].id));
    const expired = await handleDeposit(input, deps);
    assert.equal(expired.status, 409);
    assert.equal(expired.body.reason, 'intent_expired');
    assert.equal((await handleDeposit({ action: 'recover', requestId: input.requestId }, deps)).status, 409);
  } finally {
    const bookings = await must(db.from('bookings').select('id').eq('email', email));
    for (const booking of bookings) {
      await must(db.from('notification_log').delete().eq('booking_id', booking.id));
      await must(db.from('payment_requests').delete().eq('booking_id', booking.id));
      await must(db.from('bookings').delete().eq('id', booking.id));
    }
    await must(db.from('activity_events').delete().eq('id', event));
  }
});
