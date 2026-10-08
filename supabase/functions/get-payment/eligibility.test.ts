import { assert, assertEquals } from "jsr:@std/assert@1";
import { checkDepositEligibility, depositSessionExpiry, STRIPE_MIN_EXPIRY_SECONDS } from "./eligibility.ts";

const now = new Date("2099-01-01T10:00:00Z");
const in10 = new Date(now.getTime() + 10 * 60e3).toISOString();
const ago1 = new Date(now.getTime() - 60e3).toISOString();
const future = "2099-02-01T07:00:00Z";
const ev = (o = {}) => ({ status: "publicada", starts_at: future, ...o });

Deno.test("bloqueo vigente en salida publicada: cobrable", () => {
  const r = checkDepositEligibility({ state: "bloqueada", hold_expires_at: in10 }, ev(), now);
  assertEquals(r.ok, true);
});

Deno.test("salida completa con bloqueo vigente sigue cobrable (las plazas ya son suyas)", () => {
  assertEquals(checkDepositEligibility({ state: "bloqueada", hold_expires_at: in10 }, ev({ status: "completa" }), now).ok, true);
});

for (const [label, link, e, reason] of [
  ["sin enlace", null, ev(), "no_event"],
  ["sin salida", { state: "bloqueada", hold_expires_at: in10 }, null, "no_event"],
  ["enlace liberado", { state: "liberada", hold_expires_at: null }, ev(), "hold_released"],
  ["bloqueo caducado", { state: "bloqueada", hold_expires_at: ago1 }, ev(), "hold_expired"],
  ["bloqueo sin caducidad", { state: "bloqueada", hold_expires_at: null }, ev(), "hold_expired"],
  ["salida cancelada", { state: "bloqueada", hold_expires_at: in10 }, ev({ status: "cancelada" }), "event_not_bookable"],
  ["salida borrador", { state: "bloqueada", hold_expires_at: in10 }, ev({ status: "borrador" }), "event_not_bookable"],
  ["salida pasada", { state: "bloqueada", hold_expires_at: in10 }, ev({ starts_at: ago1 }), "past_event"],
] as const) {
  Deno.test(`no cobrable: ${label}`, () => {
    const r = checkDepositEligibility(link, e, now);
    assertEquals(r.ok, false);
    if (!r.ok) assertEquals(r.reason, reason);
  });
}

Deno.test("caducidad de sesión: mínimo de Stripe, redondeada y estable dentro del minuto", () => {
  const a = depositSessionExpiry(new Date(now.getTime() + 5e3));
  const b = depositSessionExpiry(new Date(now.getTime() + 25e3));
  assertEquals(a, b);
  assert(a - now.getTime() / 1000 >= STRIPE_MIN_EXPIRY_SECONDS);
  assert(a - now.getTime() / 1000 <= STRIPE_MIN_EXPIRY_SECONDS + 120);
});
