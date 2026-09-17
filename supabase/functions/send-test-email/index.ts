// Temporary diagnostic function: sends one test email through Resend.
import { sendEmail, businessRecipients, layout } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const recipients = businessRecipients();
  const result = await sendEmail(
    recipients,
    "Prueba de configuración de correo",
    layout(
      "Prueba de configuración",
      "<p>Este es un correo de prueba para verificar el remitente y el Reply-To.</p>",
    ),
    `test-email-${new Date().toISOString().slice(0, 16)}`,
  );

  return new Response(
    JSON.stringify({
      recipients,
      from: Deno.env.get("NOTIFICATION_FROM"),
      replyTo: Deno.env.get("NOTIFICATION_REPLY_TO"),
      result,
    }),
    { status: result.status === "enviado" ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
