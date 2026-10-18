import { assert, assertEquals } from "jsr:@std/assert@1";
import { handleCreatePaymentLink } from "./handler.ts";
import { readBookingEmailContext } from "../_shared/bookingEmailContext.ts";
import { renderBookingEmail } from "../_shared/bookingEmail.ts";
import { hasMatchingDepositEvidence } from "../_shared/depositConfirmation.ts";
import { paymentLinkBody } from "../../../src/lib/depositConfirmation.ts";
import type { NotificationIntent } from "../_shared/email.ts";

const BID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2027-05-01T10:00:00Z");

// In-memory mock: no real INSERT/UPDATE, no network, no email.
function memoryDb(seed: Record<string, any[]>) {
  const tables: Record<string, any[]> = { user_roles: [{ user_id: "admin", role: "admin" }], ...structuredClone(seed) };
  const writes: string[] = [];
  const db = {
    tables, writes,
    auth: { getUser: async (t: string) => ({ data: { user: t === "ok" ? { id: "admin" } : null } }) },
    from(table: string) {
      const rows = () => (tables[table] ??= []);
      const filters: [string, unknown][] = [];
      let mode: "select" | "insert" | "update" = "select";
      let payload: any = null;
      const match = () => rows().filter((r) => filters.every(([k, v]) => r[k] === v));
      const run = () => {
        if (mode === "insert") { writes.push(`insert:${table}`); const r = { id: crypto.randomUUID(), token: "tok", currency: "eur", status: "pendiente", kind: "manual", expires_at: "2027-05-15T00:00:00Z", ...payload }; rows().push(r); return { data: r, error: null }; }
        if (mode === "update") { writes.push(`update:${table}`); match().forEach((r) => Object.assign(r, payload)); return { data: null, error: null }; }
        return { data: match(), error: null };
      };
      const q: any = {
        select() { return q; }, order() { return q; }, limit() { return q; },
        eq(k: string, v: unknown) { filters.push([k, v]); return q; },
        insert(p: any) { mode = "insert"; payload = p; return q; },
        update(p: any) { mode = "update"; payload = p; return q; },
        maybeSingle: async () => { const r = run(); return { data: Array.isArray(r.data) ? r.data[0] ?? null : r.data, error: null }; },
        single: async () => { const r = run(); return { data: Array.isArray(r.data) ? r.data[0] : r.data, error: null }; },
        then(res: any, rej: any) { return Promise.resolve(run()).then(res, rej); },
      };
      return q;
    },
  };
  return db;
}

// Mock emitter: stores the intent the same way enqueueNotification does, then records provider outcome.
function mockSend(outcome: "enviado" | "fallido") {
  const sent: NotificationIntent[] = [];
  return { sent, fn: async (db: any, intent: NotificationIntent) => {
    sent.push(intent);
    const existing = db.tables.notification_log?.find((r: any) => r.dedupe_key === intent.dedupeKey);
    if (existing) return { status: existing.status };
    (db.tables.notification_log ??= []).push({
      id: crypto.randomUUID(), kind: intent.kind, dedupe_key: intent.dedupeKey, status: outcome, recipient: intent.recipients.join(", "),
      payment_request_id: intent.paymentRequestId, booking_id: intent.bookingId, subject: intent.subject,
      payload: { html: intent.html, text: intent.text, recipients: intent.recipients, ...(intent.presentation ? { presentation: intent.presentation } : {}) },
    });
    return { status: outcome, ...(outcome === "fallido" ? { error: "provider down" } : {}) };
  } };
}

const booking = (over: Record<string, unknown> = {}) => ({ id: BID, activity: "Barranco Ejemplo", contact: "c@example.com", email: "c@example.com", name: "Cliente", status: "contactada", preferred_date: "2027-05-18", number_of_people: "3", ...over });

function request(confirmDeposit: boolean, extra: Record<string, unknown> = {}) {
  const body = { ...paymentLinkBody({ target: "booking", id: BID, amountCents: 5400, concept: "Señal 30% · Barranco Ejemplo · 3 pax", environment: "sandbox", sendEmail: true, baseUrl: "https://naturalezasinlimites.es", confirmDeposit }), ...extra };
  return new Request("http://x", { method: "POST", headers: { Authorization: "Bearer ok" }, body: JSON.stringify(body) });
}

async function receiptFor(db: any) {
  const pr = db.tables.payment_requests[0];
  const ctx = await readBookingEmailContext(db, BID, { id: pr.id, amount_cents: pr.amount_cents, currency: "eur" }, true);
  assert(typeof ctx.activity === "string", "fixture activity must exist");
  return { ctx, mail: renderBookingEmail({ ...ctx, activity: ctx.activity, variant: "receipt", state: "fecha_pendiente" }) };
}

Deno.test("UI -> payload -> emitter -> evidence -> receipt: explicit kind=manual confirmation", async () => {
  const db = memoryDb({ bookings: [booking()] });
  const send = mockSend("enviado");
  const res = await (await handleCreatePaymentLink(request(true), { db, send: send.fn, now: () => NOW })).json();
  assertEquals(res.purpose, "booking_deposit_confirmation");
  assertEquals(db.tables.payment_requests[0].kind, "manual"); // kind untouched
  const intent = send.sent[0];
  assert(intent.dedupeKey.endsWith(":deposit_confirmation:2027-05-18"));
  assert(intent.subject.includes("Actividad confirmada"));
  assert(intent.text?.includes("Pagar la señal") || intent.html.includes("Pagar la señal"));
  assertEquals((intent.presentation as any).activity_date, "2027-05-18");
  assertEquals((intent.presentation as any).recipient, "c@example.com");
  const { ctx, mail } = await receiptFor(db);
  assertEquals(ctx.manualConfirmation, true);
  assert(mail.subject.includes("Señal recibida"));
  assert(!mail.text.includes("sigue pendiente de confirmación"));
});

