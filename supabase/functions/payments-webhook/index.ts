import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";
import {
  businessRecipients,
  dispatchPendingForPayment,
  escapeHtml,
  formatAmount,
  layout,
  listLayout,
  type NotificationIntent,
  sendTrackedNotification,
  toRpcNotification,
} from "../_shared/email.ts";
import { PLAN_CATALOG } from "../_shared/planCatalog.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

function buildIntents(opts: {
  paymentRequestId: string;
  concept: string;
  amount: string;
  reference: string;
  customerEmail: string | null;
  env: StripeEnv;
  isBooking: boolean;
}): NotificationIntent[] {
  const intents: NotificationIntent[] = [];
  const { concept, amount, reference } = opts;

  if (opts.customerEmail) {
    intents.push({
      kind: "pago_confirmado_cliente",
      dedupeKey: `payment_confirmed_customer:${opts.paymentRequestId}`,
      recipients: [opts.customerEmail],
      subject: `Reserva confirmada · ${concept}`,
      html: layout("¡Tu reserva está confirmada!", `
        <p>Hemos recibido tu pago correctamente y tu plaza queda <strong>confirmada</strong>.</p>
        <p><strong>${escapeHtml(concept)}</strong><br/>Importe pagado: <strong>${escapeHtml(amount)}</strong><br/>Referencia: ${escapeHtml(reference)}</p>
        <p><strong>Antes de la actividad:</strong></p>
        <ul>
          <li>Te enviaremos el punto de encuentro y la hora exacta con antelación.</li>
          <li>Lleva ropa deportiva, calzado adecuado, agua y algo de comida.</li>
          <li>El material técnico y los seguros están incluidos.</li>
          <li>Si la meteorología obliga a cancelar, reprogramamos o devolvemos el importe.</li>
        </ul>
        <p>Cualquier duda, respóndenos a este email o escríbenos por WhatsApp al <strong>+34 685 60 95 42</strong>.</p>
      `),
    });
  }

  const subject = `Pago recibido: ${concept}`;
  intents.push({
    kind: "pago_confirmado_negocio",
    dedupeKey: `payment_confirmed_business:${opts.paymentRequestId}`,
    recipients: businessRecipients(),
    subject,
    html: listLayout(subject, [
      `Concepto: ${concept}`,
      `Importe: ${amount}`,
      `Cliente: ${opts.customerEmail ?? "-"}`,
      `Referencia: ${reference}`,
      `Entorno: ${opts.env}`,
      `Tipo: ${opts.isBooking ? "reserva" : "contacto"}`,
    ]),
  });

  return intents;
}

/**
 * Plans and packs bought directly from the web. The order row already exists
 * (created when the checkout opened); here it is confirmed and the customer
 * gets the onboarding email.
 */
