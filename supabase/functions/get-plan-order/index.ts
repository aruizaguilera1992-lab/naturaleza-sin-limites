import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  sessionId: z.string().min(8).max(200).regex(/^cs_[A-Za-z0-9_]+$/),
  // Required to reveal the subscription-management link: the caller must
  // also know the customer email stored on the order.
  email: z.string().email().max(200).optional(),
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
  if (!parsed.success) return json({ error: "Referencia no válida" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("plan_orders")
    .select("product_name, mode, status, amount_cents, currency, customer_email, portal_token")
    .eq("stripe_session_id", parsed.data.sessionId)
    .maybeSingle();

  if (error) {
    console.error("plan order read failed", error);
    return json({ error: "No disponible" }, 500);
  }
  if (!data) return json({ found: false });

  const emailMatches =
    parsed.data.email !== undefined &&
    data.customer_email !== null &&
    parsed.data.email.trim().toLowerCase() === (data.customer_email as string).trim().toLowerCase();

  return json({
    found: true,
    productName: data.product_name,
    mode: data.mode,
    status: data.status,
    amountCents: data.amount_cents,
    currency: data.currency,
    // Only a paid subscription can be managed in the billing portal, and the
    // portal token is only revealed when the caller proves knowledge of the
    // customer email stored on the order.
    portalToken:
      data.mode === "suscripcion" && data.status !== "pendiente" && emailMatches
        ? data.portal_token
        : null,
  });
});
