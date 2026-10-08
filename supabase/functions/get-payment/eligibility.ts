// Server-side check that an automatic deposit (kind = 'senal') may still be
// charged: the seat hold must be live and the outing bookable. Manual admin
// payment requests never go through this check.

export interface SeatLink {
  state: string;
  hold_expires_at: string | null;
}

export interface EventInfo {
  status: string;
  starts_at: string;
}

export type DepositEligibility =
  | { ok: true; holdExpiresAt: Date }
  | { ok: false; reason: "no_event" | "hold_released" | "hold_expired" | "event_not_bookable" | "past_event" };

export function checkDepositEligibility(
  link: SeatLink | null,
  ev: EventInfo | null,
  now = new Date(),
): DepositEligibility {
  if (!link || !ev) return { ok: false, reason: "no_event" };
  if (link.state !== "bloqueada") return { ok: false, reason: "hold_released" };
  const hold = link.hold_expires_at ? new Date(link.hold_expires_at) : null;
  if (!hold || hold.getTime() <= now.getTime()) return { ok: false, reason: "hold_expired" };
  if (ev.status !== "publicada" && ev.status !== "completa") return { ok: false, reason: "event_not_bookable" };
  if (new Date(ev.starts_at).getTime() <= now.getTime()) return { ok: false, reason: "past_event" };
  return { ok: true, holdExpiresAt: hold };
}

/** Stripe accepts expires_at between 30 min and 24 h from creation. */
export const STRIPE_MIN_EXPIRY_SECONDS = 30 * 60;

/**
 * Shortest expiry Stripe allows (+60 s margin for clock skew), rounded up to
 * the minute so concurrent calls share parameters / idempotency key.
 * NOTE: the 30-min hold is created before checkout, so this session can
 * outlive the hold by at most ~31 min; that residual window is covered by the
 * webhook (confirm_event_seats re-takes seats only if still free, otherwise
 * en_revision + business incident, never a client confirmation).
 */
export function depositSessionExpiry(now = new Date()): number {
  const t = Math.floor(now.getTime() / 1000) + STRIPE_MIN_EXPIRY_SECONDS + 60;
  return Math.ceil(t / 60) * 60;
}
