import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { isEmail, sendTrackedNotification as defaultSend, type NotificationIntent } from "../_shared/email.ts";
import { renderBookingEmail } from "../_shared/bookingEmail.ts";
import { readBookingEmailContext } from "../_shared/bookingEmailContext.ts";
import {
  DEPOSIT_CONFIRMATION_PURPOSE,
  depositConfirmationDedupeKey,
  depositConfirmationError,
  type DepositConfirmationEvidence,
} from "../_shared/depositConfirmation.ts";

export const BodySchema = z.object({
  target: z.enum(["booking", "contact"]),
  id: z.string().uuid(),
  amountCents: z.number().int().min(50).max(2_000_000),
  concept: z.string().min(2).max(160),
  environment: z.enum(["sandbox", "live"]),
  sendEmail: z.boolean().optional(),
  baseUrl: z.string().url().max(300),
  // Older clients omit it: defaults to the generic payment link.
  purpose: z.enum(["generic", DEPOSIT_CONFIRMATION_PURPOSE]).optional().default("generic"),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export type Deps = {
  db: any;
  send?: (db: any, intent: NotificationIntent) => Promise<{ status: string; error?: string }>;
  now?: () => Date;
};

export async function handleCreatePaymentLink(req: Request, deps: Deps): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const supabase = deps.db;
  const send = deps.send ?? defaultSend;
  const now = deps.now?.() ?? new Date();

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token ?? "");
  const user = userData?.user;
  if (!user) return json({ error: "No autorizado" }, 401);
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
  if (!roles || roles.length === 0) return json({ error: "No autorizado" }, 403);

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Datos no válidos", details: parsed.error.flatten() }, 400);
  const body = parsed.data;
  const depositIntent = body.purpose === DEPOSIT_CONFIRMATION_PURPOSE;

  let customerEmail: string | null = null;
  let customerName: string | null = null;
  let booking: { status: string; preferred_date: string | null } | null = null;
  if (body.target === "booking") {
    const { data } = await supabase.from("bookings").select("id, contact, email, payment_email, name, status, preferred_date").eq("id", body.id).maybeSingle();
    if (!data) return json({ error: "Reserva no encontrada" }, 404);
    customerEmail = [data.payment_email, data.email, data.contact].find((c) => c && isEmail(c))?.trim() ?? null;
    customerName = data.name;
    booking = { status: data.status, preferred_date: data.preferred_date };
  } else {
    const { data } = await supabase.from("contact_submissions").select("id, contacto, email, nombre").eq("id", body.id).maybeSingle();
    if (!data) return json({ error: "Contacto no encontrado" }, 404);
    customerEmail = [data.email, data.contacto].find((c) => c && isEmail(c))?.trim() ?? null;
    customerName = data.nombre;
  }

  // Validate the explicit intent BEFORE creating anything.
  if (depositIntent) {
    let scheduled = false;
    let payments: { id: string; kind: string; status: string }[] = [];
    let confirmedIds: string[] = [];
    if (body.target === "booking") {
      const { data: link, error: linkError } = await supabase.from("activity_event_bookings").select("id").eq("booking_id", body.id).maybeSingle();
      if (linkError) return json({ error: "No se pudo comprobar la salida" }, 500);
      scheduled = Boolean(link);
      const { data: rows, error: rowsError } = await supabase.from("payment_requests").select("id, kind, status").eq("booking_id", body.id);
      if (rowsError) return json({ error: "No se pudieron comprobar los cobros" }, 500);
      payments = rows ?? [];
      const { data: logs, error: logsError } = await supabase.from("notification_log").select("payment_request_id, payload").eq("booking_id", body.id).eq("kind", "enlace_pago").eq("status", "enviado");
      if (logsError) return json({ error: "No se pudo comprobar el historial de envíos" }, 500);
      confirmedIds = (logs ?? []).filter((l: any) => l?.payload?.presentation?.purpose === DEPOSIT_CONFIRMATION_PURPOSE).map((l: any) => l.payment_request_id);
    }
    const reason = depositConfirmationError({ booking, scheduled, payments, confirmedPaymentIds: confirmedIds, sendEmail: Boolean(body.sendEmail), target: body.target, now });
    if (reason) return json({ error: reason }, 409);
    if (!customerEmail) return json({ error: "La reserva no tiene un email válido" }, 409);
  }

  const { data: pending } = await supabase.from("payment_requests")
    .select("id, token, amount_cents, currency, concept, expires_at, status")
    .eq(body.target === "booking" ? "booking_id" : "contact_id", body.id)
    .eq("status", "pendiente").order("created_at", { ascending: false }).limit(1).maybeSingle();

  let record = pending && new Date(pending.expires_at).getTime() > now.getTime() && pending.amount_cents === body.amountCents ? pending : null;
  if (!record) {
    const { data: created, error } = await supabase.from("payment_requests").insert({
      booking_id: body.target === "booking" ? body.id : null,
      contact_id: body.target === "contact" ? body.id : null,
      amount_cents: body.amountCents,
      concept: body.concept,
      customer_email: customerEmail,
      environment: body.environment,
    }).select("id, token, amount_cents, currency, concept, expires_at, status").single();
    if (error || !created) {
      console.error("Insert payment_request error", error);
      return json({ error: "No se pudo crear el cobro" }, 500);
    }
    record = created;
  }

  const url = `${body.baseUrl.replace(/\/$/, "")}/pago/${record.token}`;
  const table = body.target === "booking" ? "bookings" : "contact_submissions";
  const { error: statusError } = await supabase.from(table).update({ status: "pendiente_pago" }).eq("id", body.id);
  if (statusError) {
    console.error("Status update error", statusError);
    return json({ error: "No se pudo actualizar el estado de la solicitud" }, 500);
  }

  let email: { status: string; error?: string } = { status: "no_solicitado" };
  if (body.sendEmail) {
    if (!customerEmail) {
      email = { status: "omitido", error: "La solicitud no tiene un email válido" };
    } else {
      const activityDate = depositIntent ? booking!.preferred_date! : undefined;
      const context = await readBookingEmailContext(supabase, body.target === "booking" ? body.id : null, record, false, true, activityDate ? { depositConfirmationDate: activityDate } : {});
      const presentation: DepositConfirmationEvidence | undefined = depositIntent && context.manualConfirmation
        ? { purpose: DEPOSIT_CONFIRMATION_PURPOSE, payment_request_id: record.id, booking_id: body.id, recipient: customerEmail, activity_date: activityDate!, amount_cents: record.amount_cents, issued_at: now.toISOString() }
        : undefined;
      if (depositIntent && !presentation) {
        email = { status: "omitido", error: "No se pudo verificar la reserva para confirmar la actividad; no se ha enviado nada" };
      } else {
        try {
          const result = await send(supabase, {
            kind: "enlace_pago",
            // Generic key unchanged for compatibility; explicit confirmation uses its own key.
            dedupeKey: presentation ? depositConfirmationDedupeKey(record.id, presentation.activity_date) : `payment_link:${record.id}`,
            recipients: [customerEmail],
            ...renderBookingEmail({ ...context, variant: "payment_link", state: "pendiente_pago", activity: context.activity ?? record.concept, name: customerName, payUrl: url, expiresAt: record.expires_at, sandbox: body.environment === "sandbox" }),
            paymentRequestId: record.id,
            bookingId: body.target === "booking" ? body.id : null,
            contactId: body.target === "contact" ? body.id : null,
            ...(presentation ? { presentation: presentation as unknown as Record<string, unknown> } : {}),
          });
          email = { status: result.status, error: result.error };
        } catch (e) {
          console.error("Notification error", e);
          email = { status: "fallido", error: "No se pudo registrar o enviar el email" };
        }
      }
    }
  }

  return json({ ok: true, url, token: record.token, reused: Boolean(pending && record.id === pending.id), purpose: body.purpose, email });
}
