import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const config = JSON.parse(fs.readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
assert.equal(config.API_URL, 'http://127.0.0.1:54321');
const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const file = '.tools/local-supabase/panel-fixture.json';
const must = async q => { const r = await q; if (r.error) throw Error(r.error.message); return r.data; };
if (process.argv[2] === 'create') {
  assert.ok(!fs.existsSync(file), 'Fixture already exists; remove it first');
  const ids = { event: randomUUID(), booking: randomUUID(), user: null };
  fs.writeFileSync(file, JSON.stringify(ids));
  const user = await must(db.auth.admin.createUser({ email: 'local-panel-fixture@example.test',
    password: 'LocalOnly-NSL-Fixture-2026!', email_confirm: true }));
  ids.user = user.user.id;
  fs.writeFileSync(file, JSON.stringify(ids));
  await must(db.from('user_roles').insert({ user_id: ids.user, role: 'admin' }));
  await must(db.from('activity_events').insert({ id: ids.event, title: 'LOCAL PANEL FIXTURE', category: 'barranquismo',
    slug: 'guadalmina', capacity_total: 6, seats_reserved: 6, status: 'completa', event_type: 'open_group',
    starts_at: new Date(Date.now() + 86400000 * 7).toISOString() }));
  await must(db.from('bookings').insert({ id: ids.booking, event_id: ids.event, activity: 'LOCAL PANEL - SIN PLAZA',
    contact: 'fixture@example.test', name: 'Persona ficticia local', status: 'confirmada', number_of_people: '2' }));
  await must(db.from('payment_requests').insert({ booking_id: ids.booking, amount_cents: 2100, total_cents: 7000,
    kind: 'senal', currency: 'eur', concept: 'LOCAL PANEL FIXTURE', status: 'pagado', environment: 'sandbox',
    paid_at: new Date().toISOString(), last_error: 'plazas: sin_plazas' }));
  console.log('Local admin and legacy incident fixture ready; synthetic test credentials only');
} else if (process.argv[2] === 'remove') {
  const ids = JSON.parse(fs.readFileSync(file, 'utf8'));
  await must(db.from('payment_requests').delete().eq('booking_id', ids.booking));
  await must(db.from('bookings').delete().eq('id', ids.booking));
  await must(db.from('activity_events').delete().eq('id', ids.event));
  if (ids.user) {
    await must(db.from('user_roles').delete().eq('user_id', ids.user));
    await must(db.auth.admin.deleteUser(ids.user));
  }
  fs.unlinkSync(file);
  console.log('Local panel fixture and test admin removed');
} else throw Error('Use create or remove');
