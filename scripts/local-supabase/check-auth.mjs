import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';

const local = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8').replace(/^\uFEFF/, ''));
assert.equal(local.API_URL, 'http://127.0.0.1:54321');
const target = new URL(local.DB_URL);
assert.equal(target.hostname, '127.0.0.1');
assert.equal(target.port, '54322');
assert.equal(target.pathname, '/postgres');
const sql = postgres(local.DB_URL, { max: 1, connect_timeout: 5, onnotice: () => {} });
const created = [];
const eventId = randomUUID();
const password = `${randomUUID()}Aa9!`;
const request = (route, init = {}, admin = false) => fetch(local.API_URL + route, {
  ...init,
  headers: { apikey: local.PUBLISHABLE_KEY, 'Content-Type': 'application/json',
    ...(admin ? { Authorization: `Bearer ${local.SERVICE_ROLE_KEY}` } : {}), ...init.headers },
  signal: AbortSignal.timeout(10000),
});
try {
  await sql`INSERT INTO public.activity_events(id,category,slug,title,starts_at,capacity_total,status,event_type)
    VALUES(${eventId},'barranquismo','local-auth-fixture','LOCAL AUTH FIXTURE',now()+interval '10 days',6,'publicada','open_group')`;
  for (const role of ['user', 'admin']) {
    // Confirm fictitious users through the LOCAL Auth admin API, without sending mail.
    const email = `nsl-local-${role}-${randomUUID()}@example.test`;
    const response = await request('/auth/v1/admin/users', {
      method: 'POST', body: JSON.stringify({ email, password, email_confirm: true }),
    }, true);
    assert.ok(response.ok, `local create ${role}: ${response.status}`);
    const user = await response.json();
    created.push(user.id);
    if (role === 'admin') await sql`INSERT INTO public.user_roles(user_id,role) VALUES(${user.id},'admin')`;
    const login = await request('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    assert.ok(login.ok, `login ${role}: ${login.status}`);
    const session = await login.json();
    const headers = { Authorization: `Bearer ${session.access_token}` };
    assert.equal((await request('/auth/v1/user', { headers })).status, 200);
    const result = await request(`/rest/v1/activity_events?select=id&id=eq.${eventId}`, { headers });
    // RLS may return an empty array rather than an HTTP error for ordinary users.
    if (role === 'admin') {
      assert.equal(result.status, 200);
      assert.deepEqual(await result.json(), [{ id: eventId }]);
    }
    else if (result.ok) assert.deepEqual(await result.json(), []);
    else assert.ok([401, 403].includes(result.status));
    const roles = await request('/rest/v1/user_roles?select=role', { headers });
    assert.equal(roles.status, 200);
    const assigned = await roles.json();
    assert.equal(assigned.some(r => r.role === 'admin'), role === 'admin');
    console.log(`PASS: ${role} login, validated user and role visibility`);
  }
} finally {
  await sql`DELETE FROM public.activity_events WHERE id=${eventId}`;
  for (const id of created) {
    await sql`DELETE FROM public.user_roles WHERE user_id=${id}`;
    const removed = await request(`/auth/v1/admin/users/${id}`, { method: 'DELETE' }, true);
    assert.ok(removed.ok, 'Fixture user cleanup failed');
  }
  await sql.end();
}
