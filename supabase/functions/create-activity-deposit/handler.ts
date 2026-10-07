// Automatic 30 % deposits exist ONLY for a concrete scheduled outing.
// Custom dates go through submit-request (no payment) and are validated by
// the business before a manual payment link is sent from the admin panel.
import { z } from "npm:zod@3.23.8";
import { DEPOSIT_RATE, getActivityPrice } from "../_shared/activityPrices.ts";
import { escapeHtml, formatAmount, listLayout } from "../_shared/email.ts";

export const MAX_STANDARD_GROUP = 6;
export const HOLD_MINUTES = 30;
const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;

export const BodySchema = z.object({
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
  if (ev.status !== "publicada") {
    return ev.status === "completa"
      ? { ok: false, reason: "sin_plazas", freeSeats: 0 }
      : { ok: false, reason: "not_bookable" };
  }
  if (new Date(ev.starts_at).getTime() <= now.getTime()) return { ok: false, reason: "past_event" };
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
}

export interface Deps {
  db: Db;
  notify: (n: Notification) => Promise<unknown>;
  businessRecipients: () => string[];
  now?: () => Date;
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
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return { status: 400, body: { error: "Datos no válidos" } };
  const body = parsed.data;

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
  const now = deps.now?.() ?? new Date();

  const { data: ev, error: evError } = await db
    .from("activity_events")
    .select("id, category, slug, status, starts_at, capacity_total, seats_reserved, price_cents")
    .eq("id", body.eventId)
    .maybeSingle();
  if (evError) {
    console.error("event read failed", evError);
    return { status: 500, body: { error: "No se pudo comprobar la salida" } };
  }

  const check = checkEvent(ev as EventRow | null, body.category, body.slug, body.participants, now);
  if (!check.ok) {
    return {
      status: 409,
      body: { error: REASON_MESSAGES[check.reason], reason: check.reason, freeSeats: check.freeSeats },
    };
  }

  const event = ev as EventRow;
  const unitCents = unitPriceCents(event, activity.pricePerPerson);
  const totalCents = unitCents * body.participants;
  const depositCents = Math.round(totalCents * DEPOSIT_RATE);
  if (depositCents < 50) return { status: 400, body: { error: "Importe demasiado bajo" } };

  const eventDate = madridDate(event.starts_at);
  const eventLabel = madridLabel(event.starts_at);
  const activityLabel = `${activity.category} · ${activity.name}`;

  const { data: booking, error: bookingError } = await db
    .from("bookings")
    .insert({
      activity: activityLabel,
      preferred_date: eventDate,
      number_of_people: String(body.participants),
      contact: body.email,
      email: body.email,
      phone: body.phone,
      payment_email: body.email,
      name: body.name,
      message: body.message || null,
      status: "pendiente_pago",
      rgpd_accepted_at: now.toISOString(),
    })
    .select("id")
    .single();
  if (bookingError || !booking) {
    console.error("deposit booking insert failed", bookingError);
    return { status: 500, body: { error: "No se pudo registrar la reserva" } };
  }

  // Atomic seat hold (SELECT ... FOR UPDATE inside the RPC).
  const { data: seatResult, error: seatError } = await db.rpc("reserve_event_seats", {
    _event_id: event.id,
    _booking_id: booking.id,
    _participants: body.participants,
    _hold_minutes: HOLD_MINUTES,
  });
  const seat = seatResult as { ok?: boolean; reason?: string; free_seats?: number } | null;
  if (seatError || !seat?.ok) {
    console.error("reserve_event_seats failed", seatError, seat);
    // Only the booking created by THIS call is removed (no seats were taken).
    await db.from("bookings").delete().eq("id", booking.id);
    if (seat?.reason === "sin_plazas") {
      return {
        status: 409,
        body: { error: REASON_MESSAGES.sin_plazas, reason: "sin_plazas", freeSeats: seat.free_seats ?? 0 },
      };
    }
    return { status: 409, body: { error: "No se pudo bloquear la plaza en esa salida" } };
  }

  const concept = `Señal ${Math.round(DEPOSIT_RATE * 100)}% · ${activityLabel} · ${body.participants} pax`;
  const { data: request, error: requestError } = await db
    .from("payment_requests")
    .insert({
      booking_id: booking.id,
      amount_cents: depositCents,
      total_cents: totalCents,
      kind: "senal",
      currency: "eur",
      concept,
      customer_email: body.email,
      environment: body.environment,
    })
    .select("token")
    .single();

  if (requestError || !request) {
    console.error("deposit payment_request insert failed", requestError);
    // Controlled rollback of the records created by this call only.
    await db.rpc("release_event_seats", { _booking_id: booking.id, _reason: "payment_prepare_failed" });
    await db.from("activity_event_bookings").delete().eq("booking_id", booking.id);
    await db.from("bookings").delete().eq("id", booking.id);
    return { status: 500, body: { error: "No se pudo preparar el pago. No se ha realizado ningún cargo." } };
  }

  const payUrl = `${new URL(body.origin).origin}/pago/${request.token}`;
  const pct = Math.round(DEPOSIT_RATE * 100);
  const summary = [
    `Actividad: ${activityLabel}`,
    `Salida programada: ${eventLabel}`,
    `Personas: ${body.participants}`,
    `Precio total: ${formatAmount(totalCents, "eur")}`,
    `Señal (${pct}%): ${formatAmount(depositCents, "eur")}`,
    `Plazas bloqueadas ${HOLD_MINUTES} min a la espera del pago`,
    `Nombre: ${body.name}`,
    `Email: ${body.email}`,
    `Teléfono: ${body.phone}`,
    `Mensaje: ${body.message ?? "-"}`,
  ];

  await deps.notify({
    kind: "senal_iniciada_negocio",
    dedupeKey: `deposit_business:${booking.id}`,
    recipients: deps.businessRecipients(),
    subject: `Nueva reserva con señal: ${activityLabel}`,
    bookingId: booking.id,
    html: listLayout(`Nueva reserva con señal: ${activityLabel}`, summary),
  });

  await deps.notify({
    kind: "senal_iniciada_cliente",
    dedupeKey: `deposit_customer:${booking.id}`,
    recipients: [body.email],
    subject: "Tu plaza está bloqueada temporalmente · Naturaleza Sin Límites",
    bookingId: booking.id,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
        <h2 style="color:#FF6B35">Ya casi está, ${escapeHtml(body.name)}</h2>
        <p>Hemos bloqueado temporalmente ${body.participants} plaza(s) en la salida programada de <strong>${escapeHtml(activityLabel)}</strong> del ${escapeHtml(eventLabel)}.</p>
        <p>El bloqueo dura ${HOLD_MINUTES} minutos y queda pendiente del pago de la señal de <strong>${formatAmount(depositCents, "eur")}</strong> (${pct}% del total de ${formatAmount(totalCents, "eur")}). Si no se completa el pago, las plazas se liberan. El resto se abona el día de la actividad.</p>
        <p><a href="${payUrl}" style="background:#FF6B35;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Pagar la señal</a></p>
        <p>Si el enlace no funciona, copia esta dirección: ${payUrl}</p>
        <p>La reserva se confirma cuando recibimos el pago y siempre está sujeta a las condiciones meteorológicas y a las condiciones publicadas.</p>
      </div>`,
  });

  return { status: 200, body: { token: request.token, amountCents: depositCents, totalCents } };
}
