import { assertEquals, assert } from "jsr:@std/assert@1";
import { readBookingEmailContext } from "./bookingEmailContext.ts";
import { renderBookingEmail } from "./bookingEmail.ts";

const payment = { id: "p1", amount_cents: 5400, currency: "eur" };
function fakeDb({ discount = 0, event = null, rows = [] as any[], broken = false } = {}) {
  const reads: string[] = [];
  return { reads, from(table: string) {
    reads.push(table);
    if (broken) throw new Error("read unavailable");
    const data = table === "bookings" ? { activity: "Ejemplo", preferred_date: "2027-05-18", number_of_people: "3", name: "Muestra", discount_percent: discount, discount_cents: 0 }
      : table === "activity_event_bookings" ? (event ? { event_id: "e1" } : null)
      : table === "activity_events" ? event : rows;
    const result = { data, error: null };
    return { select() { return this; }, eq() { return this; }, maybeSingle: async () => result, then(resolve: any) { return Promise.resolve(result).then(resolve); } };
  } };
}
Deno.test("enrichment is read-only, current validated payment counted once without persisting anything", async () => {
  const db = fakeDb({ rows: [{ id: "p1", kind: "senal", total_cents: 18000, amount_cents: 5400, status: "pendiente" }] });
  const before = await readBookingEmailContext(db, "b1", payment);
  const after = await readBookingEmailContext(db, "b1", payment, true);
  assertEquals(before.money?.paidCents, 0);
  assertEquals(after.money?.paidCents, 5400);
  assertEquals(after.money?.totalCents, 18000);
  assert(db.reads.every(t => ["bookings", "activity_event_bookings", "activity_events", "payment_requests"].includes(t)));
});
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