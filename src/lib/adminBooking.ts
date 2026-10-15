import { activityProfiles } from "@/data/activityProfiles";
import { DEPOSIT_RATE } from "@/lib/deposit";

export const ACTIVITY_TZ = "Europe/Madrid";

export type PricePayment = {
  booking_id: string | null;
  amount_cents: number;
  status: string;
  kind?: string;
  total_cents?: number | null;
};

export type PriceSource = "senal" | "salida" | "catalogo" | "ninguna";

export type BookingFinance = {
  source: PriceSource;
  /** Per-person price in cents; null when no reliable figure. */
  unitCents: number | null;
  participants: number | null;
  /** Gross total before discount. */
  totalCents: number | null;
  /** Discount applied by the admin, in cents (0 when none). */
  discountCents: number;
  /** Whole percentage (0-100) the discount was entered as; 0 when none or a legacy fixed amount. */
  discountPercent: number;
  /** Total after discount; this is what deposit and balance are computed from. */
  netTotalCents: number | null;
  depositCents: number | null;
  paidCents: number;
  balanceCents: number | null;
  depositPaid: boolean;
  depositPending: boolean;
  /** True when the figure comes from the current catalog, not from what was agreed. */
  estimated: boolean;
};

export const parseParticipants = (value: string | null | undefined): number | null => {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Booking.activity is stored as "<Categoría> · <Nombre>"; match it against the catalog. */
export const catalogPriceForActivity = (activity: string): number | null => {
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const target = norm(activity);
  const hit = activityProfiles.find((p) => norm(`${p.categoryLabel} · ${p.name}`) === target);
  return hit?.priceValue && hit.priceValue > 0 ? hit.priceValue : null;
};

export const depositFromTotal = (totalCents: number) => Math.round(totalCents * DEPOSIT_RATE);

/** Whole percentage (0-100) of a discount entry; anything invalid or empty counts as no discount. */
export const clampDiscountPercent = (value: number | string | null | undefined): number => {
  const n = Math.round(Number(value ?? 0));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.max(0, n));
};

/**
 * Priority: persisted deposit total > outing price agreed on the event > current catalog (estimate).
 * Never returns 0 € as a price: absence is `null`.
 */
export function computeFinance(input: {
  bookingId: string;
  participantsRaw: string | null;
  activity: string;
  eventPriceCents?: number | null;
  payments: PricePayment[];
  catalogPrice?: number | null;
  /** Admin-applied discount in cents (legacy fixed amount); clamped so the net total never goes below 0. */
  discountCents?: number | null;
  /** Admin-applied discount as a whole percentage of the gross total; takes precedence over discountCents. */
  discountPercent?: number | null;
}): BookingFinance {
  const participants = parseParticipants(input.participantsRaw);
  const own = input.payments.filter((p) => p.booking_id === input.bookingId);
  const paidCents = own.filter((p) => p.status === "pagado").reduce((s, p) => s + p.amount_cents, 0);
  const senales = own.filter((p) => p.kind === "senal");
  const depositPaid = senales.some((p) => p.status === "pagado");
  const depositPending = senales.some((p) => p.status === "pendiente");
  // Only trust a persisted total when the row is unambiguously an official-rate deposit of that total.
  const senalWithTotal = senales.find(
    (p) =>
      !!p.total_cents &&
      p.total_cents > 0 &&
      p.status !== "cancelado" &&
      p.amount_cents === depositFromTotal(p.total_cents),
  );

  let source: PriceSource = "ninguna";
  let totalCents: number | null = null;
  let unitCents: number | null = null;
  let depositCents: number | null = null;

  if (senalWithTotal?.total_cents) {
    source = "senal";
    totalCents = senalWithTotal.total_cents;
    depositCents = senalWithTotal.amount_cents;
    unitCents = participants ? Math.round(totalCents / participants) : null;
  } else if (input.eventPriceCents && input.eventPriceCents > 0 && participants) {
    source = "salida";
    unitCents = input.eventPriceCents;
    totalCents = unitCents * participants;
  } else {
    const catalog = input.catalogPrice === undefined ? catalogPriceForActivity(input.activity) : input.catalogPrice;
    if (catalog && participants) {
      source = "catalogo";
      unitCents = Math.round(catalog * 100);
      totalCents = unitCents * participants;
    }
  }
  const discountPercent = clampDiscountPercent(input.discountPercent);
  const legacyCents = Math.max(0, Math.round(input.discountCents ?? 0));
  const grossDiscountCents =
    totalCents !== null && discountPercent > 0 ? Math.round((totalCents * discountPercent) / 100) : legacyCents;
  const discountCents = totalCents !== null ? Math.min(grossDiscountCents, totalCents) : grossDiscountCents;
  const netTotalCents = totalCents !== null ? Math.max(totalCents - discountCents, 0) : null;
  if (netTotalCents !== null && depositCents === null) depositCents = depositFromTotal(netTotalCents);
  if (netTotalCents !== null && depositCents !== null && source === "senal" && discountCents > 0) {
    // A discount agreed after the deposit was set: recompute the suggested deposit on the net total.
    depositCents = depositFromTotal(netTotalCents);
  }

  return {
    source,
    unitCents,
    participants,
    totalCents,
    discountCents,
    discountPercent: discountCents > 0 ? discountPercent : 0,
    netTotalCents,
    depositCents,
    paidCents,
    balanceCents: netTotalCents !== null ? Math.max(netTotalCents - paidCents, 0) : null,
    depositPaid,
    depositPending,
    estimated: source === "catalogo",
  };
}

