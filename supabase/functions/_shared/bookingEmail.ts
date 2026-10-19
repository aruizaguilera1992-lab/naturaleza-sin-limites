import { isTrustedSiteOrigin } from "./siteOrigins.ts";

// Email-safe equivalents of the NSL identity: no external fonts or stylesheets.
export const EMAIL_BRAND = {
  dark: "#1A1A1A", orange: "#FF6B35", ink: "#1A1A1A", muted: "#555555",
  paper: "#FFFFFF", line: "#DDDDDD", surface: "#F4F4F4",
  site: "https://naturalezasinlimites.es",
  logo: "https://naturalezasinlimites.es/__l5e/assets-v1/13c1d0c4-81d5-4659-b701-19788a4d06da/naturaleza-sin-limites-logo.webp",
  whatsapp: "https://wa.me/34685609542",
};
export const escapeEmail = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
const clean = (s?: string | null) => s?.trim() && s.trim() !== "-" ? s.trim() : null;
export function activityEmailTitle(value: string): string {
  // Stored labels are category · activity; don't repeat that category in headings.
  const parts = value.split(" · ");
  if (parts.length === 2 && /^(barranquismo|escalada|vías? ferratas?|espeleología)$/i.test(parts[0].trim())) return parts[1].trim();
  return value.trim();
}
export function emailDate(value?: string | null): string | null {
  if (!clean(value)) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
  const d = new Date(dateOnly ? `${value}T12:00:00Z` : String(value));
  if (!Number.isFinite(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "long", year: "numeric", ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }) }).format(d);
}
export function safeEmailUrl(value?: string | null): string | null {
  try {
    const url = new URL(value ?? "");
    return !url.username && !url.password && isTrustedSiteOrigin(url.origin) ? url.href : null;
  } catch { return null; }
}
export type EmailVariant = "request_admin" | "request_customer" | "payment_link" | "receipt" | "payment_admin";
export type ReservationEmailState = "confirmada" | "fecha_pendiente" | "pago_recibido" | "pendiente_pago" | "nueva";
export interface EmailMoney {
  totalCents?: number | null;
  depositCents?: number | null;
  paymentCents?: number | null;
  paidCents?: number | null;
  estimated?: boolean;
  currency?: string;
  /** Invoice detail (presentation only, from the same reliable sources as the total). */
  unitCents?: number | null;
  grossCents?: number | null;
  discountCents?: number | null;
  discountPercent?: number | null;
}
export interface BookingEmailData {
  variant: EmailVariant;
  state: ReservationEmailState;
  activity: string;
  date?: string | null;
  people?: string | number | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  level?: string | null;
  money?: EmailMoney;
  payUrl?: string | null;
  expiresAt?: string | null;
  holdMinutes?: number;
  scheduled?: boolean;
  paymentKind?: string | null;
  manualConfirmation?: boolean;
  reference?: string | null;
  sandbox?: boolean;
  operational?: string | null;
  logoUrl?: string | null;
}
export interface RenderedEmail { subject: string; html: string; text: string; preheader: string }
const validCents = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
const moneyText = (n: number, currency = "eur") => new Intl.NumberFormat("es-ES", { style: "currency", currency: /^[a-z]{3}$/i.test(currency) ? currency.toUpperCase() : "EUR" }).format(n / 100);
export function emailMoneyRows(m?: EmailMoney): [string, string][] {
  if (!m) return [];
  const rows: [string, string][] = [];
  if (validCents(m.totalCents) && m.totalCents > 0) rows.push([m.estimated ? "Total estimado · pendiente de confirmar" : "Total de la actividad", moneyText(m.totalCents, m.currency)]);
  if (validCents(m.depositCents) && validCents(m.totalCents) && m.totalCents > 0 && m.depositCents <= m.totalCents) rows.push(["Señal a abonar por adelantado · incluida en el total", moneyText(m.depositCents, m.currency)]);
  if (validCents(m.paymentCents)) rows.push(["Importe de este pago", moneyText(m.paymentCents, m.currency)]);
  if (validCents(m.paidCents)) rows.push(["Pagado acumulado", moneyText(m.paidCents, m.currency)]);
  if (!m.estimated && validCents(m.totalCents) && m.totalCents > 0 && validCents(m.paidCents)) rows.push(["Saldo pendiente", moneyText(Math.max(0, m.totalCents - m.paidCents), m.currency)]);
  return rows;
}

