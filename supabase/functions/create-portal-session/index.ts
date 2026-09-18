import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const BodySchema = z.object({
  token: z.string().regex(/^[a-f0-9]{16,64}$/),
  returnUrl: z.string().url().max(400),
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
  if (!parsed.success) return json({ error: "Enlace no válido" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: order, error } = await supabase
    .from("plan_orders")
    .select("stripe_customer_id, environment, status, product_name")
    .eq("portal_token", parsed.data.token)
    .maybeSingle();

  if (error) {
    console.error("portal lookup failed", error);
    return json({ error: "No disponible" }, 500);
  }
  if (!order?.stripe_customer_id) return json({ error: "Enlace no válido" }, 404);

  // The environment always comes from the stored order, never from the client.
  const env = order.environment as StripeEnv;
  const stripe = createStripeClient(env);

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: order.stripe_customer_id as string,
      return_url: parsed.data.returnUrl,
    });
    return json({ url: portal.url, productName: order.product_name });
  } catch (e) {
    const message = String((e as { message?: string })?.message ?? e).slice(0, 300);
    console.error("portal session failed", message);
    return json({ error: "No hemos podido abrir la gestión de tu suscripción" }, 502);
  }
});
