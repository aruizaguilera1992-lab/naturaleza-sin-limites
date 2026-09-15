import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import {
  businessRecipients,
  escapeHtml,
  isEmail,
  listLayout,
  sendTrackedNotification,
} from "../_shared/email.ts";

export const MAX_STANDARD_GROUP = 6;

const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;

const peopleField = z
  .union([z.number(), z.string()])
  .transform((v) => Number(String(v).trim()))
  .refine((n) => Number.isInteger(n) && n >= 1, { message: "Indica al menos 1 persona" })
  .refine((n) => n <= MAX_STANDARD_GROUP, {
    message: `Las reservas estándar admiten hasta ${MAX_STANDARD_GROUP} personas. Para grupos mayores, consúltanos por contacto.`,
  });

const BookingSchema = z.object({
  type: z.literal("booking"),
  activity: z.string().min(1).max(120),
  preferredDate: z.string().max(30).optional().nullable(),
  numberOfPeople: peopleField,
  experienceLevel: z.string().max(120).optional().nullable(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(150),
  phone: z.string().regex(phoneRegex).max(30),
  message: z.string().max(1000).optional().nullable(),
  rgpd: z.literal(true),
});

const ContactSchema = z.object({
  type: z.literal("contact"),
  nombre: z.string().min(2).max(120),
  email: z.string().email().max(150),
  phone: z.string().regex(phoneRegex).max(30),
  interes: z.string().min(1).max(120),
  personas: z.string().max(50).optional().nullable(),
  mensaje: z.string().max(1000).optional().nullable(),
  rgpd: z.literal(true),
});

const BodySchema = z.discriminatedUnion("type", [BookingSchema, ContactSchema]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function clientConfirmationHtml(name: string | null, title: string, lines: string[]) {
  const greeting = name ? `Hola ${escapeHtml(name)},` : "Hola,";
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
      <h2 style="color:#FF6B35;margin-bottom:8px">Hemos recibido tu solicitud</h2>
      <p>${greeting}</p>
      <p>Gracias por contactar con <strong>Naturaleza Sin Límites</strong>. Hemos registrado tu solicitud y te responderemos en menos de 24 horas laborables.</p>
      <h3 style="margin-bottom:4px">${escapeHtml(title)}</h3>
      <ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
      <p>Si necesitas una respuesta más rápida, escríbenos por WhatsApp al <strong>+34 685 60 95 42</strong>.</p>
      <p style="margin-top:24px;font-size:13px;color:#666">
        Naturaleza Sin Límites · Deportes de aventura en Málaga<br/>
        Este mensaje es una confirmación automática, no es una reserva confirmada hasta que la validemos contigo.
      </p>
    </div>`;
}

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
  if (!parsed.success) {
    return json({ error: "Datos no válidos", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date().toISOString();

  if (data.type === "booking") {
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        activity: data.activity,
        preferred_date: data.preferredDate || null,
        number_of_people: String(data.numberOfPeople),
        experience_level: data.experienceLevel || null,
        // `contact` keeps the legacy single-field shape for existing consumers.
        contact: data.email,
        email: data.email,
        phone: data.phone,
        payment_email: data.email,
        name: data.name,
        message: data.message || null,
        rgpd_accepted_at: now,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("Insert booking error", error);
      return json({ error: "No se pudo guardar la solicitud" }, 500);
    }

    const summary = [
      `Actividad: ${data.activity}`,
      `Fecha preferente: ${data.preferredDate ?? "-"}`,
      `Personas: ${data.numberOfPeople}`,
      `Nivel: ${data.experienceLevel ?? "-"}`,
      `Nombre: ${data.name}`,
      `Email: ${data.email}`,
      `Teléfono: ${data.phone}`,
      `Mensaje: ${data.message ?? "-"}`,
    ];

    const businessSubject = `Nueva reserva: ${data.activity}`;
    const business = await sendTrackedNotification(supabase, {
      kind: "reserva_negocio",
      dedupeKey: `booking_business:${inserted.id}`,
      recipients: businessRecipients(),
      subject: businessSubject,
      bookingId: inserted.id,
      html: listLayout(businessSubject, summary),
    });

    const client = await sendTrackedNotification(supabase, {
      kind: "reserva_cliente",
      dedupeKey: `booking_customer:${inserted.id}`,
      recipients: [data.email],
      subject: "Hemos recibido tu solicitud · Naturaleza Sin Límites",
      bookingId: inserted.id,
      html: clientConfirmationHtml(data.name, "Resumen de tu solicitud", [
        `Actividad: ${data.activity}`,
        `Fecha preferente: ${data.preferredDate ?? "por concretar"}`,
        `Personas: ${data.numberOfPeople}`,
        `Nivel: ${data.experienceLevel ?? "por concretar"}`,
      ]),
    });

    return json({
      ok: true,
      id: inserted.id,
      notifications: { business: business.status, customer: client.status },
    });
  }

  const { data: inserted, error } = await supabase
    .from("contact_submissions")
    .insert({
      nombre: data.nombre,
      contacto: data.email,
      email: data.email,
      phone: data.phone,
      interes: data.interes,
      personas: data.personas || null,
      mensaje: data.mensaje || null,
      rgpd_accepted_at: now,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Insert contact error", error);
    return json({ error: "No se pudo guardar la solicitud" }, 500);
  }

  const businessSubject = `Nuevo contacto: ${data.nombre}`;
  const business = await sendTrackedNotification(supabase, {
    kind: "contacto_negocio",
    dedupeKey: `contact_business:${inserted.id}`,
    recipients: businessRecipients(),
    subject: businessSubject,
    contactId: inserted.id,
    html: listLayout(businessSubject, [
      `Nombre: ${data.nombre}`,
      `Email: ${data.email}`,
      `Teléfono: ${data.phone}`,
      `Interés: ${data.interes}`,
      `Personas: ${data.personas ?? "-"}`,
      `Mensaje: ${data.mensaje ?? "-"}`,
    ]),
  });

  const client = await sendTrackedNotification(supabase, {
    kind: "contacto_cliente",
    dedupeKey: `contact_customer:${inserted.id}`,
    recipients: isEmail(data.email) ? [data.email] : [],
    subject: "Hemos recibido tu solicitud · Naturaleza Sin Límites",
    contactId: inserted.id,
    html: clientConfirmationHtml(data.nombre, "Resumen de tu mensaje", [
      `Interés: ${data.interes}`,
      `Personas: ${data.personas ?? "por concretar"}`,
    ]),
  });

  return json({
    ok: true,
    id: inserted.id,
    notifications: { business: business.status, customer: client.status },
  });
});
