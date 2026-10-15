import { renderBookingEmail, escapeEmail } from "../supabase/functions/_shared/bookingEmail.ts";
import { bookingEmailFixtures } from "../supabase/functions/_shared/bookingEmailFixtures.ts";

const folder = "public/email-previews";
await Deno.mkdir(folder, { recursive: true });
const links: string[] = [];
for (const [name, data] of Object.entries(bookingEmailFixtures)) {
  const email = renderBookingEmail(data);
  await Deno.writeTextFile(`${folder}/${name}.html`, email.html.replace("<head>", '<head><meta name="robots" content="noindex,nofollow">'));
  await Deno.writeTextFile(`${folder}/${name}.txt`, `${email.subject}\n\n${email.text}`);
  links.push(`<li style="margin:16px 0"><a href="${name}.html">${escapeEmail(name)}</a> · <a href="${name}.txt">Texto plano</a><br>${escapeEmail(email.subject)}</li>`);
}
await Deno.writeTextFile(`${folder}/index.html`, `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Correos NSL · muestras ficticias</title></head><body style="font-family:Arial,sans-serif;max-width:760px;margin:24px auto;padding:16px"><h1>Correos de Naturaleza Sin Límites</h1><p>Vistas de revisión con datos ficticios. No envían correos. Los enlaces de pago son ejemplos no válidos.</p><ul>${links.join("")}</ul></body></html>`);
console.log(`Generated ${links.length} fictional previews in /email-previews/`);