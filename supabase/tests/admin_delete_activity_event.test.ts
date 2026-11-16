import { PGlite } from "npm:@electric-sql/pglite@0.3.14";
import { assertEquals, assertRejects } from "jsr:@std/assert@1";

const migration = await Deno.readTextFile("drizzle/migrations/0028_admin_delete_activity_event.sql");
const grantsMigration = await Deno.readTextFile("drizzle/migrations/0029_admin_delete_activity_event_grants.sql");

const EVENT = "11111111-1111-4111-8111-111111111111";
const BOOKING = "22222222-2222-4222-8222-222222222221";
const ADMIN = "33333333-3333-4333-8333-333333333333";
const OTHER = "44444444-4444-4444-8444-444444444444";
const MISSING = "55555555-5555-4555-8555-555555555555";

async function database(state: string | null) {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('test.uid', true), '')::uuid $$;
    CREATE TABLE public.admins(user_id uuid NOT NULL);
    CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT _user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = _user_id AND _role = 'admin') $$;
    CREATE TABLE public.activity_events(id uuid PRIMARY KEY);
    CREATE TABLE public.activity_event_bookings(
      event_id uuid REFERENCES public.activity_events(id) ON DELETE CASCADE,
      booking_id uuid, state text NOT NULL);
    INSERT INTO public.admins VALUES ('${ADMIN}');
    INSERT INTO public.activity_events VALUES ('${EVENT}');
  `);
  if (state) {
    await db.exec(`INSERT INTO public.activity_event_bookings VALUES ('${EVENT}','${BOOKING}','${state}')`);
  }
  await db.exec(migration);
  await db.exec(grantsMigration);
  await db.exec(`SELECT set_config('test.uid','${ADMIN}',false)`);
  return db;
}

const remove = (db: PGlite, id = EVENT) =>
  db.query<{ result: { ok: boolean } }>(`SELECT admin_delete_activity_event('${id}') AS result`);

const eventCount = async (db: PGlite) =>
  (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM public.activity_events")).rows[0].n;

const bookingCount = async (db: PGlite) =>
  (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM public.activity_event_bookings")).rows[0].n;

Deno.test("admin borra una salida de grupo abierto sin reservas", async () => {
  const db = await database(null);
  try {
    assertEquals((await remove(db)).rows[0].result, { ok: true });
    assertEquals(await eventCount(db), 0);
  } finally { await db.close(); }
});

Deno.test("borrar la salida retira los enlaces de reserva ya liberados", async () => {
  const db = await database("liberada");
  try {
    assertEquals(await bookingCount(db), 1);
    assertEquals((await remove(db)).rows[0].result, { ok: true });
    assertEquals(await eventCount(db), 0);
    assertEquals(await bookingCount(db), 0);
  } finally { await db.close(); }
});

for (const [state, label] of [["confirmada", "confirmada"], ["bloqueada", "pendiente de pago"]] as const) {
  Deno.test(`no se borra una salida con reserva ${label}`, async () => {
    const db = await database(state);
    try {
      const error = await assertRejects(() => remove(db));
      assertEquals(String(error).includes("reservas activas"), true);
      assertEquals(await eventCount(db), 1);
      assertEquals(await bookingCount(db), 1);
    } finally { await db.close(); }
  });
}

Deno.test("quien no es admin no puede borrar salidas", async () => {
  const db = await database(null);
  try {
    await db.exec(`SELECT set_config('test.uid','${OTHER}',false)`);
    const error = await assertRejects(() => remove(db));
    assertEquals(String(error).includes("No autorizado"), true);
    assertEquals(await eventCount(db), 1);
  } finally { await db.close(); }
});

Deno.test("una salida inexistente se rechaza sin borrar nada", async () => {
  const db = await database(null);
  try {
    const error = await assertRejects(() => remove(db, MISSING));
    assertEquals(String(error).includes("Salida no encontrada"), true);
    assertEquals(await eventCount(db), 1);
  } finally { await db.close(); }
});

Deno.test("la función no es ejecutable por usuarios anónimos", async () => {
  const db = await database(null);
  try {
    const permissions = await db.query<{ anon: boolean; authenticated: boolean; service: boolean }>(`SELECT
      has_function_privilege('anon','public.admin_delete_activity_event(uuid)','EXECUTE') AS anon,
      has_function_privilege('authenticated','public.admin_delete_activity_event(uuid)','EXECUTE') AS authenticated,
      has_function_privilege('service_role','public.admin_delete_activity_event(uuid)','EXECUTE') AS service`);
    assertEquals(permissions.rows[0], { anon: false, authenticated: true, service: true });
  } finally { await db.close(); }
});
