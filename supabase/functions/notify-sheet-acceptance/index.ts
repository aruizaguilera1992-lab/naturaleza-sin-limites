import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { businessRecipients, sendTrackedNotification } from '../_shared/email.ts';
import { renderLeadAlert } from '../_shared/leadAlertEmail.ts';
import { isTrustedSiteOrigin } from '../_shared/siteOrigins.ts';

// Aviso interno cuando un cliente confirma la fecha de su ficha privada.
// Idempotente: la clave de deduplicación es la propia ficha, así que reintentos
// del cliente nunca generan un segundo correo.
const schema = z.object({ token: z.string().min(20).max(120), origin: z.string().url().max(300) }).strict();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let raw: unknown; try { raw = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Datos no válidos' }, 400);
  if (!isTrustedSiteOrigin(parsed.data.origin)) return json({ error: 'Origen no permitido' }, 400);

  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Configuración no disponible' }, 500);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: sheet } = await db.from('activity_sheets')
    .select('id, content, accepted_at, booking_id, contact_id')
    .eq('token', parsed.data.token)
    .maybeSingle();
  // Solo se avisa de confirmaciones reales: la ficha debe existir y estar aceptada.
  if (!sheet || !sheet.accepted_at) return json({ ok: false, reason: 'not_accepted' }, 409);

  const c = (sheet.content ?? {}) as Record<string, unknown>;
  const title = String(c.title ?? 'Actividad').slice(0, 200);
  const people = Number(c.people) || null;
  const date = c.date ? String(c.date).slice(0, 30) : null;
  const price = typeof c.pricePerPersonEuros === 'number' ? c.pricePerPersonEuros : null;

  let email: string | null = null;
  let phone: string | null = null;
  let nombre = String(c.customerName ?? '').slice(0, 120);
  if (sheet.contact_id) {
    const { data: contact } = await db.from('contact_submissions').select('nombre, email, contacto').eq('id', sheet.contact_id).maybeSingle();
    if (contact) {
      nombre = nombre || String(contact.nombre ?? '');
      email = contact.email ?? null;
      phone = contact.contacto ?? null;
    }
  }
  if (!nombre) nombre = 'Cliente';

  const detalles = [
    date ? `Fecha: ${date}` : null,
    people ? `Personas: ${people}` : null,
    price != null ? `Precio por persona: ${price} €` : null,
    sheet.booking_id ? 'Reserva creada automáticamente (pendiente de señal).' : null,
    'Siguiente paso: enviar el enlace de la señal del 30 % desde el panel.',
  ].filter(Boolean).join('\n');

  const alert = renderLeadAlert({
    nombre,
    origen: 'Ficha privada · confirmación de fecha',
    email,
    phone,
    interes: title,
    personas: people,
    mensaje: detalles,
  });

  try {
    const result = await sendTrackedNotification(db, {
      kind: 'ficha_confirmada',
      dedupeKey: `sheet_accepted:${sheet.id}`,
      recipients: businessRecipients(),
      subject: `✅ Fecha confirmada: ${nombre} · ${title}`,
      html: alert.html,
      text: alert.text,
      contactId: sheet.contact_id,
      bookingId: sheet.booking_id,
    });
    return json({ ok: ['enviado', 'ya_enviado'].includes(result.status), status: result.status });
  } catch (e) {
    return json({ error: 'No se pudo enviar', details: String(e) }, 500);
  }
});
