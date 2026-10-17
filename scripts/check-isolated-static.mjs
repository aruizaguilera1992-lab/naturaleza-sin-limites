import assert from 'node:assert/strict';
import { preview } from 'vite';

const server = await preview({ configFile: 'vite.isolated.config.ts', mode: 'isolated' });
try {
  const response = await fetch('http://127.0.0.1:8082/', { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  const csp = response.headers.get('content-security-policy');
  assert.ok(csp.includes("frame-src 'none'"));
  assert.ok(csp.includes("form-action 'none'"));
  assert.ok(!csp.includes('https:'));
  const html = await response.text();
  const script = html.match(/src="(\/assets\/[^" ]+\.js)"/)[1];
  const bundle = await fetch(`http://127.0.0.1:8082${script}`, { signal: AbortSignal.timeout(5000) });
  assert.equal(bundle.status, 200);
  const source = await bundle.text();
  assert.ok(source.includes('http://127.0.0.1:8082/local-supabase'));
  assert.ok(source.includes('sb_publishable_'));
  assert.ok(!source.includes('aefoevrwckdifmzkrgrm'));
  console.log('PASS: compiled UI HTML, JavaScript, CSP header and local Supabase endpoint on 127.0.0.1:8082');
} finally {
  server.httpServer.closeAllConnections();
  await new Promise(resolve => server.httpServer.close(resolve));
}
