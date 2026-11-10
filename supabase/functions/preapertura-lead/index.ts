import { createClient } from "npm:@supabase/supabase-js@2";
import { handleLead } from "./handler.ts";
import { businessRecipients, listLayout, sendTrackedNotification } from "../_shared/email.ts";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const res = await handleLead(req, Deno.env.get("PREAPERTURA_FORWARD_SECRET"), async (row) => {
    const { data, error } = await supabase.from("contact_submissions").insert(row).select("id").single();
    if (!error && data?.id) {
      // Internal alert only (never to the lead). Failures must not reject the lead.
      const subject = `Nuevo contacto (preapertura): ${row.nombre}`;
      try {
        await sendTrackedNotification(supabase, {
          kind: "contacto_negocio",
          dedupeKey: `contact_business:${data.id}`,
          recipients: businessRecipients(),
          subject,
          contactId: data.id,
          html: listLayout(subject, [
            `Nombre: ${row.nombre}`,
            `Contacto: ${row.contacto}`,
            `Interés: ${row.interes}`,
            `Mensaje: ${row.mensaje ?? "-"}`,
            "Origen: web de preapertura",
          ]),
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
