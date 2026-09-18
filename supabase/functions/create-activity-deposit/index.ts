import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { DEPOSIT_RATE, getActivityPrice } from "../_shared/activityPrices.ts";
import {
  businessRecipients,
  escapeHtml,
  formatAmount,
  listLayout,
  sendTrackedNotification,
} from "../_shared/email.ts";

const MAX_STANDARD_GROUP = 6;
const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;

const BodySchema = z.object({
  category: z.string().min(2).max(40),
  slug: z.string().min(1).max(80),
  participants: z.number().int().min(1).max(MAX_STANDARD_GROUP),
  preferredDate: z.string().min(8).max(30),
  name: z.string().min(2).max(120),
  email: z.string().email().max(150),
  phone: z.string().regex(phoneRegex).max(30),
  message: z.string().max(1000).optional().nullable(),
  rgpd: z.literal(true),
  environment: z.enum(["sandbox", "live"]),
  origin: z.string().url().max(300),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Datos no válidos" }, 400);
  const body = parsed.data;

  // The amount NEVER comes from the client.
  const activity = getActivityPrice(body.category, body.slug);
  if (!activity) return json({ error: "Actividad no disponible para pago online" }, 404);

  const totalCents = Math.round(activity.pricePerPerson * 100) * body.participants;
  const depositCents = Math.round(totalCents * DEPOSIT_RATE);
  if (depositCents < 50) return json({ error: "Importe demasiado bajo" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date().toISOString();
  const activityLabel = `${activity.category} · ${activity.name}`;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      activity: activityLabel,
      preferred_date: body.preferredDate,
      number_of_people: String(body.participants),
      contact: body.email,
      email: body.email,
      phone: body.phone,
      payment_email: body.email,
      name: body.name,
      message: body.message || null,
      status: "pendiente_pago",
      rgpd_accepted_at: now,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    console.error("deposit booking insert failed", bookingError);
    return json({ error: "No se pudo registrar la reserva" }, 500);
  }

  const concept = `Señal ${Math.round(DEPOSIT_RATE * 100)}% · ${activityLabel} · ${body.participants} pax`;

  const { data: request, error: requestError } = await supabase
    .from("payment_requests")
    .insert({
      booking_id: booking.id,
      amount_cents: depositCents,
      currency: "eur",
      concept,
      customer_email: body.email,
      environment: body.environment,
    })
    .select("token")
    .single();

  if (requestError || !request) {
    console.error("deposit payment_request insert failed", requestError);
    return json({ error: "No se pudo preparar el pago" }, 500);
  }

  const payUrl = `${new URL(body.origin).origin}/pago/${request.token}`;
  const summary = [
    `Actividad: ${activityLabel}`,
    `Fecha solicitada: ${body.preferredDate}`,
    `Personas: ${body.participants}`,
    `Precio total estimado: ${formatAmount(totalCents, "eur")}`,
    `Señal (${Math.round(DEPOSIT_RATE * 100)}%): ${formatAmount(depositCents, "eur")}`,
    `Nombre: ${body.name}`,
    `Email: ${body.email}`,
    `Teléfono: ${body.phone}`,
    `Mensaje: ${body.message ?? "-"}`,
  ];

  await sendTrackedNotification(supabase, {
    kind: "senal_iniciada_negocio",
    dedupeKey: `deposit_business:${booking.id}`,
    recipients: businessRecipients(),
    subject: `Nueva reserva con señal: ${activityLabel}`,
    bookingId: booking.id,
    html: listLayout(`Nueva reserva con señal: ${activityLabel}`, summary),
  });

  await sendTrackedNotification(supabase, {
    kind: "senal_iniciada_cliente",
    dedupeKey: `deposit_customer:${booking.id}`,
    recipients: [body.email],
    subject: "Tu reserva está casi lista · Naturaleza Sin Límites",
    bookingId: booking.id,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
        <h2 style="color:#FF6B35">Ya casi está, ${escapeHtml(body.name)}</h2>
        <p>Hemos reservado tu plaza para <strong>${escapeHtml(activityLabel)}</strong> el ${escapeHtml(body.preferredDate)} para ${body.participants} persona(s).</p>
        <p>Para confirmarla solo falta la señal de <strong>${formatAmount(depositCents, "eur")}</strong> (${Math.round(DEPOSIT_RATE * 100)}% del total estimado de ${formatAmount(totalCents, "eur")}). El resto se abona el día de la actividad.</p>
        <p><a href="${payUrl}" style="background:#FF6B35;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Pagar la señal</a></p>
        <p>Si el enlace no funciona, copia esta dirección: ${payUrl}</p>
        <p>Revisaremos la disponibilidad de la fecha. Si no pudiéramos realizar la salida, te devolvemos la señal íntegra.</p>
      </div>`,
  });

  return json({ token: request.token, amountCents: depositCents, totalCents });
});
