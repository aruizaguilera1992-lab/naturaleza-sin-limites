import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { authenticateCronRequest } from '../_shared/cron-auth.ts';
import { renderNewsletter, newsletterSegments } from '../_shared/newsletterContent.ts';
import { sendTrackedNotification } from '../_shared/email.ts';
import { processCampaigns } from './worker.ts';
const schema = z.object({
  action: z.enum(['save', 'start', 'cancel', 'test', 'tick']), id: z.string().uuid().optional(), expected: z.string().datetime({ offset: true }).optional(),
  scheduled_at: z.string().datetime().optional(), test_id: z.string().uuid().optional(),
  campaign: z.object({ piece_id: z.string().uuid().nullable(), subject: z.string().max(200), preheader: z.string().max(300), title: z.string().max(500), content: z.string().max(100000), segments: z.array(z.enum(newsletterSegments)).max(3) }).optional(),
}).strict();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let raw: unknown; try { raw = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Datos no válidos', details: parsed.error.flatten() }, 400);
  const p = parsed.data;
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Configuración no disponible' }, 500);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  if (p.action === 'tick') {
    const refusal = authenticateCronRequest(req);
    if (refusal) return json({ error: 'No autorizado' }, refusal.status);
    try { return json({ ok: true, processed: await processCampaigns(db) }); } catch { return json({ error: 'No se pudo completar el lote' }, 500); }
  }
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'Sesión no válida' }, 401);
  const { data: role, error: roleError } = await db.rpc('has_role', { _user_id: auth.user.id, _role: 'admin' });
  if (roleError || !role) return json({ error: 'No autorizado' }, 403);
  try {
    if (p.action === 'test') {
      if (!p.campaign || !p.test_id || !auth.user.email || !p.campaign.subject.trim() || !p.campaign.content.trim()) return json({ error: 'Completa asunto y contenido' }, 400);
      const result = await sendTrackedNotification(db, { kind: 'newsletter_prueba', dedupeKey: `newsletter-test:${auth.user.id}:${p.test_id}`, recipients: [auth.user.email], subject: `[PRUEBA] ${p.campaign.subject}`, html: renderNewsletter(p.campaign) });
      return json({ ok: ['enviado','ya_enviado'].includes(result.status), status: result.status, error: result.error });
    }
    if (p.action === 'save' && !p.campaign) return json({ error: 'Falta el borrador' }, 400);
    if (p.action !== 'save' && !p.id) return json({ error: 'Falta la campaña' }, 400);
    const { data, error } = await db.rpc('manage_newsletter_campaign', { _action: p.action, _id: p.id ?? null, _payload: p.action === 'save' ? p.campaign : { scheduled_at: p.scheduled_at ?? null }, _actor: auth.user.id, _expected: p.expected ?? null });
    if (error) return json({ error: error.message }, 409);
    if (p.action === 'start' && !p.scheduled_at) await processCampaigns(db);
    return json({ ok: true, id: data });
  } catch { return json({ error: 'No se pudo completar la acción; revisa el historial antes de reintentar' }, 500); }
});