/* eslint-env node */
/* global process, fetch, console */
import assert from "node:assert/strict";
import { writeFile, unlink } from "node:fs/promises";
import { get } from "node:http";
import { loadConfigFromFile, createServer } from "vite";

// Exercise Vite's network/file boundary with the project's settings, without
// application plugins, provider calls, or real credentials.
const loaded = await loadConfigFromFile({ command: "serve", mode: "development" });
assert.ok(loaded);
assert.equal(loaded.config.server.host, "127.0.0.1");
assert.equal(loaded.config.preview.host, "127.0.0.1");
const fixture = `.env.security-check-${process.pid}`;
const marker = "SYNTHETIC_SECURITY_CHECK_ONLY";
await writeFile(fixture, marker, { flag: "wx" });
let server;
try {
  server = await createServer({
    ...loaded.config,
    configFile: false,
    plugins: [],
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { ...loaded.config.server, port: 0, open: false },
  });
  await server.listen();
  const address = server.httpServer.address();
  assert.equal(address.address, "127.0.0.1");
  const base = `http://127.0.0.1:${address.port}`;
  assert.equal((await fetch(`${base}/@vite/client`)).status, 200);
  const origin = await fetch(`${base}/@vite/client`, { headers: { Origin: "https://untrusted.example" } });
  assert.equal(origin.headers.get("access-control-allow-origin"), null);
  // Use raw HTTP: fetch implementations may replace a supplied Host header.
  const hostStatus = await new Promise((resolve, reject) => {
    get(base, { headers: { Host: "untrusted.example" } }, (response) => {
      response.resume();
      resolve(response.statusCode);
    }).on("error", reject);
  });
  assert.equal(hostStatus, 403);
  for (const suffix of ["?raw", "::$DATA?raw", ":$DATA?raw"]) {
    const response = await fetch(`${base}/${fixture}${suffix}`);
    // A nonexistent named stream may use the SPA fallback. It must never
    // expose the file, and actual env/default-stream requests must be denied.
    if (suffix !== ":$DATA?raw") assert.ok(response.status >= 400, `Sensitive path must fail (${suffix})`);
    else if (response.ok) assert.ok(response.headers.get("content-type")?.includes("text/html"));
    assert.equal((await response.text()).includes(marker), false);
  }
  console.log("Security checks passed: loopback, hostile Origin/Host, sensitive paths; Vite client remains available.");
} finally {
  await server?.close();
  await unlink(fixture);
}