// deno-lint-ignore no-explicit-any
async function fulfillPlanOrder(session: any, env: StripeEnv) {
  if (session?.payment_status === "unpaid") {
    console.log("Plan session not settled yet", session?.id);
    return;
  }
  const supabase = getSupabase();
  const sessionId: string = session.id;
  const priceId: string | undefined = session?.metadata?.plan_price_id;
  const plan = priceId ? PLAN_CATALOG[priceId] : undefined;
  const amountCents: number | null = typeof session.amount_total === "number"
    ? session.amount_total
    : null;
  const currency = String(session.currency ?? "eur").toLowerCase();
  const email: string | null = session.customer_details?.email ??
    session?.metadata?.customer_email ?? null;
  const name: string | null = session?.metadata?.customer_name ?? null;
  const subscriptionId: string | null = typeof session.subscription === "string"
    ? session.subscription
    : null;

  const { data: order, error } = await supabase
    .from("plan_orders")
    .update({
      status: "pagado",
      amount_cents: amountCents,
      currency,
      ...(subscriptionId ? { stripe_subscription_id: subscriptionId } : {}),
      ...(email ? { customer_email: email } : {}),
    })
    .eq("stripe_session_id", sessionId)
    .eq("environment", env)
    .select("id, customer_email, customer_name, product_name, status, portal_token")
    .maybeSingle();

  if (error) {
    console.error("plan_orders update failed", error);
    throw new Error("plan_order_update_failed"); // Stripe retries.
  }
  if (!order) {
    console.log("No plan order for session", sessionId);
    return;
  }

  const productName = (order.product_name as string) ?? plan?.name ?? "Tu plan";
  const amount = amountCents !== null ? formatAmount(amountCents, currency) : "-";
  const recipient = (order.customer_email as string | null) ?? email;
  const greetName = (order.customer_name as string | null) ?? name;
  const isSubscription = Boolean(subscriptionId);

  // Self-service management link (billing portal) for subscriptions.
  let portalBlock = "";
  if (isSubscription && order.portal_token) {
    let origin: string | null = null;
    try {
      origin = session?.return_url ? new URL(session.return_url).origin : null;
    } catch {
      origin = null;
    }
    if (origin) {
      const portalUrl = `${origin}/mi-suscripcion/${order.portal_token}`;
      portalBlock =
        `<p>Puedes consultar tus facturas, cambiar la tarjeta o cancelar tu suscripción cuando quieras desde este enlace personal: <a href="${portalUrl}">gestionar mi suscripción</a>.</p>`;
    }
  }

  if (recipient) {
    await sendTrackedNotification(supabase, {
      kind: "plan_confirmado_cliente",
      dedupeKey: `plan_customer:${sessionId}`,
      recipients: [recipient],
      subject: `Alta confirmada · ${productName}`,
      html: layout("¡Bienvenido a Vértigo Sapiens!", `
        <p>${greetName ? `Hola ${escapeHtml(greetName)},` : "Hola,"}</p>
        <p>Hemos recibido tu pago y tu alta queda <strong>confirmada</strong>.</p>
        <p><strong>${escapeHtml(productName)}</strong><br/>Importe: <strong>${escapeHtml(amount)}</strong>${
        isSubscription ? "<br/>Renovación: mensual, puedes cancelarla cuando quieras." : ""
      }</p>
        <p>${escapeHtml(plan?.onboarding ?? "En breve te escribimos con los siguientes pasos.")}</p>
        ${portalBlock}
        <p>Cualquier duda, responde a este correo o escríbenos por WhatsApp al <strong>+34 685 60 95 42</strong>.</p>
      `),
    });
  }

  const subject = `Nueva alta: ${productName}`;
  await sendTrackedNotification(supabase, {
    kind: "plan_confirmado_negocio",
    dedupeKey: `plan_business:${sessionId}`,
    recipients: businessRecipients(),
    subject,
    html: listLayout(subject, [
      `Producto: ${productName}`,
      `Importe: ${amount}`,
      `Tipo: ${isSubscription ? "suscripción" : "pago único"}`,
      `Cliente: ${greetName ?? "-"}`,
      `Email: ${recipient ?? "-"}`,
      `Teléfono: ${session?.metadata?.customer_phone ?? "-"}`,
      `Entorno: ${env}`,
    ]),
  });
}

