import assert from 'node:assert/strict';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleDeposit } from '../../supabase/functions/create-activity-deposit/handler.ts';
import { openCheckout } from '../../supabase/functions/get-payment/checkout.ts';

Deno.test('local deposit + simulated checkout: lost response, record failure, expired hold', async () => {
  const config = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
  assert.equal(config.API_URL, 'http://127.0.0.1:54321');
  const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const must = async (query: PromiseLike<any>) => {
    const result = await query;
    if (result.error) throw Error(result.error.message);
    return result.data;
  };
  for (const scenario of ['lost_response', 'record_failure', 'expired_hold']) {
    const event = crypto.randomUUID();
    const email = `local-deposit-${crypto.randomUUID()}@example.test`;
    await must(db.from('activity_events').insert({ id: event, category: 'barranquismo', slug: 'guadalmina',
      title: 'LOCAL CHECKOUT FIXTURE', starts_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      capacity_total: 6, status: 'publicada', event_type: 'open_group', price_cents: 3500 }));
    try {
      const deposit = await handleDeposit({ requestId: crypto.randomUUID(), category: 'barranquismo', slug: 'guadalmina', participants: 2,
        eventId: event, name: 'Persona ficticia', email, phone: '+34000000000', rgpd: true,
        environment: 'sandbox', origin: 'http://127.0.0.1:8082' }, {
        db, notify: async () => ({ status: 'omitido' }), businessRecipients: () => [],
      });
      assert.equal(deposit.status, 200);
      assert.equal(deposit.body.amountCents, 2100);
      assert.equal(deposit.body.totalCents, 7000);
      const pr = await must(db.from('payment_requests').select('*').eq('token', deposit.body.token).single());
      const generation = await must(db.rpc('begin_checkout_generation', { _token: pr.token, _expired_session_id: null }));
      assert.equal(generation.ok, true);
      const input = { pr, currency: 'eur', env: 'sandbox', generation: generation.generation,
        returnUrl: 'http://127.0.0.1:8082/pago/local-fixture', originHash: 'local-fixture' };
      const sessions = new Map<string, { params: string; session: any }>();
      const expired: string[] = [];
      let calls = 0;
      const deps = {
        rpc: async (name: string, args: Record<string, unknown>) => {
          if (scenario === 'record_failure' && name === 'record_checkout_session') return { data: null, error: { message: 'simulated record failure' } };
          return await db.rpc(name, args);
        },
        createSession: async (params: Record<string, unknown>, key: string) => {
          calls++;
          const encoded = JSON.stringify(params);
          if (sessions.has(key)) assert.equal(sessions.get(key)!.params, encoded);
          else sessions.set(key, { params: encoded, session: { id: `cs_local_${crypto.randomUUID()}`,
            client_secret: 'local-fixture-secret', expires_at: params.expires_at } });
          // Simulate provider creation followed by a lost response, BEFORE recording.
          if (scenario === 'lost_response' && calls === 1) throw Error('simulated lost provider response');
          return sessions.get(key)!.session;
        },
        expireSession: async (id: string) => { expired.push(id); },
        setLastError: async () => undefined,
      };
      if (scenario === 'expired_hold') {
        await must(db.from('activity_event_bookings').update({ hold_expires_at: new Date(Date.now() - 60000).toISOString() }).eq('booking_id', pr.booking_id));
      }
      const first = await openCheckout(deps, input);
      assert.equal(first.ok, false);
      if (scenario === 'lost_response') {
        assert.equal((await openCheckout(deps, input)).ok, true);
        assert.equal(sessions.size, 1);
        assert.equal(calls, 2);
        assert.equal(expired.length, 0);
        const stored = await must(db.from('payment_requests').select('stripe_session_id,checkout_expires_at').eq('id', pr.id).single());
        assert.equal(stored.stripe_session_id, [...sessions.values()][0].session.id);
      } else if (scenario === 'record_failure') {
        assert.equal(expired.length, 1);
        assert.equal('clientSecret' in first, false);
      } else {
        assert.equal(calls, 0);
        assert.equal(sessions.size, 0);
      }
      console.log(`PASS ${scenario}: real local hold/RPC, simulated provider only`);
    } finally {
      const bookings = await must(db.from('bookings').select('id').eq('email', email));
      for (const booking of bookings) {
        await must(db.from('notification_log').delete().eq('booking_id', booking.id));
        await must(db.from('payment_requests').delete().eq('booking_id', booking.id));
        await must(db.from('bookings').delete().eq('id', booking.id));
      }
      await must(db.from('activity_events').delete().eq('id', event));
    }
  }
});
