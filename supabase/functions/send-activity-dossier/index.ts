import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { sendTrackedNotification } from '../_shared/email.ts';
import { isTrustedSiteOrigin } from '../_shared/siteOrigins.ts';
import { appleMapsUrl, extractUrl, googleMapsUrl, isShortMapLink, resolveMapsLink, textWithoutUrl } from '../_shared/meetingPointLinks.ts';

const schema = z.object({ id: z.string().uuid(), email: z.string().email().max(254), origin: z.string().url().max(300), send_id: z.string().uuid() }).strict();
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  let raw: unknown; try { raw = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const parsed = schema.safeParse(raw); if (!parsed.success) return json({ error: 'Datos no válidos' }, 400);
  const p = parsed.data; if (!isTrustedSiteOrigin(p.origin)) return json({ error: 'Origen no permitido' }, 400);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: auth } = await db.auth.getUser(req.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '');
  if (!auth?.user) return json({ error: 'Sesión no válida' }, 401);
  const { data: role } = await db.rpc('has_role', { _user_id: auth.user.id, _role: 'admin' }); if (!role) return json({ error: 'No autorizado' }, 403);
  const { data: d } = await db.from('activity_dossiers').select('id, token, content, booking_id, status, bookings(activity, preferred_date, name)').eq('id', p.id).maybeSingle();
  if (!d) return json({ error: 'Dossier no encontrado' }, 404);
  const b = (d as any).bookings ?? {}; const c = (d.content ?? {}) as any;
  const origin = new URL(p.origin).origin; const link = `${origin}/dossier/${d.token}`;
  const li = (arr: unknown) => (Array.isArray(arr) ? arr : []).map((x) => `<li style="margin:0 0 6px">${esc(x)}</li>`).join('');
  const sched = (Array.isArray(c.schedule) ? c.schedule : []).map((s: any) => `<tr><td style="padding:6px 12px 6px 0;color:#FF6B35;font-weight:bold;white-space:nowrap">${esc(s.time)}</td><td style="padding:6px 0">${esc(s.label)}</td></tr>`).join('');
  const html = `<div style="background:#ffffff;font-family:Arial,sans-serif;color:#1A1A1A"><div style="max-width:600px;margin:0 auto"><div style="background:#1A1A1A;color:#fff;padding:20px 24px;border-bottom:4px solid #FF6B35"><strong>Naturaleza Sin Límites</strong></div><div style="padding:24px">
<h1 style="font-size:22px;margin:0 0 6px">Pasos a seguir</h1><p style="margin:0 0 18px;color:#555">${esc(b.activity)}${b.preferred_date ? ` · ${esc(b.preferred_date)}` : ''}</p>
<h2 style="font-size:16px">Cronograma</h2><table style="border-collapse:collapse">${sched}</table>
<h2 style="font-size:16px">Qué necesitas</h2><ul>${li(c.needs)}</ul><h2 style="font-size:16px">Normas de participación</h2><ul>${li(c.rules)}</ul>
<p style="margin:18px 0">Completa el <strong>registro para el seguro de responsabilidad</strong>${c.canyoning ? ' y las <strong>medidas para neopreno y escarpines</strong>' : ''} de cada participante:</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Completar registro</a></p>
<p style="font-size:13px;color:#777">Enlace personal: ${esc(link)}<br>Dudas: WhatsApp +34 685 60 95 42</p></div></div></div>`;
  await db.from('activity_dossiers').update({ status: d.status === 'completado' ? 'completado' : 'enviado', sent_at: new Date().toISOString() }).eq('id', d.id);
  try {
    const r = await sendTrackedNotification(db, { kind: 'dossier_actividad', dedupeKey: `dossier:${d.id}:${p.send_id}`, recipients: [p.email], subject: `Pasos a seguir: ${String(b.activity ?? 'tu actividad').slice(0, 150)}`, html, bookingId: d.booking_id });
    return json({ ok: ['enviado', 'ya_enviado'].includes(r.status), status: r.status, error: r.error });
  } catch (e) { return json({ error: 'No se pudo enviar', details: String(e) }, 500); }
});
