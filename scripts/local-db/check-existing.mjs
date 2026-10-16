/* global process, console */
import fs from "node:fs";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import postgres from "postgres";
import { validateTarget } from "./target.mjs";

const [flag, name, ...extra] = process.argv.slice(2);
if (flag !== "--database" || extra.length) throw new Error("Expected --database nsl_rebuild_<name>");
const config = JSON.parse(fs.readFileSync(".tools/local-postgres/credentials.local.json", "utf8"));
const sql = postgres({ ...validateTarget(config, name), max: 1, onnotice: () => {} });
try {
  const snapshot = () => sql`SELECT
    (SELECT count(*)::int FROM drizzle.__drizzle_migrations) AS migrations,
    (SELECT count(*)::int FROM bookings) AS bookings,
    (SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public') AS tables`;
  const before = await snapshot();
  const result = spawnSync(process.execPath, ["scripts/rebuild-local-db.mjs", "--database", name], {
    encoding: "utf8", windowsHide: true, timeout: 10000,
  });
  assert.equal(result.status, 1);
  const response = JSON.parse(result.stdout.trim());
  assert.equal(response.failure.stage, "target");
  assert.equal(response.failure.message, "Database already exists; refusing to overwrite or migrate it");
  assert.deepEqual(await snapshot(), before);
  console.log("Existing database refused; table, history and booking counts unchanged.");
} finally { await sql.end(); }
