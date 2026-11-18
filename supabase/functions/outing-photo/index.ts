import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

// The catalog-photos bucket is admin-only; the public web gets a short-lived signed URL
// only for the own photo stored in the snapshot of a published (or full) open-group outing.
const schema = z.object({ category: z.string().min(1).max(60), slug: z.string().min(1).max(120) }).strict();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let raw: unknown; try { raw = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Datos no válidos' }, 400);
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Configuración no disponible' }, 500);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: ev } = await db.from('activity_events').select('catalog_snapshot')
    .eq('category', parsed.data.category).eq('slug', parsed.data.slug)
    .in('status', ['publicada', 'completa'])
    .order('starts_at', { ascending: false }).limit(1).maybeSingle();
  const path = typeof ev?.catalog_snapshot?.imagePath === 'string' ? ev.catalog_snapshot.imagePath : '';
  if (!path || !/^[a-zA-Z0-9/_.-]+$/.test(path) || path.includes('..')) return json({ url: null });
  const { data } = await db.storage.from('catalog-photos').createSignedUrl(path, 60 * 60);
  return json({ url: data?.signedUrl ?? null });
});
