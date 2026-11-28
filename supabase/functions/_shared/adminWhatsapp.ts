import { normalizeWaPhone } from './whatsapp.ts';

/** Plantilla aprobada por Meta para avisos internos (fuera de la ventana de 24 h). */
export const ADMIN_TEMPLATE = 'aviso_propuesta_confirmada';

export function adminAcceptanceParams(d: { nombre: string; title: string; date: string | null; people: number | null }): string[] {
  const clean = (s: string) => s.replace(/[\n\t]+/g, ' ').replace(/ {4,}/g, ' ').trim().slice(0, 200) || '-';
  return [clean(d.nombre), clean(d.title), clean(d.date ?? 'a acordar'), String(d.people ?? '-')];
}

/** Envía el aviso al WhatsApp del administrador por la conexión WhatsApp Business. Nunca lanza. */
export async function sendAdminWhatsapp(params: string[]): Promise<string> {
  const lovable = Deno.env.get('LOVABLE_API_KEY');
  const wa = Deno.env.get('WHATSAPP_API_KEY');
  const to = normalizeWaPhone(Deno.env.get('ADMIN_WHATSAPP_TO'));
  if (!lovable || !wa) return 'sin_conexion';
  if (!to) return 'sin_destino';
  try {
    const res = await fetch('https://connector-gateway.lovable.dev/whatsapp/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${lovable}`, 'X-Connection-Api-Key': wa, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to, type: 'template',
        template: { name: ADMIN_TEMPLATE, language: { code: 'es' }, components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] },
      }),
    });
    const body = await res.text();
    if (!res.ok) { console.error(`WhatsApp admin [${res.status}]: ${body}`); return `error_${res.status}`; }
    return 'enviado';
  } catch (e) { console.error('WhatsApp admin', e); return 'error'; }
}
