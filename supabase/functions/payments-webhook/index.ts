import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";
import {
  businessRecipients,
  escapeHtml,
  formatAmount,
  layout,
  listLayout,
  sendTrackedNotification,
} from "../_shared/email.ts";

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

// deno-lint-ignore no-explicit-any
async function fulfill(session: any, env: StripeEnv) {
  const token = session?.metadata?.payment_request_token;
  if (!token) {
    console.log("Session without payment_request_token, ignoring");
    return;
  }
  const supabase = getSupabase();

  const reference: string = session.payment_intent ?? session.id;
  const paymentIntentId: string | null =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  const amountCents: number | null = typeof session.amount_total === "number"
    ? session.amount_total
    : null;
  const currency: string = String(session.currency ?? "eur").toLowerCase();

  if (amountCents === null) {
    console.error("Session without amount_total, not confirming", session.id);
    return;
  }

  // Atomic + idempotent confirmation: validates environment, currency and
  // amount, and updates payment_requests + booking/contact in one step.
  const { data: result, error } = await supabase.rpc("confirm_payment_request", {
    _token: token,
    _reference: reference,
    _payment_intent_id: paymentIntentId,
    _amount_cents: amountCents,
    _currency: currency,
    _environment: env,
  });

  if (error) {
    console.error("confirm_payment_request failed", error);
    throw new Error("confirm_failed"); // Stripe will retry.
  }

  // deno-lint-ignore no-explicit-any
  const outcome = result as any;
  if (!outcome?.applied) {
    console.log("Payment not applied:", outcome?.reason);
    if (outcome?.reason && outcome.reason !== "already_paid") {
      await supabase
        .from("payment_requests")
        .update({ last_error: `webhook: ${outcome.reason}` })
        .eq("token", token);
    }
    // already_paid / mismatch: acknowledge without duplicating emails.
    return;
  }

  const amount = formatAmount(amountCents, outcome.currency ?? currency);
  const customerEmail: string | null =
    outcome.customer_email ?? session.customer_details?.email ?? null;
  const concept: string = outcome.concept ?? "Actividad";

  // Email failures must NEVER undo a confirmed payment.
  try {
    if (customerEmail) {
      await sendTrackedNotification(supabase, {
        kind: "pago_confirmado_cliente",
        dedupeKey: `payment_confirmed_customer:${outcome.payment_request_id}`,
        recipients: [customerEmail],
        subject: `Reserva confirmada · ${concept}`,
        paymentRequestId: outcome.payment_request_id,
        bookingId: outcome.booking_id,
        contactId: outcome.contact_id,
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
    await sendTrackedNotification(supabase, {
      kind: "pago_confirmado_negocio",
      dedupeKey: `payment_confirmed_business:${outcome.payment_request_id}`,
      recipients: businessRecipients(),
      subject,
      paymentRequestId: outcome.payment_request_id,
      bookingId: outcome.booking_id,
      contactId: outcome.contact_id,
      html: listLayout(subject, [
        `Concepto: ${concept}`,
        `Importe: ${amount}`,
        `Cliente: ${customerEmail ?? "-"}`,
        `Referencia: ${reference}`,
        `Entorno: ${env}`,
        `Tipo: ${outcome.booking_id ? "reserva" : "contacto"}`,
      ]),
    });
  } catch (e) {
    console.error("Notification error after confirmed payment (payment kept)", e);
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
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.payment_status !== "unpaid") await fulfill(session, env);
        break;
      }
      case "checkout.session.async_payment_succeeded":
        await fulfill(event.data.object, env);
        break;
      case "checkout.session.async_payment_failed":
        console.log("Async payment failed for session", event.data.object?.id);
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
