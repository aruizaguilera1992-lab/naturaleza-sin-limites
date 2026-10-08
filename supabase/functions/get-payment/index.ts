import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { checkDepositEligibility, type DepositEligibility } from "./eligibility.ts";
import { openCheckout } from "./checkout.ts";

const BodySchema = z.object({
  token: z.string().regex(/^[a-f0-9]{16,80}$/),
  action: z.enum(["status", "checkout"]).default("status"),
  returnUrl: z.string().url().max(400).optional(),
  checkSession: z.boolean().optional(),
});

const ALLOWED_RETURN_ORIGINS = new Set([
  "https://naturalezasinlimites.es",
  "https://www.naturalezasinlimites.es",
]);
const isAllowedOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    if (ALLOWED_RETURN_ORIGINS.has(url.origin)) return true;
    if (url.protocol === "https:" && url.hostname.endsWith(".lovable.app")) return true;
    if (
      url.protocol === "https:" &&
      (url.hostname === "e8067521-0f87-494a-b789-e89c9f7b9922.lovableproject.com" ||
        url.hostname === "id-preview--e8067521-0f87-494a-b789-e89c9f7b9922.lovable.app")
    ) return true;
    if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return true;
    return false;
  } catch {
    return false;
  }
};

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
  const { token, action, returnUrl, checkSession } = parsed.data;

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

  // Scheduled outing: seat state decides whether the booking is confirmed.
  let hasEvent = false;
  let seatState: string | null = null;
  let link: { state: string; hold_expires_at: string | null; event_id: string } | null = null;
  let evInfo: { status: string; starts_at: string } | null = null;
  if (pr.booking_id) {
    const { data: linkRow } = await supabase
      .from("activity_event_bookings")
      .select("state, event_id, hold_expires_at")
      .eq("booking_id", pr.booking_id)
      .maybeSingle();
    link = linkRow;
    if (link) {
      hasEvent = true;
      seatState = link.state;
      const { data: ev } = await supabase
        .from("activity_events")
        .select("starts_at, status")
        .eq("id", link.event_id)
        .maybeSingle();
      evInfo = ev ?? null;
      if (ev?.starts_at) date = ev.starts_at;
    }
  }

  const expired = new Date(pr.expires_at).getTime() < Date.now();
  let status: string = pr.status === "pendiente" && expired ? "caducado" : pr.status;

  // After returning from checkout, ask the payment provider about THIS
  // session only to tell "processing" apart; confirmation is still webhook-only.
  let sessionState: "procesando" | "confirmando" | null = null;
  if (checkSession && pr.status === "pendiente" && pr.stripe_session_id &&
      (pr.environment === "sandbox" || pr.environment === "live")) {
    try {
      const s = await createStripeClient(pr.environment as StripeEnv)
        .checkout.sessions.retrieve(pr.stripe_session_id);
      if (s.status === "complete") {
        sessionState = s.payment_status === "unpaid" ? "procesando" : "confirmando";
      }
    } catch (e) {
      console.error("session status check failed", e);
    }
  }
  if (sessionState && status === "caducado") status = "pendiente";

  // Legacy automatic deposits created without a scheduled outing need a manual
  // availability check first: never open a new automatic checkout for them.
  // Manual admin payment requests (kind = 'manual') are unaffected.
  if (pr.kind === "senal" && pr.booking_id && !hasEvent && status === "pendiente" && !sessionState) {
    status = "en_validacion";
  }

  // Automatic deposit with outing: chargeable only while the seat hold is live
  // and the outing bookable. Never re-acquire seats here.
  const eligibility: DepositEligibility | null =
    pr.kind === "senal" && pr.booking_id && hasEvent ? checkDepositEligibility(link, evInfo) : null;
  if (eligibility && !eligibility.ok && status === "pendiente" && !sessionState) {
    status = "plaza_liberada";
  }

  // Booking state, separate from payment state.
  let bookingState: "confirmada" | "fecha_pendiente" | "en_revision" | null = null;
  if (pr.status === "pagado") {
    if (!pr.booking_id) bookingState = null;
    else if (!hasEvent) bookingState = "fecha_pendiente";
    else bookingState = seatState === "confirmada" ? "confirmada" : "en_revision";
  }

  const payment = {
    kind: pr.kind === "senal" ? "senal" : "manual",
    totalCents: pr.kind === "senal" && Number.isInteger(pr.total_cents) ? pr.total_cents : null,
    environment: pr.environment,
    sessionState,
    bookingState,
    hasEvent,
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

  if (status === "plaza_liberada" && pr.stripe_session_id &&
      (pr.environment === "sandbox" || pr.environment === "live")) {
    // Close any still-open session so the expired hold cannot be charged;
    // a completed one is reported as paid/processing (no second payment).
    try {
      const st = createStripeClient(pr.environment as StripeEnv);
      const s = await st.checkout.sessions.retrieve(pr.stripe_session_id);
      if (s.status === "complete" || s.payment_status === "paid") {
        return json({ payment, error: "already_paid" }, 409);
      }
      if (s.status === "open") await st.checkout.sessions.expire(s.id);
    } catch (e) {
      console.error("could not close session for released hold", e);
    }
  }
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
  if (!isAllowedOrigin(origin)) {
    return json({ payment, error: "invalid_return_url" }, 400);
  }
  const canonicalReturnUrl = `${origin}/pago/${token}?session_id={CHECKOUT_SESSION_ID}`;
  let originHash = 0;
  for (const ch of origin) originHash = (originHash * 33 + ch.charCodeAt(0)) >>> 0;

  const result = await openCheckout({
    rpc: (name, args) => supabase.rpc(name, args) as never,
    createSession: (params, idempotencyKey) =>
      stripe.checkout.sessions.create(params as never, { idempotencyKey }) as never,
    expireSession: (id) => stripe.checkout.sessions.expire(id),
    setLastError: (message) => supabase.from("payment_requests").update({ last_error: message }).eq("id", pr.id) as never,
  }, {
    pr,
    currency,
    env,
    generation,
    returnUrl: canonicalReturnUrl,
    originHash: originHash.toString(16),
  });
  if (!result.ok) {
    if (result.status >= 500) console.error("checkout preparation failed", result.error, result.detail ?? "");
    const shown = result.holdReleased ? { ...payment, status: "plaza_liberada" } : payment;
    return json({ payment: shown, error: result.error, ...(result.detail ? { detail: result.detail } : {}) }, result.status);
  }
  return json({ payment, clientSecret: result.clientSecret });
});
