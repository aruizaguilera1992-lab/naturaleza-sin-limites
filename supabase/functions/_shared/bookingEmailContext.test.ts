import { assertEquals, assert } from "jsr:@std/assert@1";
import { readBookingEmailContext } from "./bookingEmailContext.ts";
import { renderBookingEmail } from "./bookingEmail.ts";

const payment = { id: "p1", amount_cents: 5400, currency: "eur" };
function fakeDb({ discount = 0, event = null, rows = [] as any[], broken = false, sent = false, status = "nueva", date = "2027-05-18" } = {}) {
  const reads: string[] = [];
  const filters: [string, string, unknown][] = [];
  return { reads, filters, from(table: string) {
    reads.push(table);
    if (broken) throw new Error("read unavailable");
    const data = table === "bookings" ? { activity: "Ejemplo", preferred_date: date, status, number_of_people: "3", name: "Muestra", discount_percent: discount, discount_cents: 0 }
      : table === "activity_event_bookings" ? (event ? { event_id: "e1" } : null)
      : table === "activity_events" ? event : table === "notification_log" ? sent ? [{ id: "n1" }] : [] : rows;
    const result = { data, error: null };
    return { select() { return this; }, eq(key: string, value: unknown) { filters.push([table, key, value]); return this; }, limit() { return this; }, maybeSingle: async () => result, then(resolve: any) { return Promise.resolve(result).then(resolve); } };
  } };
}
Deno.test("enrichment is read-only, current validated payment counted once without persisting anything", async () => {
  const db = fakeDb({ rows: [{ id: "p1", kind: "senal", total_cents: 18000, amount_cents: 5400, status: "pendiente" }] });
  const before = await readBookingEmailContext(db, "b1", payment);
  const after = await readBookingEmailContext(db, "b1", payment, true);
  assertEquals(before.money?.paidCents, 0);
  assertEquals(after.money?.paidCents, 5400);
  assertEquals(after.money?.totalCents, 18000);
  assert(db.reads.every(t => ["bookings", "activity_event_bookings", "activity_events", "payment_requests", "notification_log"].includes(t)));
});

