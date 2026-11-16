import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

// The catalog-photos bucket is admin-only; a customer gets a short-lived signed URL
// only for the own photo of a sheet they hold a valid (sent, unexpired) token for.
const schema = z.object({ token: z.string().min(32).max(200) }).strict();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const PREFIX = 'storage:';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let raw: unknown; try { raw = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Datos no válidos' }, 400);
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Configuración no disponible' }, 500);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: s } = await db.from('activity_sheets').select('content, status, expires_at').eq('token', parsed.data.token).maybeSingle();
  if (!s || s.status !== 'enviada' || (s.expires_at && new Date(s.expires_at) < new Date())) return json({ url: null });
  const photo = typeof s.content?.photo === 'string' ? s.content.photo : '';
  if (!photo.startsWith(PREFIX)) return json({ url: null });
  const path = photo.slice(PREFIX.length);
  if (!/^[a-zA-Z0-9/_.-]+$/.test(path) || path.includes('..')) return json({ url: null });
  const { data } = await db.storage.from('catalog-photos').createSignedUrl(path, 60 * 60);
  return json({ url: data?.signedUrl ?? null });
});
