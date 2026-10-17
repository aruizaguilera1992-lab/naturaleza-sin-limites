import assert from 'node:assert/strict';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { enqueueNotification } from '../../supabase/functions/_shared/email.ts';
Deno.test('local retry endpoint: anonymous 401, user 403, admin allowed without email', async () => {
  const config = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
  assert.equal(config.API_URL, 'http://127.0.0.1:54321');
  Deno.env.set('SUPABASE_URL', config.API_URL); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', config.SERVICE_ROLE_KEY);
  Deno.env.set('EMAIL_DELIVERY_MODE', 'disabled');
  for (const name of ['RESEND_API_KEY', 'LOVABLE_API_KEY']) Deno.env.delete(name);
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, options);
  let handler: (r: Request) => Promise<Response>;
  const serve = Deno.serve;
  Deno.serve = ((fn: typeof handler) => { handler = fn; return {}; }) as typeof Deno.serve;
  try { await import('../../supabase/functions/retry-notification/index.ts'); } finally { Deno.serve = serve; }
  const users: string[] = [];
  let notification: string | undefined;
  const invoke = (token?: string, id = notification) => handler(new Request('http://127.0.0.1/retry', { method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ id }) }));
  try {
    notification = await enqueueNotification(db, { kind: 'contacto_negocio', dedupeKey: `local-retry-auth:${crypto.randomUUID()}`,
      recipients: ['fixture@example.test'], subject: 'LOCAL RETRY AUTH FIXTURE', html: '<p>Local fixture</p>' });
    assert.equal((await invoke()).status, 401);
    for (const role of ['user', 'admin']) {
      const email = `retry-${crypto.randomUUID()}@example.test`, password = `${crypto.randomUUID()}Aa1!`;
      const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
      assert.equal(created.error, null);
      const id = created.data.user!.id; users.push(id);
      if (role === 'admin') assert.equal((await db.from('user_roles').insert({ user_id: id, role: 'admin' })).error, null);
      const client = createClient(config.API_URL, config.PUBLISHABLE_KEY, options);
      const session = await client.auth.signInWithPassword({ email, password });
      assert.equal(session.error, null);
      const token = session.data.session!.access_token;
      if (role === 'user') assert.equal((await invoke(token)).status, 403);
      else {
        assert.equal((await invoke(token, 'invalid-id')).status, 400);
        const response = await invoke(token);
        assert.equal(response.status, 200);
        const result = await response.json();
        assert.equal(result.status, 'omitido'); assert.equal(result.ok, false);
      }
    }
  } finally {
    if (notification) assert.equal((await db.from('notification_log').delete().eq('id', notification)).error, null);
    for (const id of users) {
      assert.equal((await db.from('user_roles').delete().eq('user_id', id)).error, null);
      assert.equal((await db.auth.admin.deleteUser(id)).error, null);
    }
  }
});
