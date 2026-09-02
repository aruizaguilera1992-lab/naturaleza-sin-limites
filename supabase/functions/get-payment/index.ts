import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const BodySchema = z.object({
  token: z.string().regex(/^[a-f0-9]{16,80}$/),
  action: z.enum(["status", "checkout"]).default("status"),
  environment: z.enum(["sandbox", "live"]).optional(),
  returnUrl: z.string().url().max(400).optional(),
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
  if (!parsed.success) return json({ error: "Solicitud no válida" }, 400);
  const { token, action, returnUrl } = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: pr } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!pr) return json({ error: "not_found" }, 404);

  // Resolve public details of the related request.
  let activity = pr.concept;
  let date: string | null = null;
  let people: string | null = null;
  let name: string | null = null;

  if (pr.booking_id) {
    const { data } = await supabase
      .from("bookings")
      .select("activity, preferred_date, number_of_people, name")
      .eq("id", pr.booking_id)
      .maybeSingle();
    if (data) {
      activity = data.activity ?? activity;
      date = data.preferred_date;
      people = data.number_of_people;
      name = data.name;
    }
  } else if (pr.contact_id) {
    const { data } = await supabase
      .from("contact_submissions")
      .select("interes, personas, nombre")
      .eq("id", pr.contact_id)
      .maybeSingle();
    if (data) {
      activity = data.interes ?? activity;
      people = data.personas;
      name = data.nombre;
    }
  }

  const expired = new Date(pr.expires_at).getTime() < Date.now();
  const status: string = pr.status === "pendiente" && expired ? "caducado" : pr.status;

  const payment = {
    concept: pr.concept,
    amountCents: pr.amount_cents,
    currency: pr.currency,
    status,
    paidAt: pr.paid_at,
    activity,
    date,
    people,
    name,
  };

  if (action === "status") return json({ payment });

  if (status !== "pendiente") return json({ payment, error: "unavailable" }, 409);
  if (!returnUrl) return json({ error: "returnUrl requerido" }, 400);

  const env = (pr.environment === "live" ? "live" : "sandbox") as StripeEnv;
  const stripe = createStripeClient(env);

  const sessionParams: Record<string, unknown> = {
    line_items: [
      {
        price_data: {
          currency: pr.currency,
          product_data: { name: pr.concept },
          unit_amount: pr.amount_cents,
          tax_behavior: "inclusive",
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "embedded_page",
    return_url: returnUrl,
    payment_intent_data: { description: pr.concept },
    ...(pr.customer_email ? { customer_email: pr.customer_email } : {}),
    metadata: { payment_request_token: pr.token },
  };

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      ...sessionParams,
      automatic_tax: { enabled: true },
    } as never);
  } catch (e) {
    console.error("automatic_tax session failed, retrying without it", e);
    session = await stripe.checkout.sessions.create(sessionParams as never);
  }

  await supabase
    .from("payment_requests")
    .update({ stripe_session_id: session.id })
    .eq("id", pr.id);

  return json({ payment, clientSecret: session.client_secret });
});
