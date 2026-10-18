/* global process, console */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import postgres from "postgres";
import ts from "typescript";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { validateTarget } from "./local-db/target.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (!args.length || args[0] === "--help") {
  console.log("Usage: node scripts/rebuild-local-db.mjs --database nsl_rebuild_<new_name>\nUses only the dedicated local PostgreSQL instance; never replaces an existing database.");
} else {
  if (args.length !== 2 || args[0] !== "--database") throw new Error("Expected --database nsl_rebuild_<new_name>");
  process.chdir(root);
  const directory = path.join(root, ".tools/local-postgres");
  const config = JSON.parse(fs.readFileSync(path.join(directory, "credentials.local.json"), "utf8"));
  const target = validateTarget(config, args[1]);
  const options = { ...target, max: 1, prepare: false, connect_timeout: 3, onnotice: () => {} };
  const admin = postgres({ ...options, database: "postgres" });
  let sql;
  const report = {
    database: target.database, source: "repository SQL with explicit LOCAL fixture baseline",
    productionEquivalent: false, authService: false, providersUsed: false,
    baseline: ["contact_submissions before Supabase", "bookings.discount_cents before Drizzle"],
    platform: ["local NOLOGIN roles", "auth.users/auth.uid stand-ins", "pgcrypto and extensions search_path"],
    files: [], checks: [],
  };
  let stage = "target";
  try {
    if ((await admin`SELECT 1 FROM pg_database WHERE datname=${target.database}`).length) {
      throw new Error("Database already exists; refusing to overwrite or migrate it");
    }
    for (const role of ["anon", "authenticated", "service_role", "postgres"]) {
      if (!(await admin`SELECT 1 FROM pg_roles WHERE rolname=${role}`).length) {
        await admin.unsafe(`CREATE ROLE ${role} NOLOGIN${role === "service_role" ? " BYPASSRLS" : role === "postgres" ? " SUPERUSER" : ""}`);
      }
    }
    await admin`CREATE DATABASE ${admin(target.database)}`;
    await admin`ALTER DATABASE ${admin(target.database)} SET search_path TO public, extensions`;
    await admin`COMMENT ON DATABASE ${admin(target.database)} IS 'NSL LOCAL FIXTURE ONLY; not a production copy'`;
    sql = postgres(options);
    const apply = async (file) => {
      stage = file;
      const text = fs.readFileSync(path.join(root, file), "utf8");
      await sql.begin((tx) => tx.unsafe(text));
      report.files.push({ file, sha256: createHash("sha256").update(text).digest("hex") });
    };
    await apply("scripts/local-db/platform.sql");
    await apply("scripts/local-db/before-supabase.sql");
    for (const file of fs.readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort()) {
      await apply(`supabase/migrations/${file}`);
    }
    await apply("scripts/local-db/before-drizzle.sql");
    stage = "native Drizzle migration";
    await migrate(drizzle(sql), { migrationsFolder: "drizzle/migrations" });
    const history = await sql`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`;
    assert.equal(history.length, 14);
    await migrate(drizzle(sql), { migrationsFolder: "drizzle/migrations" });
    assert.deepEqual(await sql`SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`, history);
    report.checks.push("14 native migration entries; second pass unchanged");
    report.history = history;

    stage = "generated column inventory";
    const source = ts.createSourceFile("types.ts", fs.readFileSync("src/integrations/supabase/types.ts", "utf8"), ts.ScriptTarget.Latest, true);
    const database = source.statements.find((s) => ts.isTypeAliasDeclaration(s) && s.name.text === "Database");
    const member = (node, key) => node.members.find((m) => m.name?.getText(source).replaceAll('"', "") === key).type;
    const tables = member(member(database.type, "public"), "Tables");
    const actual = await sql`SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public'`;
    const missing = [];
    for (const table of tables.members) {
      const name = table.name.getText(source).replaceAll('"', "");
      const columns = member(table.type, "Row").members.map((m) => m.name.getText(source).replaceAll('"', ""));
      for (const column of columns) if (!actual.some((r) => r.table_name === name && r.column_name === column)) missing.push(`${name}.${column}`);
    }
    assert.deepEqual(missing, []);
    report.checks.push(`${tables.members.length} generated table column inventories matched (not a type/default/RLS certification)`);

    stage = "privacy regression";
    const user = "30000000-0000-4000-a000-000000000001";
    await sql`INSERT INTO user_roles(user_id,role) VALUES(${user},'admin')`;
    await sql.unsafe(fs.readFileSync("supabase/tests/step1_event_privacy.sql", "utf8"));
    await sql`DELETE FROM user_roles WHERE user_id=${user}`;
    report.checks.push("existing role/privacy regression passed with local auth stand-in");

    stage = "native concurrent reservations";
    const event = "10000000-0000-4000-a000-000000000001";
    const bookings = ["20000000-0000-4000-b000-000000000001", "20000000-0000-4000-b000-000000000002", "20000000-0000-4000-b000-000000000003"];
    const a = postgres(options), b = postgres(options);
    try {
      await sql`INSERT INTO activity_events(id,category,slug,title,starts_at,capacity_total,status,event_type)
        VALUES(${event},'barranquismo','local-fixture','LOCAL FIXTURE',now()+interval '10 days',6,'publicada','open_group')`;
      for (const id of bookings) await sql`INSERT INTO bookings(id,activity,contact,discount_cents,discount_percent)
        VALUES(${id},'LOCAL FIXTURE','fixture@example.test',1500,25)`;
      assert.equal((await sql`SELECT reserve_event_seats(${event}::uuid,${bookings[0]}::uuid,4,30) AS result`)[0].result.ok, true);
      assert.notEqual((await a`SELECT pg_backend_pid() AS pid`)[0].pid, (await b`SELECT pg_backend_pid() AS pid`)[0].pid);
      let ready;
      const locked = new Promise((resolve) => { ready = resolve; });
      const winner = a.begin(async (tx) => {
        await tx`SET LOCAL statement_timeout='5s'`;
        const [row] = await tx`SELECT reserve_event_seats(${event}::uuid,${bookings[1]}::uuid,2,30) AS result`;
        ready();
        await tx`SELECT pg_sleep(0.25)`;
        return row.result;
      }).catch((error) => { ready(); throw error; });
      const loser = (async () => {
        await locked;
        return b.begin(async (tx) => {
          await tx`SET LOCAL statement_timeout='5s'`;
          return (await tx`SELECT reserve_event_seats(${event}::uuid,${bookings[2]}::uuid,2,30) AS result`)[0].result;
        });
      })();
      const [first, second] = await Promise.all([winner, loser]);
      assert.equal(first.ok, true);
      assert.equal(second.reason, "sin_plazas");
      assert.equal((await sql`SELECT seats_reserved FROM activity_events WHERE id=${event}`)[0].seats_reserved, 6);
      await sql`UPDATE activity_event_bookings SET hold_expires_at=now()-interval '1 minute' WHERE event_id=${event}`;
      await sql`SELECT release_expired_event_holds()`;
      assert.equal((await sql`SELECT seats_reserved FROM activity_events WHERE id=${event}`)[0].seats_reserved, 0);
      assert.ok((await sql`SELECT discount_cents,discount_percent FROM bookings WHERE id IN ${sql(bookings)}`).every((r) => r.discount_cents === 1500 && r.discount_percent === 25));
      report.checks.push("two native connections: one wins last seats, one rejected; expiry releases six; discounts preserved");
    } finally {
      await Promise.all([a.end(), b.end()]);
      await sql`DELETE FROM activity_events WHERE id=${event}`;
      for (const id of bookings) await sql`DELETE FROM bookings WHERE id=${id}`;
    }
    stage = "read-only preflight";
    await sql.unsafe(fs.readFileSync("supabase/tests/sprint_c_preflight.sql", "utf8"));
    report.checks.push("read-only preflight passed; no remaining booking fixtures");
    assert.equal((await sql`SELECT count(*)::int AS count FROM bookings`)[0].count, 0);
    report.success = true;
  } catch (error) {
    report.success = false;
    report.failure = { stage, message: error.cause?.message || error.message };
  } finally {
    if (sql) await sql.end();
    await admin.end();
    const file = path.join(directory, `${target.database}-${Date.now()}-report.json`);
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ database: report.database, success: report.success, checks: report.checks, failure: report.failure }));
  }
  if (!report.success) process.exitCode = 1;
}