Deno.test("manual signal uses admin emission or exact accepted notification, never date/status alone", async () => {
  const rows = [{ id: "p1", kind: "senal", amount_cents: 5400, status: "pendiente" }];
  const initial = await readBookingEmailContext(fakeDb({ rows, status: "confirmada" }), "b1", payment, true);
  assertEquals(initial.manualConfirmation, false);
  const admin = await readBookingEmailContext(fakeDb({ rows }), "b1", payment, false, true);
  assertEquals(admin.manualConfirmation, true);
  const accepted = fakeDb({ rows, sent: true });
  const receipt = await readBookingEmailContext(accepted, "b1", payment, true);
  assertEquals(receipt.manualConfirmation, true);
  assertEquals(accepted.filters.filter(f => f[0] === "notification_log"), [["notification_log", "payment_request_id", "p1"], ["notification_log", "booking_id", "b1"], ["notification_log", "kind", "enlace_pago"], ["notification_log", "status", "enviado"]]);
  assertStringIncludesLocal(renderBookingEmail({ ...receipt, activity: "Ejemplo", variant: "receipt", state: "fecha_pendiente" }).subject, "Señal recibida");
  for (const kind of ["manual", "saldo", "pack"]) {
    const generic = await readBookingEmailContext(fakeDb({ rows: [{ ...rows[0], kind }], sent: true }), "b1", payment, true);
    assertEquals(generic.manualConfirmation, undefined);
  }
  const cancelled = await readBookingEmailContext(fakeDb({ rows, sent: true, status: "cancelada" }), "b1", payment, true);
  assertEquals(cancelled.manualConfirmation, undefined);
  const scheduled = await readBookingEmailContext(fakeDb({ rows, sent: true, event: { starts_at: "2027-05-18T07:00:00Z", price_cents: 6000 } as any }), "b1", payment, true, true);
  assertEquals(scheduled.scheduled, true);
  assertEquals(scheduled.manualConfirmation, undefined);
});
function assertStringIncludesLocal(value: string, part: string) { assert(value.includes(part)); }
Deno.test("discounted total from persisted source and absent economics remain honest", async () => {
  const db = fakeDb({ discount: 10, rows: [{ id: "p1", kind: "senal", total_cents: 18000, amount_cents: 5400, status: "pagado" }] });
  assertEquals((await readBookingEmailContext(db, "b1", payment, true)).money?.totalCents, 16200);
  const absent = await readBookingEmailContext(fakeDb({ broken: true }), "b1", payment, true);
  assertEquals(absent.money?.paymentCents, 5400);
  assertEquals(absent.money?.paidCents, undefined);
  assertEquals(absent.money?.totalCents, undefined);
  const email = renderBookingEmail({ ...absent, activity: "Ejemplo", variant: "receipt", state: "fecha_pendiente" });
  assert(!email.text.includes("Saldo pendiente"));
  assert(!email.text.includes("Pagado acumulado"));
});
Deno.test("deposit confirmation shows catalogue total when payment is exactly the official deposit", async () => {
  const { readBookingEmailContext } = await import("./bookingEmailContext.ts");
  const tables: Record<string, any> = {
    bookings: { activity: "Río Guadalmina", preferred_date: "2027-05-18", number_of_people: "2", status: "contactada", discount_percent: 0 },
    activity_event_bookings: null,
    payment_requests: [{ id: "p1", kind: "manual", amount_cents: 2100, total_cents: null, status: "pendiente" }],
  };
  const q = (t: string) => { const o: any = { select: () => o, eq: () => o, limit: () => o, maybeSingle: async () => ({ data: tables[t], error: null }), then: (r: any) => r({ data: tables[t], error: null }) }; return o; };
  const ctx = await readBookingEmailContext({ from: q }, "b1", { id: "p1", amount_cents: 2100 }, false, true, { depositConfirmationDate: "2027-05-18" });
  if (ctx.money?.totalCents !== 7000 || ctx.money?.depositCents !== 2100) throw new Error(JSON.stringify(ctx.money));
});

Deno.test("deposit email invoice: Guadalmina booking stored as 'Categoría · Nombre', 2 people", async () => {
  const { renderBookingEmail } = await import("./bookingEmail.ts");
  const { readBookingEmailContext } = await import("./bookingEmailContext.ts");
  const db = { from: (t: string) => { const q: any = { select: () => q, eq: () => q, limit: () => Promise.resolve({ data: [], error: null }),
    maybeSingle: () => Promise.resolve({ data: t === "bookings" ? { activity: "Barranquismo · Río Guadalmina", preferred_date: "2099-01-10", number_of_people: "2", status: "nueva", discount_percent: 0, discount_cents: 0 } : null, error: null }),
    then: (r: any) => r({ data: [{ id: "p1", kind: "senal", amount_cents: 2100, total_cents: null, status: "pendiente" }], error: null }) }; return q; } };
  const ctx = await readBookingEmailContext(db, "b1", { id: "p1", amount_cents: 2100 }, false, true);
  if (ctx.money?.totalCents !== 7000 || ctx.money?.depositCents !== 2100) throw new Error(JSON.stringify(ctx.money));
  const mail = renderBookingEmail({ variant: "payment_link", state: "pendiente_pago", activity: "Río Guadalmina", date: "2099-01-10", people: 2, ...ctx } as any);
  for (const s of ["2 × 35,00 € por persona", "Total de la actividad: 70,00 €", "A PAGAR AHORA (señal del 30 %, incluida en el total): 21,00 €", "Resto pendiente: 49,00 €"])
    if (!mail.text.includes(s)) throw new Error("missing " + s + "\n" + mail.text);
});
