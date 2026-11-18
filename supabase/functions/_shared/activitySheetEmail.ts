import { escapeHtml } from './email.ts';

const DISC: Record<string, string> = { barranquismo: 'Barranquismo', ferratas: 'Vía ferrata', espeleologia: 'Espeleología' };
const fmtDate = (d: string) => {
  const t = new Date(`${d}T12:00:00Z`);
  return isNaN(t.getTime()) ? d : t.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });
};
const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);

/** Correo con la propuesta privada de actividad. Todo valor del cliente se escapa. */
export function renderActivitySheetEmail(c: Record<string, unknown>, link: string, origin: string, expiresAt: string | null) {
  const s = (v: unknown, max = 200) => escapeHtml(String(v ?? '').slice(0, max).trim());
  const title = s(c.title) || 'Tu actividad';
  const name = s(c.customerName, 100);
  const people = Number(c.people) || 1;
  const price = typeof c.pricePerPersonEuros === 'number' ? c.pricePerPersonEuros : null;
  const badge = [DISC[String(c.discipline)] ?? '', s(c.levelLabel, 60)].filter(Boolean).join(' · ');
  const rows: [string, string][] = [];
  rows.push(['Fecha', c.date ? escapeHtml(fmtDate(String(c.date))) : 'A acordar contigo']);
  if (c.duration) rows.push(['Duración', s(c.duration, 80)]);
  if (c.place) rows.push(['Lugar', s(c.place, 120)]);
  rows.push(['Personas', `${people} ${people === 1 ? 'persona' : 'personas'}`]);
  rows.push(['Precio', price === null ? 'Precio a consultar' : `<strong style="color:#FF6B35">${eur(price)}</strong> / persona${people > 1 ? ` · total <strong>${eur(price * people)}</strong>` : ''}`]);
  const caduca = expiresAt ? ` Disponible hasta el ${escapeHtml(new Date(expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }))}.` : '';
  const logo = `${origin}/images/logo-naturaleza-sin-limites.webp`;
  const l = escapeHtml(link);
  return `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden">Tu propuesta de ${title} está lista.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:'Open Sans',Arial,Helvetica,sans-serif;color:#1a1a1a">
 <tr><td style="background:#1A1A1A;border-radius:14px 14px 0 0;padding:22px 24px;border-bottom:4px solid #FF6B35">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
   <td style="padding-right:12px"><img src="${escapeHtml(logo)}" width="44" height="44" alt="Naturaleza Sin Límites" style="display:block;border-radius:50%"></td>
   <td style="color:#ffffff;font-family:Montserrat,Arial,sans-serif;font-weight:800;font-size:16px;letter-spacing:.5px">NATURALEZA SIN LÍMITES</td>
  </tr></table></td></tr>
 <tr><td style="border:1px solid #eeeeee;border-top:0;border-radius:0 0 14px 14px;padding:28px 24px">
  ${badge ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#FF6B35">${badge}</p>` : ''}
  <h1 style="margin:0 0 14px;font-family:Montserrat,Arial,sans-serif;font-size:24px;line-height:1.25;color:#1A1A1A">${title}</h1>
  <p style="margin:0 0 6px;font-size:15px">${name ? `Hola ${name},` : 'Hola,'}</p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">Hemos preparado tu propuesta de actividad. Revísala y, si te encaja, acéptala desde la ficha: después te enviamos el enlace de la señal para confirmar la fecha.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4EF;border-radius:10px;margin-bottom:22px">
   ${rows.map(([k, v], i) => `<tr><td style="padding:10px 16px;font-size:13px;color:#777;width:100px;${i ? 'border-top:1px solid #FBE0D4;' : ''}">${k}</td><td style="padding:10px 16px;font-size:14px;color:#1a1a1a;${i ? 'border-top:1px solid #FBE0D4;' : ''}">${v}</td></tr>`).join('')}
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 14px"><tr><td style="background:#FF6B35;border-radius:10px">
   <a href="${l}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;font-family:Montserrat,Arial,sans-serif">Ver mi propuesta</a>
  </td></tr></table>
  <p style="margin:0 0 4px;text-align:center;font-size:12px;color:#888">¿No funciona el botón? <a href="${l}" style="color:#FF6B35">Abre tu ficha aquí</a>.</p>
  <p style="margin:0;text-align:center;font-size:12px;color:#888">Este enlace es personal.${caduca}</p>
 </td></tr>
 <tr><td style="padding:18px 8px;text-align:center;font-size:12px;color:#888;line-height:1.6">
  ¿Dudas? <a href="https://wa.me/34685609542" style="color:#FF6B35;font-weight:700;text-decoration:none">WhatsApp +34 685 60 95 42</a><br>
  Naturaleza Sin Límites · Deportes de aventura en Málaga
 </td></tr>
</table></td></tr></table></body></html>`;
}
