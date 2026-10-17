import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, openSync, closeSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Per-process Docker API adapter. Never changes Docker daemon defaults.
const root = process.cwd();
if (!existsSync(path.join(root, 'scripts/local-supabase/config.toml'))) throw Error('Run from repository root');
const project = 'nsl-isolated-local';
const docker = [
  'C:/Program Files/Docker/Docker/resources/bin/docker.exe',
  path.join(process.env.LOCALAPPDATA, 'Programs/DockerDesktop/resources/bin/docker.exe'),
].find(existsSync);
if (!docker) throw Error('Docker not found');
const context = JSON.parse(execFileSync(docker, ['context', 'inspect', 'desktop-linux'], { encoding: 'utf8' }))[0];
const host = context.Endpoints.docker.Host;
if (!host.startsWith('npipe://')) throw Error('Only a local Docker named pipe is permitted');
const socketPath = host.replace('npipe:////./pipe/', '\\\\.\\pipe\\');
let rewritten = 0;
const proxy = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', b => chunks.push(b));
  req.on('end', () => {
    try {
      let body = Buffer.concat(chunks);
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'POST' && /\/containers\/create$/.test(url.pathname)) {
        if (!url.searchParams.get('name')?.endsWith(`_${project}`)) throw Error('Unexpected container project');
        const spec = JSON.parse(body.toString());
        for (const bindings of Object.values(spec.HostConfig?.PortBindings ?? {})) {
          for (const binding of bindings ?? []) {
            binding.HostIp = '127.0.0.1';
            rewritten++;
          }
        }
        body = Buffer.from(JSON.stringify(spec));
      }
      const headers = { ...req.headers };
      delete headers['transfer-encoding'];
      headers['content-length'] = String(body.length);
      const upstream = http.request({ socketPath, path: req.url, method: req.method, headers }, response => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      });
      upstream.on('error', () => { res.writeHead(502); res.end('Local Docker pipe unavailable'); });
      upstream.end(body);
    } catch {
      res.writeHead(403); res.end('Local project guard rejected request');
    }
  });
});
// Windows named pipe only: there is no TCP endpoint for a webpage to reach.
// Same-user native processes already have access to Docker's original pipe.
const pipeName = `nsl-isolated-${randomUUID()}`;
await new Promise((resolve, reject) => {
  proxy.once('error', reject);
  proxy.listen(`\\\\.\\pipe\\${pipeName}`, resolve);
});
const log = openSync('.tools/local-supabase/guarded-start.log', 'a');
try {
  const command = process.argv[2] === 'edge'
    ? ['functions', 'serve', '--env-file', '.tools/local-supabase/edge.env'] : ['start'];
  const child = spawn('.tools/local-supabase/bin/supabase.exe', [
    ...command, '--workdir', '.tools/local-supabase/project', '--network-id', project,
  ], {
    env: { ...process.env, PATH: `${path.dirname(docker)};${process.env.PATH}`, DOCKER_HOST: `npipe:////./pipe/${pipeName}`, DOCKER_CONTEXT: '' },
    stdio: ['ignore', log, log], windowsHide: true,
  });
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  if (code !== 0) throw Error(`Supabase failed (${code}); inspect ignored guarded-start.log locally`);
  const names = execFileSync(docker, ['--context', 'desktop-linux', 'ps', '--filter', `name=_${project}`, '--format', '{{.Names}}'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  if (!names.length) throw Error('No running local services');
  const containers = JSON.parse(execFileSync(docker, ['--context', 'desktop-linux', 'inspect', ...names], { encoding: 'utf8' }));
  const unsafe = containers.some(c => Object.values(c.NetworkSettings.Ports ?? {}).some(bindings => (bindings ?? []).some(b => b.HostIp !== '127.0.0.1')));
  if (unsafe) {
    execFileSync(docker, ['--context', 'desktop-linux', 'stop', ...names]);
    throw Error('Unsafe binding detected; local project stopped');
  }
  console.log(JSON.stringify({ services: names, rewrittenBindings: rewritten, verifiedLoopback: true }));
} finally {
  closeSync(log);
  await new Promise(resolve => proxy.close(resolve));
}
