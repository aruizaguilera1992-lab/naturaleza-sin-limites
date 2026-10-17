import { assertEquals } from "jsr:@std/assert@1";
import { handleDeposit, checkEvent, unitPriceCents, madridDate } from "./handler.ts";
const input = (changes: Record<string, unknown> = {}) => ({
  requestId: "11111111-1111-4111-8111-111111111112", eventId: "11111111-1111-4111-8111-111111111111",
  category: "barranquismo", slug: "guadalmina", participants: 2, name: "Persona ficticia",
  email: "fixture@example.test", phone: "+34000000000", rgpd: true, environment: "sandbox",
  origin: "http://127.0.0.1:8082", ...changes,
});
function fake(result: unknown, error: unknown = null) {
  const calls: unknown[] = [], notices: unknown[] = [];
  return { calls, notices, deps: { db: { rpc: async (name: string, args: unknown) => {
    calls.push({ name, args }); return { data: result, error };
  } }, notify: async (n: unknown) => { notices.push(n); }, businessRecipients: () => [] } };
}
for (const [changes, status] of [
  [{ requestId: undefined },400], [{ participants: 7 },400], [{ rgpd: false },400],
  [{ environment: "live" },403], [{ origin: "https://untrusted.example.test" },400],
  [{ eventId: null },400], [{ slug: "not-in-catalogue" },404],
] as const) {
  Deno.test("invalid deposit input rejected before atomic RPC: " + JSON.stringify(changes), async () => {
    const f = fake(null);
    assertEquals((await handleDeposit(input(changes), f.deps)).status, status);
    assertEquals(f.calls, []); assertEquals(f.notices, []);
  });
}
for (const reason of ["not_found","wrong_activity","not_bookable","past_event","sin_plazas","intent_mismatch","intent_expired"]) {
  Deno.test("atomic failure does not notify: " + reason, async () => {
    const f = fake({ ok: false, reason });
    const r = await handleDeposit(input(), f.deps);
    assertEquals(r.status, 409); assertEquals(r.body.reason, reason); assertEquals(f.notices, []);
  });
}
Deno.test("RPC failure returns retryable error without notifications", async () => {
  const f = fake(null, { message: "database unavailable" });
  assertEquals((await handleDeposit(input(), f.deps)).status, 500); assertEquals(f.notices, []);
});
for (const reused of [false,true]) Deno.test("created/reused intent uses authoritative RPC amounts and stable notification keys: " + reused, async () => {
  const f = fake({ ok: true, reused, booking_id: "booking-fixture", token: "token-fixture", amount_cents: 2400,
    total_cents: 8000, starts_at: "2099-03-10T07:00:00Z" });
  const r = await handleDeposit(input(), f.deps);
  assertEquals(r.status, 200); assertEquals(r.body, { token: "token-fixture", amountCents: 2400, totalCents: 8000 });
  assertEquals(f.calls.length, 1); assertEquals((f.calls[0] as any).name, "create_deposit_intent");
  assertEquals(f.notices.map((n: any) => n.dedupeKey), ["deposit_business:booking-fixture","deposit_customer:booking-fixture"]);
});
Deno.test("pure event and price/date checks preserve public-outing rules", () => {
  const event = { id: "fixture", category: "barranquismo", slug: "guadalmina", status: "publicada", starts_at: "2099-03-10T07:00:00Z",
    capacity_total: 6, seats_reserved: 0, price_cents: null, event_type: "open_group" };
  assertEquals(checkEvent(event, "barranquismo", "guadalmina", 2).ok, true);
  for (const changed of [{ event_type: "private" }, { status: "cancelada" }, { status: "borrador" }, { starts_at: "2000-01-01" }, { capacity_total: 20 }, { seats_reserved: 6 }])
    assertEquals(checkEvent({ ...event,...changed }, "barranquismo", "guadalmina", 2).ok, false);
  assertEquals(checkEvent(null, "barranquismo", "guadalmina", 2).ok, false);
  assertEquals(unitPriceCents(event, 35), 3500); assertEquals(unitPriceCents({ ...event,price_cents: 4000 },35),4000);
  assertEquals(madridDate("2099-03-10T07:00:00Z"),"2099-03-10");
});
