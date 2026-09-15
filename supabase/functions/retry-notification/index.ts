import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { sendEmail } from "../_shared/email.ts";

const BodySchema = z.object({
  id: z.string().uuid(),
  recipientsOverride: z.array(z.string().email()).max(5).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(authToken ?? "");
  const user = userData?.user;
  if (!user) return json({ error: "No autorizado" }, 401);

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");
  if (!roles || roles.length === 0) return json({ error: "No autorizado" }, 403);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Datos no válidos" }, 400);

  const { data: entry, error } = await supabase
    .from("notification_log")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (error) {
    console.error("notification_log read error", error);
    return json({ error: "server_error" }, 500);
  }
  if (!entry) return json({ error: "not_found" }, 404);

  // Never duplicate a confirmation the provider already accepted.
  if (entry.status === "enviado") {
    return json({ ok: true, status: "enviado", deduped: true });
  }

  const recipients: string[] = parsed.data.recipientsOverride ??
    (entry.payload?.recipients ?? (entry.recipient ? entry.recipient.split(",") : []));
  const html: string = entry.payload?.html ?? "";

  if (!html) return json({ error: "sin_contenido" }, 409);

  const result = await sendEmail(recipients, entry.subject, html);

  const { error: updateError } = await supabase
    .from("notification_log")
    .update({
      status: result.status,
      provider_id: result.providerId ?? null,
      error: result.error ?? null,
      attempts: (entry.attempts ?? 0) + 1,
      recipient: recipients.join(", ") || null,
    })
    .eq("id", entry.id);

  if (updateError) console.error("notification_log update error", updateError);

  return json({ ok: result.status === "enviado", status: result.status, error: result.error });
});
