import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
const docker = ['C:/Program Files/Docker/Docker/resources/bin/docker.exe',
  path.join(process.env.LOCALAPPDATA, 'Programs/DockerDesktop/resources/bin/docker.exe')].find(existsSync);
const run = args => execFileSync(docker, ['--context', 'desktop-linux', ...args], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
const edge = 'supabase_edge_runtime_nsl-isolated-local', kong = 'supabase_kong_nsl-isolated-local';
const network = 'nsl-edge-internal';
const initial = JSON.parse(run(['inspect', edge]))[0];
assert.ok(initial.State.Running);
for (const key of ['STRIPE_SANDBOX_API_KEY','STRIPE_LIVE_API_KEY','RESEND_API_KEY','LOVABLE_API_KEY']) {
  assert.ok(!(initial.Config.Env ?? []).some(value => value.startsWith(`${key}=`) && value.length > key.length + 1), `Provider credential must be absent: ${key}`);
}
const config = JSON.parse(readFileSync('.tools/local-supabase/status.local.json', 'utf8'));
assert.equal(config.API_URL, 'http://127.0.0.1:54321');
const ready = async () => {
  for (let attempt = 0; attempt < 20; attempt++) {
    try { if ((await fetch(`${config.API_URL}/auth/v1/health`, { headers: { apikey: config.PUBLISHABLE_KEY }, signal: AbortSignal.timeout(1000) })).ok) return; }
    catch { /* Local gateway is restarting. */ }
    await delay(300);
  }
  throw Error('Local gateway did not become ready');
};
await ready();
// Warm module dependencies only: OPTIONS handlers do not write or call providers.
for (const name of ['submit-request', 'create-activity-deposit', 'retry-notification', 'get-payment', 'payments-webhook']) {
  const response = await fetch(`${config.API_URL}/functions/v1/${name}`, { method: name === 'payments-webhook' ? 'GET' : 'OPTIONS',
    headers: { apikey: config.PUBLISHABLE_KEY, Authorization: `Bearer ${config.ANON_KEY}` }, signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, name === 'payments-webhook' ? 405 : 200, `Module warmup ${name}`);
  await response.text();
}
if (!run(['network', 'ls', '--filter', `name=^${network}$`, '--format', '{{.Name}}']).trim()) run(['network', 'create', '--internal', network]);
assert.equal(JSON.parse(run(['network', 'inspect', network]))[0].Internal, true);
for (const [container, alias] of [[kong, 'kong'], [edge, 'edge-runtime']]) {
  if (!JSON.parse(run(['inspect', container]))[0].NetworkSettings.Networks[network])
    run(['network', 'connect', '--alias', alias, '--alias', container, network, container]);
}
let changed = false;
for (const name of Object.keys(JSON.parse(run(['inspect', edge]))[0].NetworkSettings.Networks)) {
  if (name !== network) { run(['network', 'disconnect', name, edge]); changed = true; }
}
if (changed) { run(['restart', kong]); await ready(); }
const inspected = JSON.parse(run(['inspect', edge]))[0];
assert.deepEqual(Object.keys(inspected.NetworkSettings.Networks), [network]);
assert.ok(Object.values(inspected.NetworkSettings.Ports ?? {}).every(bindings => !bindings?.length));
const response = await fetch(`${config.API_URL}/functions/v1/local-egress-check`, {
  headers: { apikey: config.PUBLISHABLE_KEY, Authorization: `Bearer ${config.ANON_KEY}` }, signal: AbortSignal.timeout(10000) });
assert.equal(response.status, 200);
assert.equal((await response.json()).blocked, true);
console.log('PASS: Edge Runtime only on internal Docker network, no published ports, external canary blocked');
