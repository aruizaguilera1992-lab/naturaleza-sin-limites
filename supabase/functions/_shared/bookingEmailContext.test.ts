import { assertEquals, assert } from "jsr:@std/assert@1";
import { readBookingEmailContext } from "./bookingEmailContext.ts";
import { renderBookingEmail } from "./bookingEmail.ts";

const payment = { id: "p1", amount_cents: 5400, currency: "eur" };
function fakeDb({ discount = 0, event = null, rows = [] as any[], broken = false, sent = false, status = "nueva", date = "2027-05-18" } = {}) {
  const reads: string[] = [];
  return { reads, from(table: string) {
    reads.push(table);
    if (broken) throw new Error("read unavailable");
    const data = table === "bookings" ? { activity: "Ejemplo", preferred_date: date, status, number_of_people: "3", name: "Muestra", discount_percent: discount, discount_cents: 0 }
      : table === "activity_event_bookings" ? (event ? { event_id: "e1" } : null)
      : table === "activity_events" ? event : table === "notification_log" ? sent ? [{ id: "n1" }] : [] : rows;
    const result = { data, error: null };
    return { select() { return this; }, eq() { return this; }, limit() { return this; }, maybeSingle: async () => result, then(resolve: any) { return Promise.resolve(result).then(resolve); } };
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
  const receipt = await readBookingEmailContext(fakeDb({ rows, sent: true }), "b1", payment, true);
  assertEquals(receipt.manualConfirmation, true);
  assertStringIncludesLocal(renderBookingEmail({ ...receipt, activity: "Ejemplo", variant: "receipt", state: "fecha_pendiente" }).subject, "Señal recibida");
  for (const kind of ["manual", "saldo", "pack"]) {
    const generic = await readBookingEmailContext(fakeDb({ rows: [{ ...rows[0], kind }], sent: true }), "b1", payment, true);
    assertEquals(generic.manualConfirmation, undefined);
  }
  const cancelled = await readBookingEmailContext(fakeDb({ rows, sent: true, status: "cancelada" }), "b1", payment, true);
  assertEquals(cancelled.manualConfirmation, undefined);
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