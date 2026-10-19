// Automatic 30 % deposits exist ONLY for a concrete scheduled outing.
// Custom dates go through submit-request (no payment) and are validated by
// the business before a manual payment link is sent from the admin panel.
import { paymentsAllowed } from "../_shared/paymentSafety.ts";
import { isTrustedSiteOrigin } from "../_shared/siteOrigins.ts";
import { z } from "npm:zod@3.23.8";
import { DEPOSIT_RATE, getActivityPrice } from "../_shared/activityPrices.ts";
import { renderBookingEmail } from "../_shared/bookingEmail.ts";

export const MAX_STANDARD_GROUP = 6;
export const HOLD_MINUTES = 30;
const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;

export const BodySchema = z.object({
  requestId: z.string().uuid(),
  category: z.string().min(2).max(40),
  slug: z.string().min(1).max(80),
  participants: z.number().int().min(1).max(MAX_STANDARD_GROUP),
  // Ignored for the charge: the real date comes from the outing.
  preferredDate: z.string().max(30).optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(150),
  phone: z.string().regex(phoneRegex).max(30),
  message: z.string().max(1000).optional().nullable(),
  rgpd: z.literal(true),
  environment: z.enum(["sandbox", "live"]),
  origin: z.string().url().max(300),
});

export interface EventRow {
  id: string;
  category: string;
  slug: string;
  status: string;
  starts_at: string;
  capacity_total: number;
  seats_reserved: number;
  price_cents: number | null;
  event_type?: string | null;
}

export type EventCheck =
  | { ok: true }
  | { ok: false; reason: "not_found" | "wrong_activity" | "not_bookable" | "past_event" | "sin_plazas"; freeSeats?: number };

/** Pure server-side validation of the outing before any write. */
export function checkEvent(
  ev: EventRow | null,
  category: string,
  slug: string,
  participants: number,
  now = new Date(),
): EventCheck {
  if (!ev) return { ok: false, reason: "not_found" };
  if (ev.category !== category || ev.slug !== slug) return { ok: false, reason: "wrong_activity" };
  // Only open group outings are publicly bookable with an automatic deposit.
  if ((ev.event_type ?? null) !== "open_group") return { ok: false, reason: "not_bookable" };
  if (ev.status !== "publicada") {
    return ev.status === "completa"
      ? { ok: false, reason: "sin_plazas", freeSeats: 0 }
      : { ok: false, reason: "not_bookable" };
  }
  if (new Date(ev.starts_at).getTime() <= now.getTime()) return { ok: false, reason: "past_event" };
  if (!Number.isInteger(ev.capacity_total) || ev.capacity_total < 1 || ev.capacity_total > MAX_STANDARD_GROUP) return { ok: false, reason: "not_bookable" };
  const free = Math.max(ev.capacity_total - ev.seats_reserved, 0);
  if (participants > free) return { ok: false, reason: "sin_plazas", freeSeats: free };
  return { ok: true };
}

/** Per-person price in cents: the outing's own price wins, else the catalogue. */
export function unitPriceCents(ev: EventRow, catalogueEuros: number) {
  return Number.isInteger(ev.price_cents) && (ev.price_cents as number) > 0
    ? (ev.price_cents as number)
    : Math.round(catalogueEuros * 100);
}

/** Calendar date of the outing in Spain (bookings.preferred_date is a date). */
export const madridDate = (iso: string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date(iso));

const madridLabel = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

// deno-lint-ignore no-explicit-any
type Db = any;

export interface Notification {
  kind: string;
  dedupeKey: string;
  recipients: string[];
  subject: string;
  bookingId: string;
  html: string;
  text?: string;
}

export interface Deps {
  db: Db;
  notify: (n: Notification) => Promise<unknown>;
  businessRecipients: () => string[];
  now?: () => Date;
  liveEnabled?: string;
}

export interface Result {
  status: number;
  body: Record<string, unknown>;
}

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Esa salida no existe o ya no está disponible.",
  wrong_activity: "Esa salida no corresponde a esta actividad.",
  not_bookable: "Esa salida ya no admite reservas.",
  past_event: "Esa salida ya ha pasado.",
  sin_plazas: "Esa salida ya no tiene plazas suficientes.",
};