/** Invoice lines when total and deposit are both reliable; otherwise null (falls back to the plain rows). */
export function emailInvoice(m: EmailMoney | undefined, people?: string | number | null) {
  if (!m || m.estimated || !validCents(m.totalCents) || m.totalCents <= 0 || !validCents(m.depositCents) || m.depositCents <= 0 || m.depositCents > m.totalCents) return null;
  const c = m.currency;
  const lines: [string, string][] = [];
  const n = Number(people);
  if (validCents(m.unitCents) && m.unitCents > 0 && Number.isInteger(n) && n > 0) lines.push([`${n} × ${moneyText(m.unitCents, c)} por persona`, moneyText(m.unitCents * n, c)]);
  if (validCents(m.discountCents) && m.discountCents > 0) {
    if (!lines.length && validCents(m.grossCents)) lines.push(["Precio de la actividad", moneyText(m.grossCents, c)]);
    lines.push([`Descuento${m.discountPercent ? ` (${m.discountPercent} %)` : ""}`, `− ${moneyText(m.discountCents, c)}`]);
  }
  const paid = validCents(m.paidCents) ? m.paidCents : 0;
  const payNow = paid >= m.depositCents ? 0 : m.depositCents;
  return {
    lines,
    total: moneyText(m.totalCents, c),
    deposit: moneyText(m.depositCents, c),
    payNow: payNow > 0 ? moneyText(payNow, c) : null,
    paid: paid > 0 ? moneyText(paid, c) : null,
    rest: moneyText(Math.max(0, m.totalCents - Math.max(paid, payNow)), c),
  };
}

