import { ACTIVITY_PRICES, DEPOSIT_RATE } from "./activityPrices.ts";
import { hasMatchingDepositEvidence } from "./depositConfirmation.ts";
import { reliableEmailMoney, type BookingEmailData } from "./bookingEmail.ts";

const validPeople = (v: unknown) => Number.isInteger(Number(v)) && Number(v) > 0;

// Read-only presentation enrichment. Missing sources omit economics, never block or alter payment processing.
export async function readBookingEmailContext(db: any, bookingId: string | null, payment?: { id: string; amount_cents: number; currency?: string }, received = false, adminSignalEmail = false, options: { depositConfirmationDate?: string } = {}): Promise<Partial<BookingEmailData>> {
  try {
  if (!bookingId) return payment ? { money: { paymentCents: payment.amount_cents, currency: payment.currency } } : {};
  const { data: booking, error } = await db.from("bookings").select("activity, preferred_date, number_of_people, name, email, phone, discount_percent, discount_cents, status").eq("id", bookingId).maybeSingle();
  if (error || !booking) return payment ? { money: { paymentCents: payment.amount_cents, currency: payment.currency } } : {};
  const { data: link } = await db.from("activity_event_bookings").select("event_id").eq("booking_id", bookingId).maybeSingle();
  const { data: event } = link?.event_id ? await db.from("activity_events").select("starts_at, price_cents").eq("id", link.event_id).maybeSingle() : { data: null };
  const context: Partial<BookingEmailData> = { activity: booking.activity, date: event?.starts_at ?? booking.preferred_date, people: booking.number_of_people, name: booking.name, email: booking.email, phone: booking.phone, scheduled: Boolean(link) };
  if (!payment) return context;
  const { data: rows, error: paymentError } = await db.from("payment_requests").select("id, kind, amount_cents, total_cents, status").eq("booking_id", bookingId);
  if (paymentError || !rows) return { ...context, money: { paymentCents: payment.amount_cents, currency: payment.currency } };
  // Snapshot for the atomic notification intent: this event's validated payment is included exactly once.
  const payments = rows.map((p: any) => received && p.id === payment.id ? { ...p, status: "pagado" } : p);
  const current = rows.find((p: any) => p.id === payment.id);
  context.paymentKind = current?.kind;
  if (!context.scheduled && current?.kind === "senal" && booking.status !== "cancelada") {
    if (adminSignalEmail) context.manualConfirmation = true;
    else {
      // Only an accepted admin email for THIS signal is evidence. Payload stores rendered
      // HTML/text, not semantic variant/state; booking.status is also set by generic payments.
      const { data: sent, error: sentError } = await db.from("notification_log")
        .select("id").eq("payment_request_id", payment.id).eq("booking_id", bookingId)
        .eq("kind", "enlace_pago").eq("status", "enviado").limit(1);
      context.manualConfirmation = !sentError && Boolean(sent?.length);
    }
  }
  // Explicit admin deposit-confirmation intent on a kind=manual link: presentation only.
  if (!context.scheduled && current && current.kind !== "senal" && booking.status !== "cancelada" && booking.preferred_date) {
    let explicit = false;
    if (options.depositConfirmationDate) explicit = options.depositConfirmationDate === booking.preferred_date;
    else if (received) {
      const { data: logs, error: logError } = await db.from("notification_log")
        .select("kind, status, recipient, payment_request_id, booking_id, payload")
        .eq("payment_request_id", payment.id).eq("booking_id", bookingId)
        .eq("kind", "enlace_pago").eq("status", "enviado");
      explicit = !logError && hasMatchingDepositEvidence(logs, { paymentRequestId: payment.id, bookingId, activityDate: booking.preferred_date, amountCents: payment.amount_cents });
    }
    if (explicit) { context.paymentKind = "senal"; context.manualConfirmation = true; }
  }
  const money = reliableEmailMoney(payments, payment, DEPOSIT_RATE, event?.price_cents, Number(booking.number_of_people));
  if (money.totalCents != null) {
    const percent = Math.min(100, Math.max(0, Number(booking.discount_percent) || 0));
    const discount = Math.min(money.totalCents, percent > 0 ? Math.round(money.totalCents * percent / 100) : Math.max(0, Number(booking.discount_cents) || 0));
    if (discount > 0) { money.grossCents = money.totalCents; money.discountCents = discount; money.discountPercent = percent > 0 ? percent : undefined; }
    if (validPeople(booking.number_of_people) && event?.price_cents > 0 && money.grossCents == null) money.unitCents = event.price_cents;
    money.totalCents = Math.max(0, money.totalCents - discount);
  }
  // Deposit-confirmation emails: show the activity total only when the official catalogue
  // price × people (minus discount) makes THIS payment exactly the official deposit.
  if (money.totalCents == null && context.manualConfirmation && context.paymentKind === "senal") {
    const people = Number(booking.number_of_people);
    const wanted = String(booking.activity ?? "").trim().toLowerCase();
    // Bookings store "Categoría · Nombre"; also accept the bare catalogue name.
    const entry = Object.values(ACTIVITY_PRICES).find((e) => [e.name, `${e.category} · ${e.name}`].some((n) => n.trim().toLowerCase() === wanted));
    if (entry && Number.isInteger(people) && people > 0) {
      const gross = Math.round(entry.pricePerPerson * 100) * people;
      const percent = Math.min(100, Math.max(0, Number(booking.discount_percent) || 0));
      const discount = percent > 0 ? Math.round(gross * percent / 100) : Math.max(0, Number(booking.discount_cents) || 0);
      const net = Math.max(0, gross - discount);
      if (net > 0 && payment.amount_cents === Math.round(net * DEPOSIT_RATE)) {
        money.totalCents = net;
        money.depositCents = payment.amount_cents;
        money.unitCents = Math.round(entry.pricePerPerson * 100);
        if (discount > 0) { money.grossCents = gross; money.discountCents = Math.min(discount, gross); money.discountPercent = percent > 0 ? percent : undefined; }
      }
    }
  }
  return { ...context, money };
  } catch {
    // Read enrichment is optional; keep the already-validated payment amount if a read is unavailable.
    return payment ? { money: { paymentCents: payment.amount_cents, currency: payment.currency } } : {};
  }
}