export async function handleDeposit(raw: unknown, deps: Deps): Promise<Result> {
  if (raw && typeof raw === "object" && (raw as { action?: unknown }).action === "recover") {
    const recovery = z.object({ action: z.literal("recover"), requestId: z.string().uuid() }).strict().safeParse(raw);
    if (!recovery.success) return { status: 400, body: { error: "Referencia no válida" } };
    const { data: intent, error } = await deps.db.from("deposit_intents")
      .select("booking_id,payment_request_id").eq("id", recovery.data.requestId).maybeSingle();
    if (error) return { status: 500, body: { error: "No se pudo comprobar la reserva" } };
    if (!intent) return { status: 404, body: { error: "Referencia no disponible" } };
    const { data: payment, error: paymentError } = await deps.db.from("payment_requests")
      .select("token,status,environment").eq("id", intent.payment_request_id).single();
    if (paymentError || !payment) return { status: 500, body: { error: "No se pudo comprobar el pago" } };
    if (!paymentsAllowed(payment.environment, deps.liveEnabled)) return { status: 403, body: { error: "Entorno deshabilitado" } };
    if (payment.status === "pagado") return { status: 200, body: { token: payment.token } };
    const { data: hold, error: holdError } = await deps.db.from("activity_event_bookings")
      .select("state,hold_expires_at").eq("booking_id", intent.booking_id).maybeSingle();
    if (holdError) return { status: 500, body: { error: "No se pudo comprobar la plaza" } };
    if (payment.status !== "pendiente" || hold?.state !== "bloqueada" || !hold.hold_expires_at || new Date(hold.hold_expires_at) <= (deps.now?.() ?? new Date()))
      return { status: 409, body: { reason: "intent_expired", error: "El bloqueo ha caducado" } };
    return { status: 200, body: { token: payment.token } };
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return { status: 400, body: { error: "Datos no válidos" } };
  const body = parsed.data;
  if (!paymentsAllowed(body.environment, deps.liveEnabled)) {
    return { status: 403, body: { error: "Los pagos reales están deshabilitados" } };
  }
  if (!isTrustedSiteOrigin(body.origin)) {
    return { status: 400, body: { error: "Origen no permitido" } };
  }

  // No outing => no automatic charge. Checked BEFORE any write.
  if (!body.eventId) {
    return {
      status: 400,
      body: {
        error: "Las fechas a medida requieren confirmación previa: envía una solicitud de disponibilidad.",
        reason: "requires_confirmation",
      },
    };
  }

  const activity = getActivityPrice(body.category, body.slug);
  if (!activity) return { status: 404, body: { error: "Actividad no disponible para pago online" } };

  const { db } = deps;
  const activityLabel = `${activity.category} · ${activity.name}`;
  const { data: intent, error: intentError } = await db.rpc("create_deposit_intent", {
    _id: body.requestId,
    _payload: { ...body, message: body.message ?? null, preferredDate: undefined,
      activityLabel, catalogueUnitCents: Math.round(activity.pricePerPerson * 100) },
  });
  if (intentError || !intent) return { status: 500, body: { error: "No se pudo preparar la reserva. Reintenta con la misma intención." } };
  if (!intent.ok) return { status: 409, body: { reason: intent.reason,
    error: REASON_MESSAGES[intent.reason] ?? "La intención no coincide o ha caducado. Revisa la reserva antes de iniciar otra.", freeSeats: intent.free_seats } };
  const booking = { id: intent.booking_id };
  const request = { token: intent.token };
  const event = { starts_at: intent.starts_at };
  const totalCents = intent.total_cents;
  const depositCents = intent.amount_cents;

  const payUrl = `${new URL(body.origin).origin}/pago/${request.token}`;
  const emailData = {
    state: "pendiente_pago" as const, activity: activityLabel, date: event.starts_at,
    people: body.participants, name: body.name, email: body.email, phone: body.phone,
    message: body.message, scheduled: true, paymentKind: "senal", sandbox: body.environment === "sandbox",
    money: { totalCents, depositCents, paymentCents: depositCents, paidCents: 0 },
  };
  await deps.notify({
    kind: "senal_iniciada_negocio",
    dedupeKey: `deposit_business:${booking.id}`,
    recipients: deps.businessRecipients(),
    bookingId: booking.id,
    ...renderBookingEmail({ ...emailData, variant: "request_admin", operational: `Plazas bloqueadas ${HOLD_MINUTES} minutos para iniciar el pago.` }),
  });
  await deps.notify({
    kind: "senal_iniciada_cliente",
    dedupeKey: `deposit_customer:${booking.id}`,
    recipients: [body.email],
    bookingId: booking.id,
    ...renderBookingEmail({ ...emailData, variant: "payment_link", payUrl, holdMinutes: HOLD_MINUTES }),
  });

  return { status: 200, body: { token: request.token, amountCents: depositCents, totalCents } };
}
