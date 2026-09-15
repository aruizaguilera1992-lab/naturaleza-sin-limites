import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { dispatchNotification } from "../_shared/email.ts";

const BodySchema = z.object({
  id: z.string().uuid(),
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

  try {
    // Claims the notification with a recoverable lease and reuses the stable
    // provider idempotency key, so retries cannot duplicate an accepted email.
    const result = await dispatchNotification(supabase, parsed.data.id);
    return json({
      ok: result.status === "enviado" || result.status === "ya_enviado",
      status: result.status,
      error: result.error,
    });
  } catch (e) {
    console.error("retry-notification failed", e);
    return json({ error: "server_error", detail: String(e).slice(0, 200) }, 500);
  }
});
