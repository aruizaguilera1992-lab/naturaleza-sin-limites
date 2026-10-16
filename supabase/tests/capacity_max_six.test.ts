import { PGlite } from "npm:@electric-sql/pglite@0.3.14";
import { assertEquals, assertRejects } from "jsr:@std/assert@1";

const migration = await Deno.readTextFile("drizzle/migrations/0013_capacity_max_six.sql");
const discountMigration = await Deno.readTextFile("drizzle/migrations/0012_add_booking_discount_percent.sql");
const journal = JSON.parse(await Deno.readTextFile("drizzle/migrations/meta/_journal.json"));

async function database(capacity = 6) {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE activity_events(id uuid PRIMARY KEY, capacity_total integer NOT NULL,
      seats_reserved integer DEFAULT 0, status text DEFAULT 'publicada', starts_at timestamptz DEFAULT now() + interval '1 day',
      CONSTRAINT activity_events_capacity_positive CHECK(capacity_total BETWEEN 1 AND 20),
      CONSTRAINT activity_events_seats_range CHECK(seats_reserved BETWEEN 0 AND capacity_total));
    CREATE TABLE bookings(id uuid PRIMARY KEY, event_id uuid, discount_cents integer DEFAULT 0);
    CREATE TABLE activity_event_bookings(event_id uuid, booking_id uuid UNIQUE, participants integer, state text, hold_expires_at timestamptz);
    CREATE FUNCTION release_expired_event_holds() RETURNS integer LANGUAGE sql AS 'SELECT 0';
    INSERT INTO activity_events(id,capacity_total) VALUES('11111111-1111-4111-8111-111111111111',${capacity});
  `);
  return db;
}

Deno.test("database enforces six and atomic seat reservations cannot overbook", async () => {
  const db = await database();
  try {
    await db.exec(migration);
    for (const n of [0, 7, 20]) {
      await assertRejects(() => db.exec(`UPDATE activity_events SET capacity_total=${n}`));
    }
    for (let i = 1; i <= 3; i++) {
      await db.exec(`INSERT INTO bookings(id) VALUES('22222222-2222-4222-8222-22222222222${i}')`);
    }
    const reserve = async (id: number, n: number) => {
      const result = await db.query<{ result: { ok: boolean; reason?: string } }>(
        `SELECT reserve_event_seats('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-22222222222${id}',${n},30) AS result`,
      );
      return result.rows[0].result;
    };
    assertEquals((await reserve(1, 7)).reason, "invalid_participants");
    assertEquals((await reserve(1, 4)).ok, true);
    assertEquals((await reserve(2, 3)).reason, "sin_plazas");
    assertEquals((await reserve(2, 2)).ok, true);
    assertEquals((await reserve(3, 1)).reason, "sin_plazas");
    const rows = await db.query<{ seats_reserved: number }>("SELECT seats_reserved FROM activity_events");
    assertEquals(rows.rows[0].seats_reserved, 6);
    const permissions = await db.query<{ anon: boolean; service: boolean }>(`SELECT
      has_function_privilege('anon','reserve_event_seats(uuid,uuid,integer,integer)','EXECUTE') AS anon,
      has_function_privilege('service_role','reserve_event_seats(uuid,uuid,integer,integer)','EXECUTE') AS service`);
    assertEquals(permissions.rows[0], { anon: false, service: true });
  } finally { await db.close(); }
});

Deno.test("legacy capacity aborts migration without changing reservations", async () => {
  const db = await database(20);
  try {
    await db.exec("UPDATE activity_events SET seats_reserved=8; INSERT INTO bookings(id,discount_cents) VALUES('22222222-2222-4222-8222-222222222221',1500)");
    await db.exec(discountMigration);
    await assertRejects(() => db.exec(migration));
    await db.exec("ROLLBACK");
    const rows = await db.query<{ capacity_total: number }>("SELECT capacity_total FROM activity_events");
    assertEquals(rows.rows[0].capacity_total, 20);
    assertEquals((await db.query("SELECT seats_reserved FROM activity_events")).rows, [{ seats_reserved: 8 }]);
    assertEquals((await db.query("SELECT discount_cents,discount_percent FROM bookings")).rows, [{ discount_cents: 1500, discount_percent: 0 }]);
  } finally { await db.close(); }
});

Deno.test("journal keeps upstream 0012 then 0013 with increasing timestamps and existing discounts", async () => {
  const entries = journal.entries;
  assertEquals(new Set(entries.map((e: { idx: number }) => e.idx)).size, entries.length);
  assertEquals(new Set(entries.map((e: { tag: string }) => e.tag.slice(0, 4))).size, entries.length);
  for (let i = 0; i < entries.length; i++) {
    assertEquals(entries[i].idx, i);
    if (i) assertEquals(entries[i].when > entries[i - 1].when, true);
    await Deno.readTextFile(`drizzle/migrations/${entries[i].tag}.sql`);
  }
  assertEquals(entries[12].tag, "0012_add_booking_discount_percent");
  assertEquals(entries[12].when, 1792062004750);
  assertEquals(entries[13].tag, "0013_capacity_max_six");
  const db = await database();
  try {
    await db.exec("INSERT INTO bookings(id,discount_cents) VALUES('22222222-2222-4222-8222-222222222221',1500)");
    await db.exec(discountMigration);
    await db.exec("UPDATE bookings SET discount_percent=25; UPDATE activity_events SET seats_reserved=2");
    await db.exec(migration);
    assertEquals((await db.query("SELECT discount_cents,discount_percent FROM bookings")).rows, [{ discount_cents: 1500, discount_percent: 25 }]);
    assertEquals((await db.query("SELECT capacity_total,seats_reserved FROM activity_events")).rows, [{ capacity_total: 6, seats_reserved: 2 }]);
    await assertRejects(() => db.exec("UPDATE bookings SET discount_percent=101"));
    await assertRejects(() => db.exec("UPDATE activity_events SET capacity_total=7"));
  } finally { await db.close(); }
});
