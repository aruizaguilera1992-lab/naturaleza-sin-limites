import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { CONSENT_TEXT, CONSENT_VERSION, discountCode, parseRequest } from "./handler.ts";
import { escapeHtml, layout, sendTrackedNotification } from "../_shared/email.ts";
import { isTrustedSiteOrigin } from "../_shared/siteOrigins.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "invalid_body" }, 400); }
  const p = parseRequest(body);
  if (!p.ok) return json({ error: p.error }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = req.headers.get("user-agent")?.slice(0, 300) ?? null;
  const origin = req.headers.get("origin") ?? "";
  const site = isTrustedSiteOrigin(origin) ? new URL(origin).origin : "https://naturalezasinlimites.es";

  try {
    if (p.action === "subscribe") {
      const norm = p.email.toLowerCase();
      const { data: existing } = await db.from("newsletter_subscribers").select("*").eq("email_normalized", norm).maybeSingle();
      let sub = existing;
      if (!sub) {
        const { data, error } = await db.from("newsletter_subscribers")
          .insert({ email: p.email, email_normalized: norm, segments: p.segments, consent_version: CONSENT_VERSION })
          .select("*").single();
        if (error) throw error;
        sub = data;
      } else if (sub.status !== "confirmado") {
        // Re-subscription restarts the double opt-in with a fresh token.
        const { data, error } = await db.from("newsletter_subscribers")
          .update({ status: "pendiente", segments: p.segments, consent_version: CONSENT_VERSION, unsubscribed_at: null,
            confirm_token: crypto.getRandomValues(new Uint8Array(24)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "") })
          .eq("id", sub.id).select("*").single();
        if (error) throw error;
        sub = data;
      }
      if (sub.status === "pendiente") {
        await db.from("consent_records").insert({ subscriber_id: sub.id, action: "alta", consent_text: CONSENT_TEXT, consent_version: CONSENT_VERSION, ip, user_agent: ua });
        const link = `${site}/newsletter?accion=confirmar&token=${sub.confirm_token}`;
        const html = layout("Confirma tu suscripción", `
          <p>Hola, gracias por apuntarte a la newsletter de Naturaleza Sin Límites.</p>
          <p>Para empezar a recibirla, confirma tu email:</p>
          <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Confirmar suscripción</a></p>
          <p style="font-size:13px;color:#666">Al confirmar recibirás tu código de 10 % de descuento para tu primera actividad. Si no has sido tú, ignora este correo.</p>`);
        await sendTrackedNotification(db, {
          kind: "newsletter_confirmacion",
          dedupeKey: `newsletter_confirm:${sub.id}:${sub.confirm_token}`,
          recipients: [sub.email], subject: "Confirma tu suscripción a la newsletter", html,
        });
      }
      // Same answer whatever the prior state: never reveal which emails exist.
      return json({ ok: true });
    }

    const col = p.action === "confirm" ? "confirm_token" : "unsubscribe_token";
    const { data: sub } = await db.from("newsletter_subscribers").select("*").eq(col, p.token).maybeSingle();
    if (!sub) return json({ ok: false, error: "not_found" }, 404);

    if (p.action === "confirm") {
      if (sub.status === "baja") return json({ ok: false, error: "unsubscribed" }, 409);
      if (sub.status === "confirmado") return json({ ok: true, already: true, discount_code: sub.discount_code });
      const code = discountCode(sub.id);
      const { error } = await db.from("newsletter_subscribers")
        .update({ status: "confirmado", confirmed_at: new Date().toISOString(), discount_code: code }).eq("id", sub.id).eq("status", "pendiente");
      if (error) throw error;
      await db.from("consent_records").insert({ subscriber_id: sub.id, action: "confirmacion", consent_text: CONSENT_TEXT, consent_version: sub.consent_version, ip, user_agent: ua });
      const unsub = `${site}/newsletter?accion=baja&token=${sub.unsubscribe_token}`;
      await sendTrackedNotification(db, {
        kind: "newsletter_bienvenida",
        dedupeKey: `newsletter_welcome:${sub.id}`,
        recipients: [sub.email], subject: "Bienvenida a la newsletter · tu 10 % de descuento",
        html: layout("¡Ya estás dentro!", `
          <p>Tu suscripción está confirmada. Este es tu código de <strong>10 % de descuento</strong> para tu primera actividad:</p>
          <p style="font-size:22px;font-weight:bold;letter-spacing:2px;color:#FF6B35">${escapeHtml(code)}</p>
          <p>Indícalo en el mensaje al reservar o por WhatsApp y te lo aplicamos.</p>
          <p style="font-size:12px;color:#666">¿No quieres recibir más correos? <a href="${escapeHtml(unsub)}">Darme de baja</a></p>`),
      });
      return json({ ok: true, discount_code: code });
    }

    if (sub.status !== "baja") {
      const { error } = await db.from("newsletter_subscribers").update({ status: "baja", unsubscribed_at: new Date().toISOString() }).eq("id", sub.id);
      if (error) throw error;
      await db.from("consent_records").insert({ subscriber_id: sub.id, action: "baja", consent_version: sub.consent_version, ip, user_agent: ua });
    }
    return json({ ok: true });
  } catch (e) {
    console.error("newsletter failed", e);
    return json({ error: "server_error" }, 500);
  }
});
