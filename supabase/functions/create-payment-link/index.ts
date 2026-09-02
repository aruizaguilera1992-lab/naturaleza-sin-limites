import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { escapeHtml, formatAmount, isEmail, layout, sendEmail } from "../_shared/email.ts";

const BodySchema = z.object({
  target: z.enum(["booking", "contact"]),
  id: z.string().uuid(),
  amountCents: z.number().int().min(50).max(2_000_000),
  concept: z.string().min(2).max(160),
  environment: z.enum(["sandbox", "live"]),
  sendEmail: z.boolean().optional(),
  baseUrl: z.string().url().max(300),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token ?? "");
  const user = userData?.user;
  if (!user) return json({ error: "No autorizado" }, 401);

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");
  if (!roles || roles.length === 0) return json({ error: "No autorizado" }, 403);

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
  const body = parsed.data;

  // Load the target record to resolve the customer contact.
  let customerEmail: string | null = null;
  let customerName: string | null = null;
  if (body.target === "booking") {
    const { data } = await supabase
      .from("bookings")
      .select("id, contact, name")
      .eq("id", body.id)
      .maybeSingle();
    if (!data) return json({ error: "Reserva no encontrada" }, 404);
    customerEmail = isEmail(data.contact) ? data.contact.trim() : null;
    customerName = data.name;
  } else {
    const { data } = await supabase
      .from("contact_submissions")
      .select("id, contacto, nombre")
      .eq("id", body.id)
      .maybeSingle();
    if (!data) return json({ error: "Contacto no encontrado" }, 404);
    customerEmail = isEmail(data.contacto) ? data.contacto.trim() : null;
    customerName = data.nombre;
  }

  const { data: created, error } = await supabase
    .from("payment_requests")
    .insert({
      booking_id: body.target === "booking" ? body.id : null,
      contact_id: body.target === "contact" ? body.id : null,
      amount_cents: body.amountCents,
      concept: body.concept,
      customer_email: customerEmail,
      environment: body.environment,
    })
    .select("token, amount_cents, currency, concept")
    .single();

  if (error || !created) {
    console.error("Insert payment_request error", error);
    return json({ error: "No se pudo crear el cobro" }, 500);
  }

  const url = `${body.baseUrl.replace(/\/$/, "")}/pago/${created.token}`;

  // Mark the request as pending payment.
  const table = body.target === "booking" ? "bookings" : "contact_submissions";
  await supabase.from(table).update({ status: "pendiente_pago" }).eq("id", body.id);

  let emailSent = false;
  if (body.sendEmail && customerEmail) {
    const amount = formatAmount(created.amount_cents, created.currency);
    await sendEmail(
      [customerEmail],
      `Enlace de pago · ${created.concept}`,
      layout("Tu reserva está lista para confirmarse", `
        <p>${customerName ? `Hola ${escapeHtml(customerName)},` : "Hola,"}</p>
        <p>Hemos revisado la disponibilidad de tu solicitud. Para <strong>confirmar tu plaza</strong>, completa el pago desde este enlace seguro:</p>
        <p><strong>${escapeHtml(created.concept)}</strong><br/>Importe: <strong>${escapeHtml(amount)}</strong></p>
        <p><a href="${url}" style="background:#FF6B35;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Pagar y confirmar reserva</a></p>
        <p style="font-size:13px;color:#666">El enlace es personal y caduca en 14 días. Al completar el pago, tu reserva quedará confirmada automáticamente y recibirás un email de confirmación.</p>
      `),
    );
    emailSent = true;
  }

  return json({ ok: true, url, token: created.token, emailSent });
});
