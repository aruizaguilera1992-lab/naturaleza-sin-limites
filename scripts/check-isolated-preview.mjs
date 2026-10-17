import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Bound startup too: a failed toolchain must not leave the check hanging.
const watchdog = setTimeout(() => {
  console.error('FAIL: isolated preview startup/check exceeded 30 seconds.');
  process.exit(1);
}, 30000);
watchdog.unref();

// Deliberately poison inherited values: the isolated config must override them.
process.env.VITE_SUPABASE_URL = 'https://remote-sentinel.invalid';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'remote-sentinel-key';
process.env.VITE_PAYMENTS_CLIENT_TOKEN = 'remote-sentinel-token';
const server = await createServer({
  configFile: 'vite.isolated.config.ts',
  mode: 'isolated',
});
try {
  await server.listen();
  const response = await fetch('http://127.0.0.1:8081/', {
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, 200);
  const policy = response.headers.get('content-security-policy');
  assert.ok(policy?.includes("form-action 'none'"));
  assert.ok(policy.includes("frame-src 'none'"));
  assert.ok(!policy.includes('https:'));
  const client = await fetch('http://127.0.0.1:8081/src/integrations/supabase/client.ts', {
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(client.status, 200);
  const source = await client.text();
  assert.ok(source.includes('http://127.0.0.1:54321'));
  assert.ok(source.includes('local-ui-preview-placeholder') || source.includes('sb_publishable_'));
  assert.ok(!source.includes('remote-sentinel'));
  assert.equal(server.config.envDir, false);
  assert.equal(server.config.server.host, '127.0.0.1');
  console.log('PASS: HTTP, CSP, local endpoint and inherited credential isolation. Browser navigation and backend remain unverified.');
} finally {
  await server.close();
  clearTimeout(watchdog);
}
