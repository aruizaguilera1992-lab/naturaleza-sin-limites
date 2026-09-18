import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const BodySchema = z.object({
  token: z.string().regex(/^[a-f0-9]{16,80}$/),
  action: z.enum(["status", "checkout"]).default("status"),
  returnUrl: z.string().url().max(400).optional(),
});

const ALLOWED_CURRENCIES = new Set(["eur"]);

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

  const { data: pr, error: prError } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (prError) {
    console.error("payment_requests read error", prError);
    return json({ error: "server_error" }, 500);
  }
  if (!pr) return json({ error: "not_found" }, 404);

  // Public details of the related request.
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

  // ---- Validation before any chargeable session is created ----
  if (pr.environment !== "sandbox" && pr.environment !== "live") {
    console.error("Invalid payment environment", pr.environment);
    return json({ payment, error: "invalid_environment" }, 409);
  }
  const currency = String(pr.currency ?? "eur").toLowerCase();
  if (!ALLOWED_CURRENCIES.has(currency)) {
    return json({ payment, error: "invalid_currency" }, 409);
  }
  if (!Number.isInteger(pr.amount_cents) || pr.amount_cents < 50) {
    return json({ payment, error: "invalid_amount" }, 409);
  }

  const env = pr.environment as StripeEnv;
  const stripe = createStripeClient(env);

  // ---- Reuse an existing open session: never create two chargeable
  // sessions for the same payment request. ----
  let expiredSessionId: string | null = null;
  if (pr.stripe_session_id) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(pr.stripe_session_id);
      if (existing.status === "complete" || existing.payment_status === "paid") {
        return json({ payment, error: "already_paid" }, 409);
      }
      if (existing.status === "open" && existing.client_secret) {
        return json({ payment, clientSecret: existing.client_secret, reused: true });
      }
      if (existing.status !== "expired") {
        // Unknown/intermediate state: do NOT create a second session.
        return json({ payment, error: "checkout_unavailable" }, 409);
      }
      // Definitively expired: a new generation may be opened.
      expiredSessionId = pr.stripe_session_id;
    } catch (e) {
      console.error("Could not retrieve existing checkout session", e);
      return json({ payment, error: "checkout_unavailable" }, 502);
    }
  }

  // Atomically open/lock a checkout generation. Concurrent callers get the
  // same generation, and therefore the same idempotency key.
  const { data: gen, error: genError } = await supabase.rpc("begin_checkout_generation", {
    _token: token,
    _expired_session_id: expiredSessionId,
  });
  if (genError) {
    console.error("begin_checkout_generation failed", genError);
    return json({ payment, error: "server_error" }, 500);
  }
  if (!gen?.ok) return json({ payment, error: gen?.reason ?? "unavailable" }, 409);

  // Another request already stored a session for this generation.
  if (gen.session_id && gen.session_id !== expiredSessionId) {
    try {
      const concurrent = await stripe.checkout.sessions.retrieve(gen.session_id);
      if (concurrent.status === "open" && concurrent.client_secret) {
        return json({ payment, clientSecret: concurrent.client_secret, reused: true });
      }
    } catch (e) {
      console.error("Could not retrieve concurrent session", e);
    }
    return json({ payment, error: "checkout_unavailable" }, 409);
  }

  const generation: number = gen.generation ?? 0;

  // Stable, server-derived return URL: the caller only influences the origin,
  // which is validated and folded into the idempotency key.
  const origin = new URL(returnUrl).origin;
  if (!/^https:\/\/|^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return json({ payment, error: "invalid_return_url" }, 400);
  }
  const canonicalReturnUrl = `${origin}/pago/${token}?session_id={CHECKOUT_SESSION_ID}`;
  let originHash = 0;
  for (const ch of origin) originHash = (originHash * 33 + ch.charCodeAt(0)) >>> 0;

  const sessionParams = {
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: pr.concept, tax_code: "txcd_20030000" },
          unit_amount: pr.amount_cents,
          tax_behavior: "inclusive",
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "embedded_page",
    return_url: canonicalReturnUrl,
    payment_intent_data: { description: pr.concept },
    ...(pr.customer_email ? { customer_email: pr.customer_email } : {}),
    automatic_tax: { enabled: true },
    metadata: { payment_request_token: pr.token, environment: env },
  };

  let session;
  try {
    // No silent fallback: a tax configuration problem must surface.
    // Key is stable per (request, generation, amount, currency, origin), so
    // concurrent calls and retries resolve to ONE chargeable session.
    session = await stripe.checkout.sessions.create(sessionParams as never, {
      idempotencyKey:
        `pr_${pr.id}_g${generation}_${pr.amount_cents}_${currency}_${originHash.toString(16)}`,
    });
  } catch (e) {
    const message = String((e as { message?: string })?.message ?? e).slice(0, 400);
    console.error("Checkout session creation failed", message);
    await supabase
      .from("payment_requests")
      .update({ last_error: message })
      .eq("id", pr.id);
    return json({ payment, error: "checkout_failed", detail: message }, 502);
  }

  const { data: recorded, error: recordError } = await supabase.rpc("record_checkout_session", {
    _token: token,
    _generation: generation,
    _session_id: session.id,
  });

  if (recordError) {
    console.error("Could not persist checkout session id", recordError);
    return json({ payment, error: "server_error" }, 500);
  }
  if (!recorded?.ok) {
    // Someone else won the race; expire ours so only one session is payable.
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (e) {
      console.error("Could not expire losing session", e);
    }
    return json({ payment, error: recorded?.reason ?? "checkout_unavailable" }, 409);
  }

  return json({ payment, clientSecret: session.client_secret });
});
