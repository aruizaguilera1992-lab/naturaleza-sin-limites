import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const local = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
assert.equal(local.API_URL, 'http://127.0.0.1:54321');
const db = createClient(local.API_URL, local.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const must = async q => { const r = await q; if (r.error) throw Error(r.error.message); return r.data; };
const event = randomUUID(), email = `edge-${randomUUID()}@example.test`;
const requests = [];
const invoke = (name, body, token = local.ANON_KEY) => fetch(`${local.API_URL}/functions/v1/${name}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', apikey: local.PUBLISHABLE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
});
try {
  const preflight = await fetch(`${local.API_URL}/functions/v1/submit-request`, { method: 'OPTIONS', signal: AbortSignal.timeout(5000) });
  assert.equal(preflight.status, 200);
  assert.ok(preflight.headers.get('access-control-allow-origin'));
  const unauthenticated = await fetch(`${local.API_URL}/functions/v1/submit-request`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(5000),
  });
  assert.equal(unauthenticated.status, 401);
  assert.equal((await invoke('submit-request', {})).status, 400);
  const input = { type: 'booking', activity: 'LOCAL EDGE FIXTURE', numberOfPeople: 6, name: 'Persona ficticia', email, phone: '+34000000000', rgpd: true };
  assert.equal((await invoke('submit-request', { ...input, numberOfPeople: 7 })).status, 400);
  const received = await invoke('submit-request', input, local.PUBLISHABLE_KEY);
  assert.equal(received.status, 200, 'Browser publishable-key transport must work');
  const request = await received.json();
  requests.push(request.id);
  assert.equal(request.ok, true);
  assert.equal(request.notifications.business, 'omitido');
  assert.equal(request.notifications.customer, 'omitido');
  await must(db.from('activity_events').insert({ id: event, category: 'barranquismo', slug: 'guadalmina', title: 'LOCAL EDGE FIXTURE',
    starts_at: new Date(Date.now()+7*86400000).toISOString(), capacity_total: 6, status: 'publicada', event_type: 'open_group', price_cents: 3500 }));
  const depositInput = { requestId: randomUUID(), eventId: event, category: 'barranquismo', slug: 'guadalmina', participants: 6,
    name: 'Persona ficticia', email, phone: '+34000000000', rgpd: true, environment: 'sandbox', origin: 'http://127.0.0.1:8082' };
  const first = await invoke('create-activity-deposit', depositInput, local.PUBLISHABLE_KEY);
  assert.equal(first.status, 200);
  const created = await first.json();
  assert.equal(created.amountCents, 6300); assert.equal(created.totalCents, 21000);
  const retry = await invoke('create-activity-deposit', depositInput, local.PUBLISHABLE_KEY);
  assert.equal(retry.status, 200); assert.equal((await retry.json()).token, created.token);
  const recovery = await invoke('create-activity-deposit', { action: 'recover', requestId: depositInput.requestId }, local.PUBLISHABLE_KEY);
  assert.equal(recovery.status, 200); assert.equal((await recovery.json()).token, created.token);
  assert.equal((await must(db.from('activity_events').select('seats_reserved').eq('id', event).single())).seats_reserved, 6);
  const payment = await must(db.from('payment_requests').select('id,booking_id').eq('token', created.token).single());
  assert.ok((await must(db.from('notification_log').select('status').eq('booking_id', payment.booking_id))).every(n => n.status === 'omitido'));
  assert.equal((await invoke('retry-notification', { id: randomUUID() }, local.ANON_KEY)).status, 401);
  const sessionId = `cs_local_edge_${randomUUID()}`;
  await must(db.from('payment_requests').update({ stripe_session_id: sessionId }).eq('id', payment.id));
  const secret = fs.readFileSync('.tools/local-supabase/edge.env', 'utf8').match(/^PAYMENTS_SANDBOX_WEBHOOK_SECRET=(.+)$/m)?.[1];
  assert.ok(secret?.startsWith('local-fixture-'));
  const signed = JSON.stringify({ id: 'evt_local_edge_fixture', type: 'checkout.session.completed', livemode: false,
    data: { object: { id: sessionId, payment_status: 'paid', livemode: false, amount_total: 6300, currency: 'eur',
      payment_intent: 'pi_local_edge_fixture', metadata: { payment_request_token: created.token } } } });
  const timestamp = Math.floor(Date.now()/1000);
  const signature = createHmac('sha256', secret).update(`${timestamp}.${signed}`).digest('hex');
  const webhook = bad => fetch(`${local.API_URL}/functions/v1/payments-webhook?env=sandbox`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': `t=${timestamp},v1=${bad ? 'invalid' : signature}` },
    body: signed, signal: AbortSignal.timeout(15000),
  });
  assert.equal((await webhook(true)).status, 400);
  assert.equal((await webhook(false)).status, 200);
  const before = await must(db.from('notification_log').select('id,status').eq('payment_request_id', payment.id).order('id'));
  assert.equal((await webhook(false)).status, 200);
  assert.deepEqual(await must(db.from('notification_log').select('id,status').eq('payment_request_id', payment.id).order('id')), before);
  assert.equal((await must(db.from('payment_requests').select('status').eq('id', payment.id).single())).status, 'pagado');
  assert.equal((await must(db.from('activity_event_bookings').select('state').eq('booking_id', payment.booking_id).single())).state, 'confirmada');
  assert.equal((await must(db.from('activity_events').select('seats_reserved').eq('id', event).single())).seats_reserved, 6);
  console.log('PASS: real Edge HTTP/CORS/JWT, browser key, request, deposit, retry, recovery and signed webhook replay; no provider used');
} finally {
  const bookings = await must(db.from('bookings').select('id').eq('email', email));
  for (const row of bookings) {
    await must(db.from('notification_log').delete().eq('booking_id', row.id));
    await must(db.from('payment_requests').delete().eq('booking_id', row.id));
    await must(db.from('bookings').delete().eq('id', row.id));
  }
  await must(db.from('activity_events').delete().eq('id', event));
}