export function renderBookingEmail(d: BookingEmailData): RenderedEmail {
  const admin = d.variant === "request_admin" || d.variant === "payment_admin";
  const activity = activityEmailTitle(d.activity) || "Actividad pendiente de confirmar";
  const date = emailDate(d.date);
  const signal = d.paymentKind === "senal";
  const manual = signal && d.manualConfirmation === true && !d.scheduled;
  const manualDated = manual && Boolean(date);
  const confirmed = d.variant === "receipt" && d.scheduled === true && d.state === "confirmada";
  const paymentReceived = d.variant === "receipt" || d.variant === "payment_admin";
  const complete = !d.money?.estimated && validCents(d.money?.totalCents) && Number(d.money?.totalCents) > 0 && validCents(d.money?.paidCents) && Number(d.money?.paidCents) >= Number(d.money?.totalCents);
  const titles = {
    request_admin: "Nueva solicitud", request_customer: "Solicitud recibida",
    payment_link: manualDated ? "Actividad confirmada" : "Tu enlace de pago", receipt: manual ? "Señal recibida" : confirmed ? "Reserva confirmada" : "Pago recibido", payment_admin: signal ? "Señal recibida" : "Pago recibido",
  };
  const title = titles[d.variant];
  let intro: string;
  if (d.variant === "request_admin") intro = d.scheduled ? "Hay una reserva en una salida programada pendiente de pago." : "Revisa la disponibilidad de la fecha, el precio final y el anticipo antes de responder.";
  else if (d.variant === "request_customer") intro = "Hemos recibido tu solicitud. Te confirmaremos la disponibilidad, el precio final y el anticipo antes de enviarte el enlace de pago. Aún no es una reserva confirmada y no se ha cobrado nada.";
  else if (d.variant === "payment_link") intro = manual ? (manualDated ? `Hemos confirmado tu actividad para el ${date}. Para completar la reserva, abona la señal${validCents(d.money?.paymentCents) ? ` de ${moneyText(d.money.paymentCents, d.money?.currency)}` : ""} desde el enlace.` : "La fecha está pendiente de confirmar. Puedes abonar la señal desde el enlace; coordinaremos contigo la fecha de la actividad.") : d.scheduled ? "Completa el pago de la señal para confirmar tus plazas en la salida programada, una vez verificados el pago y las plazas." : "Puedes realizar el pago desde tu enlace personal. El pago no confirma por sí solo la fecha solicitada: te escribiremos para confirmarla.";
  else if (manual && paymentReceived) intro = manualDated ? `${admin ? "Se ha recibido la señal." : "Hemos recibido tu señal."} ${admin ? "La actividad está confirmada" : "Tu actividad está confirmada"} para el ${date}.` : "Señal recibida. La fecha está pendiente de confirmar; coordinaremos la actividad contigo.";
  else if (confirmed) intro = "Hemos recibido tu pago y tus plazas en la salida están confirmadas.";
  else if (d.variant === "receipt") intro = d.state === "fecha_pendiente" ? "Hemos recibido tu pago. La fecha solicitada sigue pendiente de confirmación; te escribiremos para confirmarla." : "Hemos recibido tu pago y lo hemos registrado correctamente.";
  else intro = "Se ha registrado un pago. Consulta el estado de la reserva y los siguientes pasos en el panel.";
  if (complete && d.variant === "payment_link") intro = manualDated ? `Tu actividad está confirmada para el ${date}. El pago está completo; no queda ningún importe pendiente.` : "El pago está completo; no queda ningún importe pendiente.";
  const stateText: Record<ReservationEmailState, string> = { confirmada: "Confirmada", fecha_pendiente: "Fecha pendiente de confirmación", pago_recibido: "Pago recibido", pendiente_pago: "Pendiente de pago", nueva: "Solicitud pendiente de revisión" };
  const effectiveState = manual ? manualDated ? "Actividad y fecha confirmadas" : "Fecha pendiente de confirmación" : stateText[d.state];
  const rows: [string, string][] = [["Actividad", activity], ["Estado", effectiveState]];
  if (manual || signal && paymentReceived) rows.push(["Pago", complete ? "Pago completo" : paymentReceived ? "Señal recibida" : "Señal pendiente de pago"]);
  rows.push([d.scheduled ? "Salida" : manualDated ? "Fecha confirmada" : "Fecha solicitada", date ?? "Pendiente de confirmar"]);
  if (d.people != null && clean(String(d.people))) rows.push(["Personas", String(d.people)]);
  if (admin) {
    for (const [label, value] of [["Cliente", d.name], ["Email", d.email], ["Teléfono", d.phone], ["Experiencia", d.level]] as const) if (clean(value)) rows.push([label, String(value).trim()]);
  }
  const invoice = ["payment_link", "receipt", "payment_admin"].includes(d.variant) ? emailInvoice(d.money, d.people) : null;
  const economics = emailMoneyRows(d.money);
  if (!economics.length) economics.push(["Precio", "Pendiente de confirmar"]);
  const notes: string[] = [];
  if (complete && paymentReceived) notes.push("Pago completo. No queda ningún importe pendiente.");
  const remaining = signal && (manual || d.scheduled) && !complete && !["request_admin", "request_customer"].includes(d.variant)
    ? "El importe restante puedes abonarlo por Bizum, en efectivo o mediante pago web. Para coordinar el pago o solicitar un enlace web, responde a este correo o contacta con nosotros por WhatsApp." : null;
  const adminRemaining = remaining ? "El resto queda pendiente de coordinar con el cliente: Bizum, efectivo o pago web." : null;
  if (d.variant === "payment_link") {
    const expires = emailDate(d.expiresAt);
    if (expires) notes.push(`Enlace válido hasta el ${expires} (hora de España).`);
    if (d.holdMinutes) notes.push(`Las plazas están bloqueadas ${d.holdMinutes} minutos para iniciar el pago. Al iniciarlo, el bloqueo se mantiene durante el plazo de pago; si no se completa, las plazas se liberan.`);
  }
  if (admin && clean(d.message)) notes.push(`Mensaje del cliente: ${d.message}`);
  if (admin && clean(d.operational)) notes.push(String(d.operational));
  if (admin && clean(d.reference)) notes.push(`Referencia del pago: ${d.reference}`);
  if (d.sandbox) notes.push("Entorno de pruebas · no es un cobro real.");
  const actionUrl = admin ? `${EMAIL_BRAND.site}/admin` : d.variant === "payment_link" && !complete ? safeEmailUrl(d.payUrl) : null;
  const actionLabel = admin ? "Abrir panel de gestión" : signal ? "Pagar la señal" : "Realizar el pago";
  const greeting = !admin && clean(d.name) ? `Hola ${d.name},` : !admin ? "Hola," : null;
  const preheader = `${title}: ${activity}. ${effectiveState}.${manual && d.variant === "payment_link" ? " Señal pendiente de pago." : ""}`;
  const p = (s: string) => `<p style="margin:0 0 18px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word">${escapeEmail(s)}</p>`;
  const table = (entries: [string, string][]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 24px">${entries.map(([k,v]) => `<tr><td width="43%" style="width:43%;padding:12px 8px 12px 0;border-bottom:1px solid ${EMAIL_BRAND.line};font-size:14px;color:${EMAIL_BRAND.muted};vertical-align:top;word-break:break-word">${escapeEmail(k)}</td><td style="padding:12px 0;border-bottom:1px solid ${EMAIL_BRAND.line};font-size:16px;font-weight:bold;vertical-align:top;word-break:break-word">${escapeEmail(v)}</td></tr>`).join("")}</table>`;
  const logo = d.logoUrl === null ? null : safeEmailUrl(d.logoUrl ?? EMAIL_BRAND.logo);
  const B = EMAIL_BRAND;
  const invRow = (k: string, v: string, strong = false) => `<tr><td style="padding:8px 0;font-size:15px;color:${strong ? B.ink : B.muted};${strong ? "font-weight:bold;" : ""}word-break:break-word">${escapeEmail(k)}</td><td align="right" style="padding:8px 0;font-size:15px;font-weight:bold;white-space:nowrap">${escapeEmail(v)}</td></tr>`;
  const invoiceHtml = invoice ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px;border:1px solid ${B.line};border-radius:6px"><tr><td style="padding:16px 18px 6px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${B.muted}">Resumen de tu reserva</td></tr><tr><td style="padding:0 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${invoice.lines.map(([k,v]) => invRow(k, v)).join("")}<tr><td colspan="2" style="border-top:1px solid ${B.line};font-size:0;line-height:0">&nbsp;</td></tr>${invRow("Total de la actividad", invoice.total, true)}${invoice.payNow ? "" : invRow("Señal (30 %, incluida en el total)", invoice.deposit)}${invoice.paid ? invRow("Ya pagado", invoice.paid) : ""}</table></td></tr>${invoice.payNow ? `<tr><td bgcolor="${B.orange}" style="padding:16px 18px;color:${B.ink}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:15px;font-weight:bold">A pagar ahora<br><span style="font-size:13px;font-weight:normal">Señal del 30 % · incluida en el total</span></td><td align="right" style="font-size:28px;font-weight:bold;white-space:nowrap">${escapeEmail(invoice.payNow)}</td></tr></table></td></tr>` : ""}<tr><td style="padding:12px 18px;background:${B.surface}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${invRow(invoice.payNow ? "Resto pendiente" : "Saldo pendiente", invoice.rest)}</table></td></tr></table>` : table(economics);
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeEmail(title)}</title></head><body style="margin:0;padding:0;background:${EMAIL_BRAND.paper};color:${EMAIL_BRAND.ink};font-family:Arial,Helvetica,sans-serif;font-size:16px"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeEmail(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 8px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-collapse:collapse"><tr><td align="center" bgcolor="${EMAIL_BRAND.dark}" style="padding:24px;color:${EMAIL_BRAND.paper};border-bottom:4px solid ${EMAIL_BRAND.orange}">${logo ? `<img src="${escapeEmail(logo)}" alt="Naturaleza Sin Límites" width="100" height="100" style="display:block;width:100px;height:100px;margin:0 auto 12px;border:0">` : ""}<div style="font-size:20px;font-weight:bold;line-height:1.4">Naturaleza Sin Límites</div><div style="font-size:13px;margin-top:4px">Aventura en Málaga · Andalucía</div></td></tr><tr><td style="padding:28px 20px"><h1 style="font-size:26px;line-height:1.25;margin:0 0 12px;color:${EMAIL_BRAND.ink}">${escapeEmail(title)}</h1><p style="margin:0 0 24px;font-size:18px;font-weight:bold;word-break:break-word">${escapeEmail(activity)}</p>${greeting ? p(greeting) : ""}${p(intro)}${table(rows)}${invoiceHtml}${actionUrl ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr><td bgcolor="${EMAIL_BRAND.orange}" style="border:2px solid ${EMAIL_BRAND.ink};border-radius:4px;text-align:center"><a href="${escapeEmail(actionUrl)}" style="display:inline-block;padding:14px 20px;font-size:16px;font-weight:bold;color:${EMAIL_BRAND.ink};text-decoration:none;line-height:1.4">${escapeEmail(actionLabel)}</a></td></tr></table>` : ""}${remaining ? `<h2 style="font-size:18px;line-height:1.4;margin:0 0 10px">Pago del importe restante</h2>${p(admin ? String(adminRemaining) : remaining)}` : ""}${notes.map(p).join("")}<p style="margin:24px 0 0;line-height:1.6">${admin ? "Naturaleza Sin Límites" : `¿Alguna duda? Responde a este correo o <a href="${EMAIL_BRAND.whatsapp}" style="color:${EMAIL_BRAND.ink};text-decoration:underline">escríbenos por WhatsApp: +34 685 60 95 42</a>.`}</p></td></tr><tr><td style="padding:20px;border-top:1px solid ${EMAIL_BRAND.line};font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted}">Naturaleza Sin Límites<br>Aventura con los pies en la tierra.</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
  const text = ["Naturaleza Sin Límites", title, activity, greeting, intro, ...rows.map(([k,v]) => `${k}: ${v}`), ...(invoice ? ["Resumen de tu reserva", ...invoice.lines.map(([k,v]) => `${k}: ${v}`), `Total de la actividad: ${invoice.total}`, ...(invoice.payNow ? [] : [`Señal (30 %, incluida en el total): ${invoice.deposit}`]), ...(invoice.paid ? [`Ya pagado: ${invoice.paid}`] : []), ...(invoice.payNow ? [`A PAGAR AHORA (señal del 30 %, incluida en el total): ${invoice.payNow}`] : []), `${invoice.payNow ? "Resto pendiente" : "Saldo pendiente"}: ${invoice.rest}`] : economics.map(([k,v]) => `${k}: ${v}`)), actionUrl ? `${actionLabel}: ${actionUrl}` : null, remaining ? "Pago del importe restante" : null, remaining ? admin ? adminRemaining : remaining : null, ...notes, admin ? null : "Responde a este correo o escríbenos por WhatsApp: +34 685 60 95 42 · https://wa.me/34685609542", "Naturaleza Sin Límites · Aventura con los pies en la tierra."].filter(Boolean).join("\n\n");
  return { subject: `${title === "Tu enlace de pago" ? "Pendiente de pago" : title} · ${activity}`, html, text, preheader };
}

/** Only a persisted official-rate deposit proves the agreed total; never infer it from a manual amount. */
export function reliableEmailMoney(payments: { kind?: string; amount_cents: number; total_cents?: number | null; status: string }[], payment: { amount_cents: number; currency?: string }, officialRate: number, eventUnitCents?: number | null, people?: number): EmailMoney {
  const deposit = payments.find(p => p.kind === "senal" && p.status !== "cancelado" && validCents(p.total_cents) && p.total_cents > 0 && p.amount_cents === Math.round(p.total_cents * officialRate));
  const totalCents = deposit?.total_cents ?? (validCents(eventUnitCents) && eventUnitCents > 0 && Number.isInteger(people) && Number(people) > 0 ? eventUnitCents * Number(people) : null);
  return { totalCents, depositCents: deposit?.amount_cents, paymentCents: payment.amount_cents, paidCents: payments.filter(p => p.status === "pagado").reduce((sum,p) => sum + p.amount_cents, 0), currency: payment.currency };
}