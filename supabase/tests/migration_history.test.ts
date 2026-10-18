import { PGlite } from "npm:@electric-sql/pglite@0.3.14";
import { PgDialect } from "npm:drizzle-orm@0.45.2/pg-core";
import type { SQL } from "npm:drizzle-orm@0.45.2";
import { readMigrationFiles } from "npm:drizzle-orm@0.45.2/migrator";
import { assertEquals, assertRejects } from "jsr:@std/assert@1";

// Synthetic post-0011 schema, never a production connection or data copy.
const config = { migrationsFolder: "drizzle/migrations" };
const migrations = readMigrationFiles(config);
const EVENT = "11111111-1111-4111-8111-111111111111";
const BOOKING = "22222222-2222-4222-8222-222222222221";

// These existing SQL files contain multiple statements without breakpoints.
// PGlite's prepared-query adapter rejects those. Preserve the exact file bytes
// and run Drizzle's real timestamp/transaction planner over the simple-query
// protocol instead. This is not a test of the deployed driver's transport.
async function migrate(db: PGlite) {
  const dialect = new PgDialect();
  type Session = Parameters<PgDialect["migrate"]>[1];
  const session = (client: Pick<PGlite, "query" | "exec">): Session => ({
    async all(statement: SQL) {
      const query = dialect.sqlToQuery(statement);
      return (await client.query(query.sql, query.params)).rows;
    },
    async execute(statement: SQL) {
      const query = dialect.sqlToQuery(statement);
      return query.params.length
        ? await client.query(query.sql, query.params)
        : await client.exec(query.sql);
    },
    async transaction(callback: (tx: Session) => Promise<void>) {
      return await db.transaction((tx) => callback(session(tx)));
    },
  } as unknown as Session);
  await dialect.migrate(migrations, session(db), config);
}

