// Local provider double around the unmodified production HTTP handlers.
// Deno network permission must be limited to 127.0.0.1:54321,127.0.0.1:54327.
import assert from 'node:assert/strict';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleDeposit } from '../../supabase/functions/create-activity-deposit/handler.ts';

const local = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
assert.equal(local.API_URL, 'http://127.0.0.1:54321');
for (const key of ['STRIPE_LIVE_API_KEY', 'RESEND_API_KEY', 'PAYMENTS_LIVE_WEBHOOK_SECRET']) Deno.env.delete(key);
Deno.env.set('SUPABASE_URL', local.API_URL);
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', local.SERVICE_ROLE_KEY);
Deno.env.set('STRIPE_SANDBOX_API_KEY', 'local-dummy-connection');
Deno.env.set('LOVABLE_API_KEY', 'local-dummy-gateway');
Deno.env.set('PAYMENTS_LIVE_ENABLED', 'false');
Deno.env.set('EMAIL_DELIVERY_MODE', 'disabled');
Deno.env.set('NOTIFICATION_EMAIL', 'owner@example.test');
const secret = `local-only-${crypto.randomUUID()}`;
Deno.env.set('PAYMENTS_SANDBOX_WEBHOOK_SECRET', secret);
const db = createClient(local.API_URL, local.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const must = async <T>(query: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<NonNullable<T>> => { const result = await query; if (result.error) throw Error(result.error.message); assert.notEqual(result.data, null); return result.data!; };
type Session = { id: string; object: string; client_secret: string; expires_at: number; status: string; payment_status: string;
  livemode: boolean; amount_total: number; currency: string; return_url: string; metadata: { payment_request_token: string; environment: string } };
const sessions = new Map<string, Session>();
const keys = new Map<string, { params: string; session: Session }>();
const realFetch = globalThis.fetch;
let firstCreate = true, createCalls = 0, blocked = 0;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.origin === 'https://connector-gateway.lovable.dev' && url.pathname.startsWith('/stripe/v1/checkout/sessions')) {
    const method = init?.method ?? 'GET';
    if (method === 'POST' && url.pathname.endsWith('/sessions')) {
      createCalls++;
      const key = new Headers(init?.headers).get('Idempotency-Key'); assert.ok(key);
      const encoded = String(init?.body ?? '');
      const params = new URLSearchParams(encoded);
      if (keys.has(key)) assert.equal(keys.get(key)!.params, encoded);
      else {
        const id = `cs_local_${crypto.randomUUID()}`;
        const session = { id, object: 'checkout.session', client_secret: `${id}_secret_local`,
          expires_at: Number(params.get('expires_at')), status: 'open', payment_status: 'unpaid', livemode: false,
          amount_total: Number(params.get('line_items[0][price_data][unit_amount]')), currency: 'eur',
          return_url: params.get('return_url')!, metadata: { payment_request_token: params.get('metadata[payment_request_token]')!, environment: 'sandbox' } };
        sessions.set(id, session); keys.set(key, { params: encoded, session });
      }
      if (firstCreate) { firstCreate = false; return Response.json({ error: { type: 'invalid_request_error', message: 'LOCAL simulated lost response after creation' } }, { status: 400 }); }
      return Response.json(keys.get(key)!.session);
    }
    const session = sessions.get(url.pathname.split('/').at(-1)!);
    assert.ok(session, 'Unknown local session');
    return Response.json(session);
  }
  if (url.origin !== local.API_URL) { blocked++; throw Error('External network forbidden'); }
  return realFetch(input, init);
};
type Handler = (req: Request) => Response | Promise<Response>;
const realServe = Deno.serve;
let captured: Handler;
Deno.serve = ((handler: Handler) => { captured = handler; return {} as Deno.HttpServer; }) as typeof Deno.serve;
await import('../../supabase/functions/get-payment/index.ts');
const getPayment = captured!;
await import('../../supabase/functions/payments-webhook/index.ts');
const webhook = captured!;
Deno.serve = realServe;
let fixture: { event: string; email: string; token: string } | undefined;
const evidence = async () => {
  assert.ok(fixture);
  const payments = await must(db.from('payment_requests').select('id,status,booking_id,stripe_session_id').eq('token', fixture.token));
  assert.equal(payments.length, 1);
  const payment = payments[0];
  const hold = await must(db.from('activity_event_bookings').select('state').eq('booking_id', payment.booking_id).single());
  const event = await must(db.from('activity_events').select('seats_reserved').eq('id', fixture.event).single());
  const notifications = await must(db.from('notification_log').select('status').eq('booking_id', payment.booking_id));
  assert.ok(notifications.every(row => row.status === 'omitido'));
  return { paymentStatus: payment.status, seatState: hold.state, seats: event.seats_reserved,
    providerSessions: sessions.size, createCalls, notificationsOmitted: true, externalCalls: blocked };
};
realServe({ hostname: '127.0.0.1', port: 54327 }, async req => {
  try {
    // Refuse browser cross-origin writes and DNS rebinding before any fixture work.
    const origin = req.headers.get('origin');
    if (!['127.0.0.1:54327', '127.0.0.1:8082'].includes(req.headers.get('host') ?? '') ||
        (origin && origin !== 'http://127.0.0.1:8082') || req.headers.get('sec-fetch-site') === 'cross-site' ||
        (req.method === 'POST' && !req.headers.get('content-type')?.startsWith('application/json'))) {
      return new Response('Forbidden', { status: 403 });
    }
    const path = new URL(req.url).pathname;
    if (path === '/get-payment') return await getPayment(req);
    if (path === '/fixture' && req.method === 'POST') {
      assert.equal(fixture, undefined);
      const event = crypto.randomUUID(), email = `browser-payment-${crypto.randomUUID()}@example.test`;
      fixture = { event, email, token: '' };
      await must(db.from('activity_events').insert({ id: event, category: 'barranquismo', slug: 'guadalmina', title: 'LOCAL PAYMENT FIXTURE',
        starts_at: new Date(Date.now()+7*86400000).toISOString(), capacity_total: 6, status: 'publicada', event_type: 'open_group', price_cents: 3500 }));
      const result = await handleDeposit({ requestId: crypto.randomUUID(), eventId: event, participants: 2, category: 'barranquismo', slug: 'guadalmina',
        name: 'Persona ficticia', email, phone: '+34000000000', rgpd: true, environment: 'sandbox', origin: 'http://127.0.0.1:8082' },
      { db, notify: async () => ({ status: 'omitido' }), businessRecipients: () => [] });
      assert.equal(result.status, 200); fixture.token = String(result.body.token);
      return Response.json({ path: `/pago/${fixture.token}` });
    }
    if (path === '/complete' && req.method === 'POST') {
      const body = await req.json();
      const session = [...sessions.values()].find(s => s.client_secret === body.clientSecret); assert.ok(session);
      session.status = 'complete'; session.payment_status = 'paid';
      const payload = JSON.stringify({ id: 'evt_local_browser_fixture', type: 'checkout.session.completed', livemode: false, data: { object: session } });
      const timestamp = Math.floor(Date.now()/1000);
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signature = [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`)))].map(b => b.toString(16).padStart(2,'0')).join('');
      const request = () => new Request('http://127.0.0.1:54327/webhook?env=sandbox', { method: 'POST', headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` }, body: payload });
      assert.equal((await webhook(request())).status, 200);
      assert.equal((await webhook(request())).status, 200);
      const proof = await evidence(); assert.equal(proof.paymentStatus, 'pagado'); assert.equal(proof.seatState, 'confirmada'); assert.equal(proof.seats, 2); assert.equal(proof.providerSessions, 1);
      return Response.json({ returnUrl: session.return_url.replace('{CHECKOUT_SESSION_ID}', session.id) });
    }
    if (path === '/evidence') return Response.json(await evidence());
    if (path === '/cleanup' && req.method === 'POST') {
      if (fixture) {
        for (const booking of await must(db.from('bookings').select('id').eq('email', fixture.email))) {
          await must(db.from('notification_log').delete().eq('booking_id', booking.id));
          await must(db.from('payment_requests').delete().eq('booking_id', booking.id));
          await must(db.from('bookings').delete().eq('id', booking.id));
        }
        await must(db.from('activity_events').delete().eq('id', fixture.event)); fixture = undefined;
      }
      return Response.json({ cleaned: true });
    }
    return new Response('Not found', { status: 404 });
  } catch (error) { console.error('Local simulation failed:', String(error)); return Response.json({ error: 'local_simulation_failed' }, { status: 500 }); }
});
