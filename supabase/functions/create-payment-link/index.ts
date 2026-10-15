import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import {
  isEmail,
  sendTrackedNotification,
} from "../_shared/email.ts";
import { renderBookingEmail } from "../_shared/bookingEmail.ts";
import { readBookingEmailContext } from "../_shared/bookingEmailContext.ts";

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

  // Resolve the customer contact (payment email takes precedence).
  let customerEmail: string | null = null;
  let customerName: string | null = null;
  if (body.target === "booking") {
    const { data } = await supabase
      .from("bookings")
      .select("id, contact, email, payment_email, name")
      .eq("id", body.id)
      .maybeSingle();
    if (!data) return json({ error: "Reserva no encontrada" }, 404);
    const candidates = [data.payment_email, data.email, data.contact];
    customerEmail = candidates.find((c) => c && isEmail(c))?.trim() ?? null;
    customerName = data.name;
  } else {
    const { data } = await supabase
      .from("contact_submissions")
      .select("id, contacto, email, nombre")
      .eq("id", body.id)
      .maybeSingle();
    if (!data) return json({ error: "Contacto no encontrado" }, 404);
    const candidates = [data.email, data.contacto];
    customerEmail = candidates.find((c) => c && isEmail(c))?.trim() ?? null;
    customerName = data.nombre;
  }

  // Reuse an existing pending payment request instead of creating a second one.
  const { data: pending } = await supabase
    .from("payment_requests")
    .select("id, token, amount_cents, currency, concept, expires_at, status")
    .eq(body.target === "booking" ? "booking_id" : "contact_id", body.id)
    .eq("status", "pendiente")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let record = pending && new Date(pending.expires_at).getTime() > Date.now() &&
      pending.amount_cents === body.amountCents
    ? pending
    : null;

  if (!record) {
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
      .select("id, token, amount_cents, currency, concept, expires_at, status")
      .single();

    if (error || !created) {
      console.error("Insert payment_request error", error);
      return json({ error: "No se pudo crear el cobro" }, 500);
    }
    record = created;
  }

  const url = `${body.baseUrl.replace(/\/$/, "")}/pago/${record.token}`;

  const table = body.target === "booking" ? "bookings" : "contact_submissions";
  const { error: statusError } = await supabase
    .from(table)
    .update({ status: "pendiente_pago" })
    .eq("id", body.id);
  if (statusError) {
    console.error("Status update error", statusError);
    return json({ error: "No se pudo actualizar el estado de la solicitud" }, 500);
  }

  let email: { status: string; error?: string } = { status: "no_solicitado" };
  if (body.sendEmail) {
    if (!customerEmail) {
      email = { status: "omitido", error: "La solicitud no tiene un email válido" };
    } else {
      const context = await readBookingEmailContext(supabase, body.target === "booking" ? body.id : null, record, false, true);
      const result = await sendTrackedNotification(supabase, {
        kind: "enlace_pago",
        dedupeKey: `payment_link:${record.id}`,
        recipients: [customerEmail],
        ...renderBookingEmail({ ...context, variant: "payment_link", state: "pendiente_pago", activity: context.activity ?? record.concept, name: customerName, payUrl: url, expiresAt: record.expires_at, sandbox: body.environment === "sandbox" }),
        paymentRequestId: record.id,
        bookingId: body.target === "booking" ? body.id : null,
        contactId: body.target === "contact" ? body.id : null,
      });
      email = { status: result.status, error: result.error };
    }
  }

  return json({
    ok: true,
    url,
    token: record.token,
    reused: Boolean(pending && record.id === pending.id),
    email,
  });
});
