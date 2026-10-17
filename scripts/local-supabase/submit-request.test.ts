// Integration test of the unchanged Edge entrypoint with the real LOCAL REST API.
// The Deno serve binding is captured; this is not an Edge Runtime deployment.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.test('local booking request persists, rejects seven and omits all email', async () => {
  const settings = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
  if (settings.API_URL !== 'http://127.0.0.1:54321') throw Error('Local API required');
  for (const name of ['RESEND_API_KEY', 'LOVABLE_API_KEY', 'PAYMENTS_CLIENT_TOKEN', 'STRIPE_SECRET_KEY']) Deno.env.delete(name);
  Deno.env.set('SUPABASE_URL', settings.API_URL);
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', settings.SERVICE_ROLE_KEY);
  Deno.env.set('EMAIL_DELIVERY_MODE', 'disabled');
  Deno.env.set('NOTIFICATION_EMAIL', 'owner@example.test');
  let handler: (request: Request) => Promise<Response>;
  const original = Deno.serve;
  // Only replace the transport registration, never application permissions.
  Deno.serve = ((fn: typeof handler) => { handler = fn; return {}; }) as typeof Deno.serve;
  try { await import('../../supabase/functions/submit-request/index.ts'); }
  finally { Deno.serve = original; }
  const db = createClient(settings.API_URL, settings.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = `local-request-${crypto.randomUUID()}@example.test`;
  const input = { type: 'booking', activity: 'LOCAL FIXTURE', numberOfPeople: 6,
    name: 'Persona ficticia', email, phone: '+34000000000', rgpd: true };
  const invoke = (body: unknown) => handler(new Request('http://127.0.0.1/submit-request', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));
  const check = (ok: boolean, message: string) => { if (!ok) throw Error(message); };
  try {
    check((await invoke({ ...input, numberOfPeople: 7 })).status === 400, 'Seven participants must fail');
    check((await invoke({ ...input, rgpd: false })).status === 400, 'Missing consent must fail');
    const result = await invoke(input);
    const response = await result.json();
    check(result.status === 200 && response.ok, 'Valid local request must succeed');
    const { data, error } = await db.from('bookings').select('id,number_of_people,email').eq('email', email);
    check(!error && data?.length === 1 && data[0].number_of_people === '6', 'Exactly one six-person booking required');
    const notifications = await db.from('notification_log').select('status').eq('booking_id', data![0].id);
    check(!notifications.error && !!notifications.data?.length && notifications.data.every(n => n.status === 'omitido'), 'All notifications must be omitted');
  } finally {
    const bookings = await db.from('bookings').select('id').eq('email', email);
    for (const row of bookings.data ?? []) {
      const n = await db.from('notification_log').delete().eq('booking_id', row.id);
      check(!n.error, 'Notification cleanup failed');
    }
    check(!(await db.from('bookings').delete().eq('email', email)).error, 'Booking cleanup failed');
  }
});
