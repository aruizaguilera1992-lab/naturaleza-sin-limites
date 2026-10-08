import { assertEquals } from "jsr:@std/assert@1";
import { handleDeposit, type EventRow } from "./handler.ts";

const future = new Date(Date.now() + 7 * 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

const baseEvent = (o: Partial<EventRow> = {}): EventRow => ({
  id: "11111111-1111-4111-8111-111111111111",
  category: "barranquismo",
  slug: "guadalmina",
  status: "publicada",
  starts_at: future,
  capacity_total: 6,
  seats_reserved: 0,
  price_cents: null,
  event_type: "open_group",
  ...o,
});

const body = (o: Record<string, unknown> = {}) => ({
  category: "barranquismo",
  slug: "guadalmina",
  participants: 2,
  preferredDate: "2099-01-01",
  eventId: "11111111-1111-4111-8111-111111111111",
  name: "Prueba Simulada",
  email: "simulado@example.test",
  phone: "+34 600 000 000",
  rgpd: true,
  environment: "sandbox",
  origin: "http://localhost:8080",
  ...o,
});

/** In-memory fake: records every write, never touches the network. */
function fakeDb(event: EventRow | null, opts: { seatOk?: boolean; prFail?: boolean; releaseFail?: "error" | "not_ok" } = {}) {
  const writes: string[] = [];
  const inserted: Record<string, unknown>[] = [];
  const db = {
    from(table: string) {
      const q: Record<string, unknown> = {};
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: table === "activity_events" ? event : null, error: null }),
        single: async () => {
          if (table === "payment_requests" && opts.prFail) return { data: null, error: { message: "x" } };
          return { data: table === "bookings" ? { id: "b1" } : { token: "tok123" }, error: null };
        },
        insert: (row: Record<string, unknown>) => {
          writes.push(`insert:${table}`);
          inserted.push({ table, ...row });
          return chain;
        },
        update: (row: Record<string, unknown>) => {
          writes.push(`update:${table}`);
          inserted.push({ table, op: "update", ...row });
          return chain;
        },
        delete: () => {
          writes.push(`delete:${table}`);
          return chain;
        },
        then: (r: (v: unknown) => void) => r({ data: null, error: null }),
      };
      void q;
      return chain;
    },
    rpc: async (name: string) => {
      writes.push(`rpc:${name}`);
      if (name === "reserve_event_seats") {
        return { data: opts.seatOk === false ? { ok: false, reason: "sin_plazas", free_seats: 0 } : { ok: true }, error: null };
      }
      if (name === "release_event_seats" && opts.releaseFail === "error") return { data: null, error: { message: "db down" } };
      if (name === "release_event_seats" && opts.releaseFail === "not_ok") return { data: { ok: false, reason: "no_event" }, error: null };
      return { data: { ok: true }, error: null };
    },
  };
  return { db, writes, inserted };
}

const deps = (db: unknown, sent: unknown[] = []) => ({
  db,
  businessRecipients: () => ["negocio@example.test"],
  notify: async (n: unknown) => { sent.push(n); },
});

Deno.test("sin eventId falla antes de cualquier escritura o correo", async () => {
  const f = fakeDb(baseEvent());
  const sent: unknown[] = [];
  const r = await handleDeposit(body({ eventId: null }), deps(f.db, sent));
  assertEquals(r.status, 400);
  assertEquals(r.body.reason, "requires_confirmation");
  assertEquals(f.writes, []);
  assertEquals(sent.length, 0);
});

for (const [label, ev, reason] of [
  ["completa", baseEvent({ status: "completa", seats_reserved: 6 }), "sin_plazas"],
  ["cancelada", baseEvent({ status: "cancelada" }), "not_bookable"],
  ["borrador", baseEvent({ status: "borrador" }), "not_bookable"],
  ["pasada", baseEvent({ starts_at: past }), "past_event"],
  ["slug ajeno", baseEvent({ slug: "sima-diablo" }), "wrong_activity"],
  ["sin cupo suficiente", baseEvent({ seats_reserved: 5 }), "sin_plazas"],
  ["inexistente", null, "not_found"],
  ["privada (no open_group)", baseEvent({ event_type: "private" }), "not_bookable"],
  ["sin event_type", baseEvent({ event_type: null }), "not_bookable"],
] as const) {
  Deno.test(`salida ${label} se rechaza sin escrituras`, async () => {
    const f = fakeDb(ev);
    const sent: unknown[] = [];
    const r = await handleDeposit(body(), deps(f.db, sent));
    assertEquals(r.status, 409);
    assertEquals(r.body.reason, reason);
    assertEquals(f.writes, []);
    assertEquals(sent.length, 0);
  });
}

Deno.test("salida válida: señal 30 % con precio de catálogo y fecha real de la salida", async () => {
  const f = fakeDb(baseEvent({ starts_at: "2099-03-10T07:00:00Z" }));
  const r = await handleDeposit(body({ preferredDate: "2099-12-31" }), deps(f.db));
  assertEquals(r.status, 200);
  assertEquals(r.body.totalCents, 7000); // 35 € × 2
  assertEquals(r.body.amountCents, 2100);
  const booking = f.inserted.find((i) => i.table === "bookings")!;
  assertEquals(booking.preferred_date, "2099-03-10");
});

Deno.test("salida válida con precio propio de la salida", async () => {
  const f = fakeDb(baseEvent({ price_cents: 4000 }));
  const r = await handleDeposit(body({ participants: 3 }), deps(f.db));
  assertEquals(r.body.totalCents, 12000);
  assertEquals(r.body.amountCents, 3600);
});

Deno.test("si el bloqueo atómico falla se borra solo la reserva creada", async () => {
  const f = fakeDb(baseEvent(), { seatOk: false });
  const sent: unknown[] = [];
  const r = await handleDeposit(body(), deps(f.db, sent));
  assertEquals(r.status, 409);
  assertEquals(f.writes, ["insert:bookings", "rpc:reserve_event_seats", "delete:bookings"]);
  assertEquals(sent.length, 0);
});

Deno.test("si falla preparar el pago se libera el bloqueo y se limpia lo creado", async () => {
  const f = fakeDb(baseEvent(), { prFail: true });
  const sent: unknown[] = [];
  const r = await handleDeposit(body(), deps(f.db, sent));
  assertEquals(r.status, 500);
  assertEquals(f.writes, [
    "insert:bookings",
    "rpc:reserve_event_seats",
    "insert:payment_requests",
    "rpc:release_event_seats",
    "delete:activity_event_bookings",
    "delete:bookings",
  ]);
  assertEquals(sent.length, 0);
});

for (const mode of ["error", "not_ok"] as const) {
  Deno.test(`si la liberación falla (${mode}) se conserva enlace y reserva marcada para revisión`, async () => {
    const f = fakeDb(baseEvent(), { prFail: true, releaseFail: mode });
    const sent: unknown[] = [];
    const r = await handleDeposit(body(), deps(f.db, sent));
    assertEquals(r.status, 500);
    assertEquals(f.writes, [
      "insert:bookings",
      "rpc:reserve_event_seats",
      "insert:payment_requests",
      "rpc:release_event_seats",
      "update:bookings",
    ]);
    const upd = f.inserted.find((i) => i.op === "update")!;
    assertEquals(upd.status, "incidencia_plazas");
    assertEquals(sent.length, 0);
  });
}
