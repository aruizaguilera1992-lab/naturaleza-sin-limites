import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Never logs secret values. Includes new non-ignored files before staging.
const files = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
  { encoding: 'utf8' }).split('\0').filter(Boolean))];
assert.ok(!files.some(file => /(^|\/)\.env($|\.)/.test(file) && !file.endsWith('.env.example')), '.env must not be versioned');
assert.ok(!files.some(file => file.startsWith('.tools/local-supabase/') || file.startsWith('.tools/local-postgres/')), 'Local runtime must be ignored');
const secrets = [];
for (const file of ['.tools/local-supabase/status.local.json', '.tools/local-postgres/credentials.local.json']) {
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const name of ['SERVICE_ROLE_KEY', 'SECRET_KEY', 'JWT_SECRET', 'password']) {
    if (typeof data[name] === 'string' && data[name].length >= 16) secrets.push(data[name]);
  }
  if (data.DB_URL) secrets.push(decodeURIComponent(new URL(data.DB_URL).password));
}
const leaks = [];
for (const file of files) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const content = fs.readFileSync(file);
  if (secrets.some(secret => secret.length >= 16 && content.includes(Buffer.from(secret))) ||
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content.toString('utf8'))) leaks.push(file);
}
assert.deepEqual(leaks, [], 'Private local credential leaked into a versionable file');
console.log(`PASS: ${files.length} versionable paths checked; .env and local runtime ignored; no known local private credential or PEM private key`);
