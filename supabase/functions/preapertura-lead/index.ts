import { createClient } from "npm:@supabase/supabase-js@2";
import { handleLead } from "./handler.ts";
import { businessRecipients, sendTrackedNotification } from "../_shared/email.ts";
import { renderLeadAlert } from "../_shared/leadAlertEmail.ts";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const res = await handleLead(req, Deno.env.get("PREAPERTURA_FORWARD_SECRET"), async (row) => {
    const { data, error } = await supabase.from("contact_submissions").insert(row).select("id").single();
    if (!error && data?.id) {
      // Internal alert only (never to the lead). Failures must not reject the lead.
      const alert = renderLeadAlert({ nombre: row.nombre, origen: "Web de preapertura", contacto: row.contacto, interes: row.interes, mensaje: row.mensaje });
      try {
        await sendTrackedNotification(supabase, {
          kind: "contacto_negocio",
          dedupeKey: `contact_business:${data.id}`,
          recipients: businessRecipients(),
          subject: alert.subject,
          contactId: data.id,
          html: alert.html,
          text: alert.text,
        });
      } catch (e) {
        console.error("preapertura alert failed", e);
      }
    }
    return { error };
  });
  console.log("preapertura-lead", req.method, res.status);
  return res;
});