async function fixture(capacity = 6) {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE activity_events(id uuid PRIMARY KEY, capacity_total integer NOT NULL,
      seats_reserved integer DEFAULT 0, status text DEFAULT 'publicada',
      starts_at timestamptz DEFAULT now() + interval '1 day',
      CONSTRAINT activity_events_capacity_positive CHECK(capacity_total BETWEEN 1 AND 20),
      CONSTRAINT activity_events_seats_range CHECK(seats_reserved BETWEEN 0 AND capacity_total));
    CREATE TABLE bookings(id uuid PRIMARY KEY, event_id uuid, discount_cents integer DEFAULT 0);
    CREATE TABLE activity_event_bookings(event_id uuid, booking_id uuid UNIQUE, participants integer, state text, hold_expires_at timestamptz);
    CREATE FUNCTION release_expired_event_holds() RETURNS integer LANGUAGE sql AS 'SELECT 0';
    INSERT INTO activity_events(id,capacity_total,seats_reserved) VALUES('${EVENT}',${capacity},2);
    INSERT INTO bookings(id,event_id,discount_cents) VALUES('${BOOKING}','${EVENT}',1500);
    INSERT INTO activity_event_bookings(event_id,booking_id,participants,state)
      VALUES('${EVENT}','${BOOKING}',2,'confirmada');
    CREATE SCHEMA drizzle;
    CREATE TABLE drizzle.__drizzle_migrations(id serial PRIMARY KEY, hash text NOT NULL, created_at bigint);
  `);
  await record(db, migrations[11]);
  return db;
}

async function record(
  db: PGlite,
  migration: { hash: string; folderMillis: number },
) {
  await db.query(
    "INSERT INTO drizzle.__drizzle_migrations(hash,created_at) VALUES($1,$2)",
    [migration.hash, migration.folderMillis],
  );
}

async function history(db: PGlite) {
  return (await db.query<{ hash: string; created_at: number }>(
    "SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at",
  )).rows;
}

async function preserveAndRetry(db: PGlite, percent: number) {
  await migrate(db);
  assertEquals(
    (await db.query("SELECT discount_cents,discount_percent FROM bookings"))
      .rows,
    [{ discount_cents: 1500, discount_percent: percent }],
  );
  assertEquals(
    (await db.query(
      "SELECT capacity_total,seats_reserved FROM activity_events",
    )).rows,
    [{ capacity_total: 6, seats_reserved: 2 }],
  );
  assertEquals(
    (await db.query("SELECT participants,state FROM activity_event_bookings"))
      .rows,
    [{ participants: 2, state: "confirmada" }],
  );
  const before = await history(db);
  assertEquals(before.at(-1)?.hash, migrations[13].hash);
  assertEquals(
    (await db.query(`SELECT
    has_function_privilege('anon','reserve_event_seats(uuid,uuid,integer,integer)','EXECUTE') AS anon,
    has_function_privilege('authenticated','reserve_event_seats(uuid,uuid,integer,integer)','EXECUTE') AS authenticated,
    has_function_privilege('service_role','reserve_event_seats(uuid,uuid,integer,integer)','EXECUTE') AS service`))
      .rows,
    [{ anon: false, authenticated: false, service: true }],
  );
  await migrate(db);
  assertEquals(await history(db), before);
}

Deno.test("Drizzle migrator applies discounts then capacity from the post-0011 baseline", async () => {
  const db = await fixture();
  try {
    await preserveAndRetry(db, 0);
    assertEquals(
      (await history(db)).map((r) => Number(r.created_at)),
      migrations.slice(11).map((m) => m.folderMillis),
    );
  } finally {
    await db.close();
  }
});

Deno.test("Drizzle migrator preserves existing percentage discounts when 0012 was already applied", async () => {
  const db = await fixture();
  try {
    await db.exec(migrations[12].sql.join(";"));
    await record(db, migrations[12]);
    await db.exec("UPDATE bookings SET discount_percent=25");
    await preserveAndRetry(db, 25);
    assertEquals((await history(db)).length, 3);
  } finally {
    await db.close();
  }
});

Deno.test("Drizzle migrator handles the former capacity timestamp without skipping discounts or 0013", async () => {
  const db = await fixture();
  try {
    // The former 0012 capacity file had exactly the SQL now named 0013.
    await db.exec(migrations[13].sql.join(";"));
    await record(db, {
      hash: migrations[13].hash,
      folderMillis: 1791972000000,
    });
    await preserveAndRetry(db, 0);
    assertEquals((await history(db)).length, 4);
  } finally {
    await db.close();
  }
});

Deno.test("Drizzle transaction rolls back discounts and journal when oversized capacity aborts", async () => {
  const db = await fixture(20);
  try {
    const before = await history(db);
    await assertRejects(() => migrate(db), Error, "Oversize outings exist");
    assertEquals(await history(db), before);
    assertEquals(
      (await db.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name='bookings' AND column_name='discount_percent'",
      )).rows,
      [],
    );
    assertEquals(
      (await db.query(
        "SELECT capacity_total,seats_reserved FROM activity_events",
      )).rows,
      [{ capacity_total: 20, seats_reserved: 2 }],
    );
    assertEquals((await db.query("SELECT discount_cents FROM bookings")).rows, [
      { discount_cents: 1500 },
    ]);
    assertEquals(
      (await db.query("SELECT participants,state FROM activity_event_bookings"))
        .rows,
      [{ participants: 2, state: "confirmada" }],
    );
  } finally {
    await db.close();
  }
});

Deno.test("read-only preflight tolerates an empty baseline and preserves an existing database", async () => {
  const sql = await Deno.readTextFile("supabase/tests/sprint_c_preflight.sql");
  for (const db of [new PGlite(), await fixture()]) {
    try {
      const snapshot = async () =>
        (await db.query(`SELECT table_schema,table_name,column_name
        FROM information_schema.columns WHERE table_schema IN ('public','drizzle')
        ORDER BY table_schema,table_name,ordinal_position`)).rows;
      const before = await snapshot();
      const hasHistory = (await db.query<{ present: boolean }>(
        "SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS present",
      )).rows[0].present;
      const beforeHistory = hasHistory ? await history(db) : [];
      await db.exec(sql);
      assertEquals(await snapshot(), before);
      if (hasHistory) {
        assertEquals(await history(db), beforeHistory);
        assertEquals(
          (await db.query(
            "SELECT capacity_total,seats_reserved FROM activity_events",
          )).rows,
          [{ capacity_total: 6, seats_reserved: 2 }],
        );
      }
    } finally {
      await db.close();
    }
  }
});
