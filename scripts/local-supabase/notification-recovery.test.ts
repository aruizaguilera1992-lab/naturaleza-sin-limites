import assert from 'node:assert/strict';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { enqueueNotification, dispatchNotification } from '../../supabase/functions/_shared/email.ts';

Deno.test('local notification recovers failed response with same provider idempotency key', async () => {
  const config = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
  assert.equal(config.API_URL, 'http://127.0.0.1:54321');
  const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  Deno.env.set('RESEND_API_KEY', 'local-dummy-connection');
  Deno.env.set('LOVABLE_API_KEY', 'local-dummy-gateway');
  Deno.env.set('EMAIL_DELIVERY_MODE', 'test');
  Deno.env.set('EMAIL_TEST_RECIPIENTS', 'fixture@example.test');
  const fetchReal = globalThis.fetch;
  const keys: string[] = [];
  const accepted = new Map<string, string>();
  // Exact provider URL is intercepted in memory; all other external URLs fail closed.
  globalThis.fetch = async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url === 'https://connector-gateway.lovable.dev/resend/emails') {
      const key = new Headers(init?.headers).get('Idempotency-Key');
      assert.ok(key);
      keys.push(key);
      if (!accepted.has(key)) accepted.set(key, 'local-provider-fixture');
      if (keys.length === 1) return new Response('simulated provider error after acceptance', { status: 500 });
      return Response.json({ id: accepted.get(key) });
    }
    assert.equal(new URL(url).origin, 'http://127.0.0.1:54321');
    return fetchReal(input, init);
  };
  let id: string | undefined;
  try {
    id = await enqueueNotification(db, { kind: 'contacto_negocio', dedupeKey: `local-recovery:${crypto.randomUUID()}`,
      recipients: ['fixture@example.test'], subject: 'LOCAL RECOVERY FIXTURE', html: '<p>Fictitious local message</p>' });
    assert.equal((await dispatchNotification(db, id)).status, 'fallido');
    const results = await Promise.all([dispatchNotification(db, id), dispatchNotification(db, id)]);
    assert.equal(results.filter(r => r.status === 'enviado').length, 1);
    assert.ok(results.every(r => ['enviado', 'ya_enviado', 'reclamado_por_otro'].includes(r.status)));
    assert.equal(keys.length, 2);
    assert.equal(keys[0], keys[1]);
    assert.equal(accepted.size, 1);
    assert.equal((await dispatchNotification(db, id)).status, 'ya_enviado');
    assert.equal(keys.length, 2);
    const stored = await db.from('notification_log').select('status,provider_id').eq('id', id).single();
    assert.equal(stored.error, null);
    assert.equal(stored.data?.status, 'enviado');
    assert.equal(stored.data?.provider_id, 'local-provider-fixture');
  } finally {
    globalThis.fetch = fetchReal;
    for (const name of ['RESEND_API_KEY', 'LOVABLE_API_KEY']) Deno.env.delete(name);
    Deno.env.set('EMAIL_DELIVERY_MODE', 'disabled');
    if (id) assert.equal((await db.from('notification_log').delete().eq('id', id)).error, null);
  }
});
