import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { PLAN_CATALOG } from "../_shared/planCatalog.ts";

const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;

const BodySchema = z.object({
  priceId: z.string().min(2).max(80),
  name: z.string().min(2).max(120),
  email: z.string().email().max(150),
  phone: z.string().regex(phoneRegex).max(30),
  rgpd: z.literal(true),
  returnUrl: z.string().url().max(400),
  environment: z.enum(["sandbox", "live"]),
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

  const plan = PLAN_CATALOG[body.priceId];
  if (!plan) return json({ error: "Plan no disponible" }, 404);

  const origin = new URL(body.returnUrl).origin;
  if (!/^https:\/\/|^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return json({ error: "returnUrl no válida" }, 400);
  }

  const env: StripeEnv = body.environment;
  const stripe = createStripeClient(env);

  // Amount and recurrence always come from Stripe, never from the client.
  const prices = await stripe.prices.list({ lookup_keys: [plan.priceId], limit: 1 });
  const price = prices.data[0];
  if (!price) return json({ error: "Precio no encontrado" }, 404);
  const isRecurring = price.type === "recurring";

  // One Stripe customer per email so renewals and the billing portal resolve.
  const existing = await stripe.customers.list({ email: body.email, limit: 1 });
  const customer = existing.data[0] ??
    await stripe.customers.create({
      email: body.email,
      name: body.name,
      phone: body.phone,
    });

  const sessionParams = {
    line_items: [{ price: price.id, quantity: 1 }],
    mode: isRecurring ? "subscription" : "payment",
    ui_mode: "embedded_page",
    return_url: `${origin}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    customer: customer.id,
    automatic_tax: { enabled: true },
    metadata: {
      plan_order: "1",
      plan_price_id: plan.priceId,
      plan_name: plan.name,
      customer_name: body.name,
      customer_phone: body.phone,
      environment: env,
    },
    ...(isRecurring
      ? {
        subscription_data: {
          metadata: { plan_price_id: plan.priceId, plan_name: plan.name },
        },
      }
      : { payment_intent_data: { description: plan.name } }),
  };

  let session;
  try {
    session = await stripe.checkout.sessions.create(sessionParams as never);
  } catch (e) {
    const message = String((e as { message?: string })?.message ?? e).slice(0, 400);
    console.error("Plan checkout failed", message);
    return json({ error: "checkout_failed", detail: message }, 502);
  }

  // Persist the intent immediately so the admin panel sees abandoned checkouts
  // and the webhook has a row to complete.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error: insertError } = await supabase.from("plan_orders").insert({
    stripe_session_id: session.id,
    stripe_customer_id: customer.id,
    price_id: plan.priceId,
    product_name: plan.name,
    mode: isRecurring ? "suscripcion" : "paquete",
    status: "pendiente",
    amount_cents: price.unit_amount ?? null,
    currency: String(price.currency ?? "eur"),
    customer_email: body.email,
    customer_name: body.name,
    customer_phone: body.phone,
    environment: env,
  });
  if (insertError && insertError.code !== "23505") {
    console.error("plan_orders insert failed", insertError);
  }

  return json({ clientSecret: session.client_secret });
});
