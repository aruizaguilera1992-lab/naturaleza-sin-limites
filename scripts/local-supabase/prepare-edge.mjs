import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const project = '.tools/local-supabase/project';
const configPath = `${project}/supabase/config.toml`;
let config = fs.readFileSync(configPath, 'utf8');
assert.match(config, /^project_id = "nsl-isolated-local"/);
config = config.replace('[edge_runtime]\nenabled = false', '[edge_runtime]\nenabled = true');
for (const [name, verify] of [['submit-request', true], ['create-activity-deposit', false], ['retry-notification', true], ['payments-webhook', false], ['get-payment', false], ['local-egress-check', true]]) {
  if (!config.includes(`[functions.${name}]`)) config += `\n[functions.${name}]\nverify_jwt = ${verify}\n`;
}
fs.writeFileSync(configPath, config);
const destination = `${project}/supabase/functions`;
fs.mkdirSync(`${project}/src/integrations/supabase`, { recursive: true });
fs.copyFileSync('src/integrations/supabase/types.ts', `${project}/src/integrations/supabase/types.ts`);
for (const name of ['_shared', 'submit-request', 'create-activity-deposit', 'retry-notification', 'payments-webhook', 'get-payment']) {
  fs.cpSync(`supabase/functions/${name}`, `${destination}/${name}`, { recursive: true,
    filter: source => fs.statSync(source).isDirectory() || (/\.(ts|json)$/.test(source) && !source.endsWith('.test.ts')) });
}
fs.mkdirSync(path.join(destination, 'local-egress-check'), { recursive: true });
fs.writeFileSync(path.join(destination, 'local-egress-check/index.ts'), `Deno.serve(async () => {
  try { await fetch('https://example.com', { signal: AbortSignal.timeout(2000) }); return Response.json({ blocked: false }); }
  catch { return Response.json({ blocked: true }); }
});\n`);
// Only fixture settings. No provider key is ever copied or loaded.
const envFile = '.tools/local-supabase/edge.env';
const previous = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8').match(/^PAYMENTS_SANDBOX_WEBHOOK_SECRET=(.+)$/m)?.[1] : null;
fs.writeFileSync(envFile, 'EMAIL_DELIVERY_MODE=disabled\nNOTIFICATION_EMAIL=owner@example.test\nPAYMENTS_LIVE_ENABLED=false\nPAYMENTS_SANDBOX_WEBHOOK_SECRET=' + (previous ?? `local-fixture-${randomUUID()}`) + '\n');
console.log('Prepared five local function copies and an egress canary; provider API credentials absent');