/** Amount (cents) to pre-fill the deposit charge, or null when a new deposit must not be suggested. */
export const suggestedDepositCents = (f: BookingFinance): number | null =>
  f.depositPaid || f.depositPending || f.paidCents > 0 || f.depositCents === null || f.depositCents < 50
    ? null
    : f.depositCents;

/* ------------------------------ Coincidences ------------------------------ */

/** Calendar day (YYYY-MM-DD) of an instant in the activity's local time zone. */
export const localDay = (iso: string, tz = ACTIVITY_TZ) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  guide_name?: string | null;
};

export type ScheduleBooking = {
  id: string;
  activity: string;
  preferred_date: string | null;
  status: string;
  event_id: string | null;
};

export type Slot = {
  key: string;
  kind: "event" | "booking";
  refId: string;
  label: string;
  day: string;
  start?: number;
  end?: number;
  startIso?: string;
  guide?: string | null;
};

export type Coincidence = {
  slot: Slot;
  level: "solape" | "mismo_dia";
  sameGuide: boolean;
  otherGuide: boolean;
};

const INACTIVE_EVENT = new Set(["cancelada", "borrador"]);

/** One slot per outing (grouping all its bookings) plus one per booking without an outing. */
export function buildSlots(events: ScheduleEvent[], bookings: ScheduleBooking[]): Slot[] {
  const slots: Slot[] = [];
  for (const e of events) {
    if (INACTIVE_EVENT.has(e.status)) continue;
    slots.push({
      key: `event:${e.id}`,
      kind: "event",
      refId: e.id,
      label: e.title,
      day: localDay(e.starts_at),
      start: Date.parse(e.starts_at),
      end: e.ends_at ? Date.parse(e.ends_at) : undefined,
      startIso: e.starts_at,
      guide: e.guide_name?.trim() || null,
    });
  }
  for (const b of bookings) {
    if (b.status === "cancelada" || b.event_id || !b.preferred_date) continue;
    slots.push({ key: `booking:${b.id}`, kind: "booking", refId: b.id, label: b.activity, day: b.preferred_date.slice(0, 10) });
  }
  return slots;
}

export function slotForBooking(b: ScheduleBooking, slots: Slot[]): Slot | null {
  if (b.status === "cancelada") return null;
  if (b.event_id) return slots.find((s) => s.key === `event:${b.event_id}`) ?? null;
  return slots.find((s) => s.key === `booking:${b.id}`) ?? null;
}

export function findCoincidences(own: Slot | null, slots: Slot[]): Coincidence[] {
  if (!own) return [];
  const out: Coincidence[] = [];
  for (const s of slots) {
    if (s.key === own.key || s.day !== own.day) continue;
    const intervals = own.start !== undefined && own.end !== undefined && s.start !== undefined && s.end !== undefined;
    if (intervals && !(own.start! < s.end! && s.start! < own.end!)) continue; // known and disjoint
    const bothGuides = !!own.guide && !!s.guide;
    out.push({
      slot: s,
      level: intervals ? "solape" : "mismo_dia",
      sameGuide: bothGuides && own.guide!.toLowerCase() === s.guide!.toLowerCase(),
      otherGuide: bothGuides && own.guide!.toLowerCase() !== s.guide!.toLowerCase(),
    });
  }
  return out;
}
