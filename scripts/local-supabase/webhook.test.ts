import assert from 'node:assert/strict';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.test('signed local webhook rejects invalid data and confirms repeated payment once', async () => {
  const config = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
  assert.equal(config.API_URL, 'http://127.0.0.1:54321');
  Deno.env.set('SUPABASE_URL', config.API_URL);
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', config.SERVICE_ROLE_KEY);
  const secret = `local-only-${crypto.randomUUID()}`;
  Deno.env.set('PAYMENTS_SANDBOX_WEBHOOK_SECRET', secret);
  Deno.env.set('EMAIL_DELIVERY_MODE', 'disabled');
  Deno.env.set('NOTIFICATION_EMAIL', 'owner@example.test');
  for (const name of ['RESEND_API_KEY', 'LOVABLE_API_KEY', 'STRIPE_SANDBOX_API_KEY', 'STRIPE_LIVE_API_KEY', 'PAYMENTS_LIVE_WEBHOOK_SECRET']) Deno.env.delete(name);
  let handler: (req: Request) => Promise<Response>;
  const original = Deno.serve;
  Deno.serve = ((fn: typeof handler) => { handler = fn; return {}; }) as typeof Deno.serve;
  try { await import('../../supabase/functions/payments-webhook/index.ts'); }
  finally { Deno.serve = original; }
  const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const must = async (q: PromiseLike<any>) => { const r = await q; if (r.error) throw Error(r.error.message); return r.data; };
  for (const scenario of ['normal', 'paid_without_seats']) {
  const event = crypto.randomUUID(), booking = crypto.randomUUID(), replacement = crypto.randomUUID();
  let payment: any;
  try {
    await must(db.from('activity_events').insert({ id: event, category: 'barranquismo', slug: 'guadalmina', title: 'LOCAL WEBHOOK FIXTURE',
      starts_at: new Date(Date.now() + 7 * 86400000).toISOString(), capacity_total: 6, status: 'publicada', event_type: 'open_group' }));
    await must(db.from('bookings').insert({ id: booking, activity: 'LOCAL WEBHOOK FIXTURE', contact: 'fixture@example.test',
      email: 'fixture@example.test', payment_email: 'fixture@example.test', number_of_people: '2', status: 'pendiente_pago' }));
    assert.equal((await must(db.rpc('reserve_event_seats', { _event_id: event, _booking_id: booking, _participants: 2 }))).ok, true);
    payment = await must(db.from('payment_requests').insert({ booking_id: booking, amount_cents: 2100, total_cents: 7000,
      kind: 'senal', currency: 'eur', concept: 'LOCAL WEBHOOK FIXTURE', environment: 'sandbox', customer_email: 'fixture@example.test',
      stripe_session_id: `cs_local_${crypto.randomUUID()}` }).select('*').single());
    const session = { id: payment.stripe_session_id, payment_status: 'paid', livemode: false,
      amount_total: 2100, currency: 'eur', payment_intent: 'pi_local_fixture', metadata: { payment_request_token: payment.token } };
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const invoke = async (changes = {}, invalidSignature = false, age = 0) => {
      const body = JSON.stringify({ id: 'evt_local_fixture', type: 'checkout.session.completed', livemode: false, data: { object: { ...session, ...changes } } });
      const time = Math.floor(Date.now() / 1000) - age;
      const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${time}.${body}`)));
      const hex = Array.from(signature, n => n.toString(16).padStart(2, '0')).join('');
      return await handler(new Request('http://127.0.0.1/webhook?env=sandbox', { method: 'POST',
        headers: { 'stripe-signature': `t=${time},v1=${invalidSignature ? 'invalid' : hex}` }, body }));
    };
    assert.equal((await invoke({}, true)).status, 400);
    assert.equal((await invoke({}, false, 600)).status, 400);
    for (const wrong of [{ amount_total: 2101 }, { currency: 'usd' }, { livemode: true }, { payment_status: 'unpaid' }]) {
      await invoke(wrong);
      assert.equal((await must(db.from('payment_requests').select('status').eq('id', payment.id).single())).status, 'pendiente');
      assert.equal((await must(db.from('activity_event_bookings').select('state').eq('booking_id', booking).single())).state, 'bloqueada');
    }
    if (scenario === 'paid_without_seats') {
      await must(db.rpc('release_event_seats', { _booking_id: booking, _reason: 'local fixture expiry' }));
      await must(db.from('bookings').insert({ id: replacement, activity: 'LOCAL REPLACEMENT FIXTURE', contact: 'fixture@example.test' }));
      assert.equal((await must(db.rpc('reserve_event_seats', { _event_id: event, _booking_id: replacement, _participants: 6 }))).ok, true);
    }
    assert.equal((await invoke()).status, 200);
    const before = await must(db.from('notification_log').select('id,status').eq('payment_request_id', payment.id).order('id'));
    assert.ok(before.length >= 2 && before.every((n: any) => n.status === 'omitido'));
    assert.equal((await invoke()).status, 200);
    assert.deepEqual(await must(db.from('notification_log').select('id,status').eq('payment_request_id', payment.id).order('id')), before);
    assert.equal((await must(db.from('payment_requests').select('status').eq('id', payment.id).single())).status, 'pagado');
    assert.equal((await must(db.from('activity_event_bookings').select('state').eq('booking_id', booking).single())).state, scenario === 'normal' ? 'confirmada' : 'liberada');
    assert.equal((await must(db.from('activity_events').select('seats_reserved').eq('id', event).single())).seats_reserved, scenario === 'normal' ? 2 : 6);
    if (scenario === 'paid_without_seats') {
      const notices = await must(db.from('notification_log').select('kind').eq('payment_request_id', payment.id));
      assert.ok(notices.some((n: any) => n.kind === 'incidencia_plazas_negocio'));
      assert.ok(!notices.some((n: any) => n.kind === 'pago_confirmado_cliente'));
      assert.match((await must(db.from('payment_requests').select('last_error').eq('id', payment.id).single())).last_error, /plazas/);
      assert.equal((await must(db.from('bookings').select('status').eq('id', booking).single())).status, 'incidencia_plazas');
      await must(db.rpc('release_event_seats', { _booking_id: replacement, _reason: 'local recovery fixture' }));
      assert.equal((await invoke()).status, 200);
      assert.equal((await must(db.from('bookings').select('status').eq('id', booking).single())).status, 'confirmada');
      assert.equal((await must(db.from('payment_requests').select('last_error').eq('id', payment.id).single())).last_error, null);
      assert.equal((await must(db.from('activity_events').select('seats_reserved').eq('id', event).single())).seats_reserved, 2);
    }
  } finally {
    await must(db.from('notification_log').delete().eq('booking_id', booking));
    await must(db.from('payment_requests').delete().eq('booking_id', booking));
    await must(db.from('bookings').delete().eq('id', booking));
    await must(db.from('bookings').delete().eq('id', replacement));
    await must(db.from('activity_events').delete().eq('id', event));
  }
  }
});
