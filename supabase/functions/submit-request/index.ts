import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BookingSchema = z.object({
  type: z.literal('booking'),
  activity: z.string().min(1).max(120),
  preferredDate: z.string().max(30).optional().nullable(),
  numberOfPeople: z.string().max(20).optional().nullable(),
  experienceLevel: z.string().max(120).optional().nullable(),
  contact: z.string().min(3).max(150),
  name: z.string().max(120).optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
  rgpd: z.literal(true),
});

const ContactSchema = z.object({
  type: z.literal('contact'),
  nombre: z.string().min(2).max(120),
  contacto: z.string().min(3).max(150),
  interes: z.string().min(1).max(120),
  personas: z.string().max(50).optional().nullable(),
  mensaje: z.string().max(1000).optional().nullable(),
  rgpd: z.literal(true),
});

const BodySchema = z.discriminatedUnion('type', [BookingSchema, ContactSchema]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

async function sendEmail(to: string[], subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('NOTIFICATION_FROM') ?? 'onboarding@resend.dev';
  if (!apiKey || to.length === 0) {
    console.log('Email skipped (missing RESEND_API_KEY or recipients)');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `Naturaleza Sin Límites <${from}>`,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) console.error('Resend error', res.status, await res.text());
  } catch (e) {
    console.error('Resend exception', e);
  }
}

async function sendNotification(subject: string, lines: string[]) {
  const toList = (Deno.env.get('NOTIFICATION_EMAIL') ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  await sendEmail(
    toList,
    subject,
    `<h2>${escapeHtml(subject)}</h2><ul>${lines
      .map((l) => `<li>${escapeHtml(l)}</li>`)
      .join('')}</ul>`,
  );
}

async function sendClientConfirmation(
  contact: string,
  name: string | null | undefined,
  title: string,
  lines: string[],
) {
  if (!isEmail(contact)) return;
  const greeting = name ? `Hola ${escapeHtml(name)},` : 'Hola,';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
      <h2 style="color:#FF6B35;margin-bottom:8px">Hemos recibido tu solicitud</h2>
      <p>${greeting}</p>
      <p>Gracias por contactar con <strong>Naturaleza Sin Límites</strong>. Hemos registrado tu solicitud y te responderemos en menos de 24 horas laborables.</p>
      <h3 style="margin-bottom:4px">${escapeHtml(title)}</h3>
      <ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <p>Si necesitas una respuesta más rápida, escríbenos por WhatsApp al <strong>+34 685 60 95 42</strong>.</p>
      <p style="margin-top:24px;font-size:13px;color:#666">
        Naturaleza Sin Límites · Deportes de aventura en Málaga<br/>
        Este mensaje es una confirmación automática, no es una reserva confirmada hasta que la validemos contigo.
      </p>
    </div>`;
  await sendEmail([contact.trim()], 'Hemos recibido tu solicitud · Naturaleza Sin Límites', html);
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: 'Datos no válidos', details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date().toISOString();

  if (data.type === 'booking') {
    const { error } = await supabase.from('bookings').insert({
      activity: data.activity,
      preferred_date: data.preferredDate || null,
      number_of_people: data.numberOfPeople || null,
      experience_level: data.experienceLevel || null,
      contact: data.contact,
      name: data.name || null,
      message: data.message || null,
      rgpd_accepted_at: now,
    });
    if (error) {
      console.error('Insert booking error', error);
      return json({ error: 'No se pudo guardar la solicitud' }, 500);
    }
    await sendNotification(`Nueva reserva: ${data.activity}`, [
      `Actividad: ${data.activity}`,
      `Fecha preferente: ${data.preferredDate ?? '-'}`,
      `Personas: ${data.numberOfPeople ?? '-'}`,
      `Nivel: ${data.experienceLevel ?? '-'}`,
      `Contacto: ${data.contact}`,
      `Mensaje: ${data.message ?? '-'}`,
    ]);
    await sendClientConfirmation(data.contact, data.name, `Resumen de tu solicitud`, [
      `Actividad: ${data.activity}`,
      `Fecha preferente: ${data.preferredDate ?? 'por concretar'}`,
      `Personas: ${data.numberOfPeople ?? 'por concretar'}`,
      `Nivel: ${data.experienceLevel ?? 'por concretar'}`,
    ]);
    return json({ ok: true });

  }

  const { error } = await supabase.from('contact_submissions').insert({
    nombre: data.nombre,
    contacto: data.contacto,
    interes: data.interes,
    personas: data.personas || null,
    mensaje: data.mensaje || null,
    rgpd_accepted_at: now,
  });
  if (error) {
    console.error('Insert contact error', error);
    return json({ error: 'No se pudo guardar la solicitud' }, 500);
  }
  await sendNotification(`Nuevo contacto: ${data.nombre}`, [
    `Nombre: ${data.nombre}`,
    `Contacto: ${data.contacto}`,
    `Interés: ${data.interes}`,
    `Personas: ${data.personas ?? '-'}`,
    `Mensaje: ${data.mensaje ?? '-'}`,
  ]);
  return json({ ok: true });
});
