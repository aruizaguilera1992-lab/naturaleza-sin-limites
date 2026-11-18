import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { sendTrackedNotification } from '../_shared/email.ts';
import { renderActivitySheetEmail } from '../_shared/activitySheetEmail.ts';
import { isTrustedSiteOrigin } from '../_shared/siteOrigins.ts';

const schema = z.object({ id: z.string().uuid(), email: z.string().email().max(254), origin: z.string().url().max(300), send_id: z.string().uuid() }).strict();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let raw: unknown; try { raw = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Datos no válidos', details: parsed.error.flatten() }, 400);
  const p = parsed.data;
  if (!isTrustedSiteOrigin(p.origin)) return json({ error: 'Origen no permitido' }, 400);
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Configuración no disponible' }, 500);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'Sesión no válida' }, 401);
  const { data: role } = await db.rpc('has_role', { _user_id: auth.user.id, _role: 'admin' });
  if (!role) return json({ error: 'No autorizado' }, 403);

  const { data: sheet, error } = await db.from('activity_sheets').select('id, token, short_code, content, status, expires_at, contact_id').eq('id', p.id).maybeSingle();
  if (error || !sheet) return json({ error: 'Ficha no encontrada' }, 404);
  if (sheet.status === 'desactivada') return json({ error: 'La ficha está desactivada' }, 409);
  if (sheet.expires_at && new Date(sheet.expires_at) < new Date()) return json({ error: 'La ficha ha caducado' }, 409);

  const c = (sheet.content ?? {}) as Record<string, unknown>;
  const title = String(c.title ?? 'Tu actividad').slice(0, 200);
  const slug = (title || 'actividad').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'actividad';
  const link = `${new URL(p.origin).origin}/ficha/${sheet.short_code ? `${slug}-${sheet.short_code}` : sheet.token}`;
  const html = renderActivitySheetEmail(c, link, new URL(p.origin).origin, sheet.expires_at);

  await db.from('activity_sheets').update({ status: 'enviada', sent_at: new Date().toISOString() }).eq('id', sheet.id);
  try {
    const result = await sendTrackedNotification(db, { kind: 'ficha_actividad', dedupeKey: `activity-sheet:${sheet.id}:${p.send_id}`, recipients: [p.email], subject: `Tu propuesta: ${title}`, html, contactId: sheet.contact_id });
    const ok = ['enviado', 'ya_enviado'].includes(result.status);
    if (ok && sheet.contact_id) await db.from('contact_events').insert({ contact_id: sheet.contact_id, kind: 'comunicacion_email', body: `Ficha de actividad enviada por email: ${title}`, origin: 'manual', author_id: auth.user.id });
    return json({ ok, status: result.status, error: result.error });
  } catch (e) {
    return json({ error: 'No se pudo enviar', details: String(e) }, 500);
  }
});
