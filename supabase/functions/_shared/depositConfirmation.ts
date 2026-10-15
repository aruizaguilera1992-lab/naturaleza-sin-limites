// Explicit admin intent "confirm activity + request deposit" for manual (kind=manual) payment links.
// Presentation-only: never changes payment kind, booking status rules, seats or eligibility.
export const DEPOSIT_CONFIRMATION_PURPOSE = "booking_deposit_confirmation" as const;
export type PaymentLinkPurpose = "generic" | typeof DEPOSIT_CONFIRMATION_PURPOSE;

export interface DepositConfirmationEvidence {
  purpose: typeof DEPOSIT_CONFIRMATION_PURPOSE;
  payment_request_id: string;
  booking_id: string;
  recipient: string;
  activity_date: string;
  amount_cents: number;
  issued_at: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date in Europe/Madrid as YYYY-MM-DD. */
export function madridToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function isValidActivityDate(value: unknown, now = new Date()): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return false;
  return value >= madridToday(now);
}

export type DepositEligibilityInput = {
  booking: { status: string; preferred_date: string | null } | null;
  scheduled: boolean;
  /** All payment_requests of the booking (id, kind, status). */
  payments: { id: string; kind?: string | null; status: string }[];
  /** Payment request ids with an accepted deposit-confirmation notification. */
  confirmedPaymentIds?: string[];
  sendEmail: boolean;
  target: "booking" | "contact";
  now?: Date;
};

/** Returns null when allowed, otherwise a user-facing Spanish reason. */
export function depositConfirmationError(i: DepositEligibilityInput): string | null {
  if (i.target !== "booking") return "La confirmación de actividad solo se aplica a reservas";
  if (!i.sendEmail) return "La confirmación de actividad debe enviarse por email";
  if (!i.booking) return "Reserva no encontrada";
  if (i.booking.status === "cancelada") return "La reserva está cancelada";
  if (i.scheduled) return "Las salidas programadas confirman plazas con su propio pago";
  if (!isValidActivityDate(i.booking.preferred_date, i.now)) return "La reserva no tiene una fecha válida y futura";
  const confirmed = new Set(i.confirmedPaymentIds ?? []);
  if (i.payments.some((p) => p.status === "pagado" && (p.kind === "senal" || confirmed.has(p.id)))) return "La señal ya está pagada";
  return null;
}

/** Distinct, deterministic dedupe key: one confirmation per payment request and activity date. */
export const depositConfirmationDedupeKey = (paymentRequestId: string, activityDate: string) =>
  `payment_link:${paymentRequestId}:deposit_confirmation:${activityDate}`;

type LogRow = { kind?: string; status?: string; recipient?: string | null; payment_request_id?: string | null; booking_id?: string | null; payload?: any };

/** True only for an ACCEPTED deposit-confirmation email matching this payment, booking, current date and amount. */
export function hasMatchingDepositEvidence(rows: LogRow[] | null | undefined, m: { paymentRequestId: string; bookingId: string; activityDate: string | null; amountCents: number }): boolean {
  if (!m.activityDate || !rows?.length) return false;
  return rows.some((r) => {
    const e = r?.payload?.presentation as Partial<DepositConfirmationEvidence> | undefined;
    if (!e || r.kind !== "enlace_pago" || r.status !== "enviado") return false;
    if (r.payment_request_id !== m.paymentRequestId || r.booking_id !== m.bookingId) return false;
    if (e.purpose !== DEPOSIT_CONFIRMATION_PURPOSE || e.payment_request_id !== m.paymentRequestId || e.booking_id !== m.bookingId) return false;
    if (e.activity_date !== m.activityDate || e.amount_cents !== m.amountCents) return false;
    const recipients: string[] = Array.isArray(r.payload?.recipients) ? r.payload.recipients : [];
    return typeof e.recipient === "string" && recipients.includes(e.recipient) && String(r.recipient ?? "").split(",").map((s) => s.trim()).includes(e.recipient);
  });
}