// deno-lint-ignore no-explicit-any
async function updateSubscription(subscription: any, env: StripeEnv, canceled = false) {
  const item = subscription.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const { error } = await getSupabase()
    .from("plan_orders")
    .update({
      status: canceled ? "cancelado" : String(subscription.status ?? "activo"),
      cancel_at_period_end: subscription.cancel_at_period_end === true,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      ...(item?.price?.lookup_key ? { price_id: item.price.lookup_key } : {}),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
  if (error) {
    console.error("subscription update failed", error);
    throw new Error("subscription_update_failed");
  }
}

/**
 * Monthly renewals and failed charges. Keeps the order row truthful so the
 * admin panel shows whether the plan is really being paid every month.
 */
// deno-lint-ignore no-explicit-any
async function handleInvoice(invoice: any, env: StripeEnv, paid: boolean) {
  const subscriptionId: string | null = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice?.parent?.subscription_details?.subscription ?? null;
  if (!subscriptionId) return;

  const supabase = getSupabase();
  const amountCents: number | null = typeof invoice.amount_paid === "number" && paid
    ? invoice.amount_paid
    : typeof invoice.amount_due === "number"
    ? invoice.amount_due
    : null;

  const { data: order, error } = await supabase
    .from("plan_orders")
    .update({
      last_invoice_status: paid ? "pagada" : "fallida",
      last_invoice_at: new Date().toISOString(),
      last_invoice_amount_cents: amountCents,
      ...(paid ? {} : { status: "pago_fallido" }),
    })
    .eq("stripe_subscription_id", subscriptionId)
    .eq("environment", env)
    .select("id, product_name, customer_email")
    .maybeSingle();

  if (error) {
    console.error("invoice update failed", error);
    throw new Error("invoice_update_failed");
  }
  if (!order) return;

  if (!paid) {
    const subject = `Cobro fallido: ${order.product_name}`;
    await sendTrackedNotification(supabase, {
      kind: "cobro_fallido_negocio",
      dedupeKey: `invoice_failed:${invoice.id}`,
      recipients: businessRecipients(),
      subject,
      html: listLayout(subject, [
        `Producto: ${order.product_name}`,
        `Cliente: ${order.customer_email ?? "-"}`,
        `Importe: ${amountCents !== null ? formatAmount(amountCents, String(invoice.currency ?? "eur")) : "-"}`,
        `Entorno: ${env}`,
        "El proveedor reintentará el cobro automáticamente.",
      ]),
    });
  }
}

// deno-lint-ignore no-explicit-any
async function fulfill(session: any, env: StripeEnv) {
  const token = session?.metadata?.payment_request_token;
  if (!token) {
    if (session?.metadata?.plan_order === "1") {
      await fulfillPlanOrder(session, env);
      return;
    }
    console.log("Session without payment_request_token, ignoring");
    return;
  }
  const supabase = getSupabase();

  const sessionId: string | null = typeof session.id === "string" ? session.id : null;
  const paymentStatus: string | null = typeof session.payment_status === "string"
    ? session.payment_status
    : null;
  const paymentIntentId: string | null =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  const reference: string = paymentIntentId ?? sessionId ?? "";
  const amountCents: number | null = typeof session.amount_total === "number"
    ? session.amount_total
    : null;
  const currency: string = String(session.currency ?? "eur").toLowerCase();
  const livemode: boolean = session.livemode === true;
  const customerEmail: string | null = session.customer_details?.email ?? null;

  if (!sessionId || amountCents === null || !paymentStatus) {
    console.error("Session missing id/amount/payment_status, not confirming", session?.id);
    return;
  }
  if (paymentStatus === "unpaid" || !["paid", "no_payment_required"].includes(paymentStatus)) {
    console.log("Payment status not final, ignoring:", paymentStatus);
    return;
  }

  // Look up concept/target so notification intents can be created durably in
  // the SAME transaction as the confirmation.
  const { data: pr, error: prError } = await supabase
    .from("payment_requests")
    .select("id, concept, booking_id, customer_email")
    .eq("token", token)
    .maybeSingle();
  if (prError) {
    console.error("payment_requests read failed", prError);
    throw new Error("read_failed"); // Stripe retries.
  }
  if (!pr) {
    console.log("Unknown payment_request token");
    return;
  }

  const intents = buildIntents({
    paymentRequestId: pr.id as string,
    concept: (pr.concept as string) ?? "Actividad",
    amount: formatAmount(amountCents, currency),
    reference,
    customerEmail: (pr.customer_email as string | null) ?? customerEmail,
    env,
    isBooking: Boolean(pr.booking_id),
  });

  // Atomic confirmation: validates session, payment status, livemode,
  // environment, currency and the EXACT amount, updates payment_requests +
  // booking/contact, and persists the notification intents. Any failure rolls
  // the whole thing back.
  const { data: result, error } = await supabase.rpc("confirm_payment_request", {
    _token: token,
    _session_id: sessionId,
    _payment_intent_id: paymentIntentId,
    _amount_cents: amountCents,
    _currency: currency,
    _environment: env,
    _payment_status: paymentStatus,
    _livemode: livemode,
    _customer_email: customerEmail,
    _notifications: intents.map(toRpcNotification),
  });

  if (error) {
    console.error("confirm_payment_request failed", error);
    throw new Error("confirm_failed"); // Stripe will retry.
  }

  // deno-lint-ignore no-explicit-any
  const outcome = result as any;
  const reason: string | undefined = outcome?.reason;

  if (!outcome?.applied && reason !== "already_paid") {
    console.error("Payment not applied:", reason);
    await supabase
      .from("payment_requests")
      .update({ last_error: `webhook: ${reason ?? "desconocido"}` })
      .eq("token", token);
    return;
  }

  // Applied OR already_paid: intents are durable, so a repeated event repairs
  // pending notifications without resending accepted ones.
  const paymentRequestId: string = outcome.payment_request_id ?? pr.id;
  try {
    const results = await dispatchPendingForPayment(supabase, paymentRequestId);
    console.log("Notification dispatch", JSON.stringify(results));
  } catch (e) {
    // Payment stays confirmed; the intent stays pending and is retried by a
    // later event or from the admin panel.
    console.error("Notification dispatch failed (payment kept confirmed)", e);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook with invalid env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfill(event.data.object, env);
        break;
      case "checkout.session.async_payment_failed":
        console.log("Async payment failed for session", event.data.object?.id);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await updateSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await updateSubscription(event.data.object, env, true);
        break;
      case "invoice.paid":
        await handleInvoice(event.data.object, env, true);
        break;
      case "invoice.payment_failed":
        await handleInvoice(event.data.object, env, false);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
