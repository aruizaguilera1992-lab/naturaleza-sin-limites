import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { isTrustedSiteOrigin } from '../_shared/siteOrigins.ts';
import { isAllowedShortLink, resolveMapsLink, type MapsTarget } from '../_shared/meetingPointLinks.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Resuelve un enlace corto de Google Maps pegado por el admin en el punto de
// quedada, para poder ofrecer el sitio exacto a Apple Maps. Solo sigue la
// redirección del acortador de Google: no usa claves ni toca otras URLs.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const origin = req.headers.get('origin') ?? req.headers.get('referer') ?? '';
  if (!isTrustedSiteOrigin(origin)) return json({ error: 'origen_no_permitido' }, 403);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: 'datos_no_validos' }, 400); }
  const url = (body as { url?: unknown })?.url;
  if (typeof url !== 'string' || url.length > 500) return json({ error: 'datos_no_validos' }, 400);
  if (!isAllowedShortLink(url)) return json({ error: 'enlace_no_permitido' }, 400);

  let target: MapsTarget | null = null;
  try { target = await resolveMapsLink(url); } catch { target = null; }
  return json({ ok: true, target });
});