Deno.test("generic and balance links never claim activity confirmation", async () => {
  for (const concept of ["Reserva Barranco Ejemplo", "Saldo restante"]) {
    const db = memoryDb({ bookings: [booking()] });
    const send = mockSend("enviado");
    await handleCreatePaymentLink(request(false, { concept }), { db, send: send.fn, now: () => NOW });
    assertEquals(send.sent[0].dedupeKey, `payment_link:${db.tables.payment_requests[0].id}`);
    assertEquals(send.sent[0].presentation, undefined);
    assert(!send.sent[0].subject.includes("Actividad confirmada"));
    const { ctx, mail } = await receiptFor(db);
    assertEquals(ctx.manualConfirmation, undefined);
    assert(mail.subject.includes("Pago recibido"));
  }
  // Legacy client body without purpose and contacts default to generic.
  assertEquals("purpose" in paymentLinkBody({ target: "contact", id: BID, amountCents: 100, concept: "xx", environment: "sandbox", sendEmail: true, baseUrl: "https://a.es", confirmDeposit: true }), false);
});

Deno.test("failed send leaves no evidence; receipt stays generic", async () => {
  const db = memoryDb({ bookings: [booking()] });
  const res = await (await handleCreatePaymentLink(request(true), { db, send: mockSend("fallido").fn, now: () => NOW })).json();
  assertEquals(res.email.status, "fallido");
  const { ctx } = await receiptFor(db);
  assertEquals(ctx.manualConfirmation, undefined);
});

Deno.test("later date change invalidates evidence", async () => {
  const db = memoryDb({ bookings: [booking()] });
  await handleCreatePaymentLink(request(true), { db, send: mockSend("enviado").fn, now: () => NOW });
  db.tables.bookings[0].preferred_date = "2027-06-02";
  const { ctx, mail } = await receiptFor(db);
  assertEquals(ctx.manualConfirmation, undefined);
  assert(!mail.subject.includes("Señal recibida"));
});

Deno.test("server rejects invalid intents before creating anything", async () => {
  const cases: [Record<string, any[]>, Record<string, unknown>, number][] = [
    [{ bookings: [booking({ status: "cancelada" })] }, {}, 409],
    [{ bookings: [booking({ preferred_date: null })] }, {}, 409],
    [{ bookings: [booking({ preferred_date: "2027-04-01" })] }, {}, 409],
    [{ bookings: [booking()], activity_event_bookings: [{ id: "l", booking_id: BID }] }, {}, 409],
    [{ bookings: [booking()], payment_requests: [{ id: "old", booking_id: BID, kind: "senal", status: "pagado" }] }, {}, 409],
    [{ bookings: [booking()] }, { sendEmail: false }, 409],
    [{ bookings: [booking()] }, { purpose: "inventado" }, 400],
  ];
  for (const [seed, extra, status] of cases) {
    const db = memoryDb(seed);
    const res = await handleCreatePaymentLink(request(true, extra), { db, send: mockSend("enviado").fn, now: () => NOW });
    assertEquals(res.status, status);
    assertEquals(db.writes, []);
  }
  const unauth = await handleCreatePaymentLink(new Request("http://x", { method: "POST", body: "{}" }), { db: memoryDb({}), now: () => NOW });
  assertEquals(unauth.status, 401);
});

Deno.test("reuse keeps previous generic notification and sends confirmation once with its own key", async () => {
  const db = memoryDb({ bookings: [booking()] });
  const send = mockSend("enviado");
  await handleCreatePaymentLink(request(false), { db, send: send.fn, now: () => NOW });
  const generic = { ...db.tables.notification_log[0] };
  await handleCreatePaymentLink(request(true), { db, send: send.fn, now: () => NOW });
  await handleCreatePaymentLink(request(true), { db, send: send.fn, now: () => NOW });
  assertEquals(db.tables.payment_requests.length, 1);
  assertEquals(db.tables.notification_log.length, 2);
  assertEquals(db.tables.notification_log[0], generic);
});

Deno.test("evidence matcher requires exact payment, booking, recipient, date and amount", () => {
  const row = { kind: "enlace_pago", status: "enviado", recipient: "a@b.es", payment_request_id: "p", booking_id: "b", payload: { recipients: ["a@b.es"], presentation: { purpose: "booking_deposit_confirmation", payment_request_id: "p", booking_id: "b", recipient: "a@b.es", activity_date: "2027-05-18", amount_cents: 100 } } };
  const m = { paymentRequestId: "p", bookingId: "b", activityDate: "2027-05-18", amountCents: 100 };
  assert(hasMatchingDepositEvidence([row], m));
  assert(!hasMatchingDepositEvidence([{ ...row, status: "fallido" }], m));
  assert(!hasMatchingDepositEvidence([row], { ...m, amountCents: 200 }));
  assert(!hasMatchingDepositEvidence([row], { ...m, paymentRequestId: "q" }));
  assert(!hasMatchingDepositEvidence([{ ...row, payload: { recipients: ["a@b.es"] } }], m));
  assert(!hasMatchingDepositEvidence([row], { ...m, activityDate: null }));
});
