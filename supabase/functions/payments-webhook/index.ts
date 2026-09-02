import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";
import { escapeHtml, formatAmount, layout, notifyBusiness, sendEmail } from "../_shared/email.ts";

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

async function fulfill(session: any) {
  const token = session?.metadata?.payment_request_token;
  if (!token) {
    console.log("Session without payment_request_token, ignoring");
    return;
  }
  const supabase = getSupabase();

  const { data: pr } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!pr) {
    console.error("Payment request not found for token");
    return;
  }
  if (pr.status === "pagado") {
    console.log("Payment already processed (idempotent)");
    return;
  }

  const paidAt = new Date().toISOString();
  const reference: string = session.payment_intent ?? session.id;
  const amountCents: number = session.amount_total ?? pr.amount_cents;

  await supabase
    .from("payment_requests")
    .update({
      status: "pagado",
      paid_at: paidAt,
      payment_reference: reference,
      stripe_session_id: session.id,
    })
    .eq("id", pr.id);

  const table = pr.booking_id ? "bookings" : "contact_submissions";
  const recordId = pr.booking_id ?? pr.contact_id;
  await supabase
    .from(table)
    .update({
      status: "confirmada",
      paid_amount_cents: amountCents,
      paid_at: paidAt,
      payment_reference: reference,
    })
    .eq("id", recordId);

  const amount = formatAmount(amountCents, pr.currency ?? "eur");
  const customerEmail: string | null = pr.customer_email ?? session.customer_details?.email ?? null;

  if (customerEmail) {
    await sendEmail(
      [customerEmail],
      `Reserva confirmada · ${pr.concept}`,
      layout("¡Tu reserva está confirmada!", `
        <p>Hemos recibido tu pago correctamente y tu plaza queda <strong>confirmada</strong>.</p>
        <p><strong>${escapeHtml(pr.concept)}</strong><br/>Importe pagado: <strong>${escapeHtml(amount)}</strong><br/>Referencia: ${escapeHtml(reference)}</p>
        <p><strong>Antes de la actividad:</strong></p>
        <ul>
          <li>Te enviaremos el punto de encuentro y la hora exacta con antelación.</li>
          <li>Lleva ropa deportiva, calzado adecuado, agua y algo de comida.</li>
          <li>El material técnico y los seguros están incluidos.</li>
          <li>Si la meteorología obliga a cancelar, reprogramamos o devolvemos el importe.</li>
        </ul>
        <p>Cualquier duda, respóndenos a este email o escríbenos por WhatsApp al <strong>+34 685 60 95 42</strong>.</p>
      `),
    );
  }

  await notifyBusiness(`Pago recibido: ${pr.concept}`, [
    `Concepto: ${pr.concept}`,
    `Importe: ${amount}`,
    `Cliente: ${customerEmail ?? "-"}`,
    `Referencia: ${reference}`,
    `Tipo: ${pr.booking_id ? "reserva" : "contacto"}`,
  ]);
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
        if (session.payment_status !== "unpaid") await fulfill(session);
        break;
      }
      case "checkout.session.async_payment_succeeded":
        await fulfill(event.data.object);
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
