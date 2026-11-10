// Internal "new lead" alert: one professional layout for every contact entry point.
// Goal: open the admin panel or reply on the lead's preferred channel in one tap.
import { EMAIL_BRAND, escapeEmail as e } from "./bookingEmail.ts";

export interface LeadAlert {
  nombre: string;
  origen: string; // e.g. "Web de preapertura"
  email?: string | null;
  phone?: string | null;
  contacto?: string | null; // free field (phone or email)
  interes?: string | null;
  personas?: string | number | null;
  mensaje?: string | null;
}

type Channel = "whatsapp" | "llamada" | "email";

const digits = (v: string) => v.replace(/[^\d+]/g, "");
const isMail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function preferredChannel(text?: string | null): Channel | null {
  const m = (text ?? "").match(/canal preferido:\s*([^.\n]+)/i)?.[1]?.toLowerCase() ?? "";
  if (m.includes("whatsapp")) return "whatsapp";
  if (m.includes("llam") || m.includes("tel")) return "llamada";
  if (m.includes("mail") || m.includes("correo")) return "email";
  return null;
}

export function resolveContact(d: LeadAlert) {
  let email = d.email?.trim() || "";
  let phone = d.phone?.trim() || "";
  const c = d.contacto?.trim() || "";
  if (c && !email && isMail(c)) email = c;
  if (c && !phone && !isMail(c) && digits(c).replace("+", "").length >= 9) phone = c;
  if (!phone) phone = (d.mensaje ?? "").match(/tel[eé]fono:\s*([+\d][\d\s]{8,})/i)?.[1]?.trim() ?? "";
  const ph = digits(phone);
  const wa = ph ? (ph.startsWith("+") ? ph.slice(1) : ph.length === 9 ? `34${ph}` : ph) : "";
  return { email, phone, wa };
}

export function renderLeadAlert(d: LeadAlert) {
  const { email, phone, wa } = resolveContact(d);
  const pref = preferredChannel(d.mensaje) ?? (wa ? "whatsapp" : email ? "email" : null);
  const first = d.nombre.trim().split(/\s+/)[0] ?? "";
  const waText = encodeURIComponent(`Hola ${first}, soy de Naturaleza Sin Límites. Te escribo por tu interés en ${d.interes ?? "nuestras actividades"}.`);
  const actions: { ch: Channel; label: string; url: string }[] = [];
  if (wa) actions.push({ ch: "whatsapp", label: "Responder por WhatsApp", url: `https://wa.me/${wa}?text=${waText}` });
  if (phone) actions.push({ ch: "llamada", label: `Llamar · ${phone}`, url: `tel:${digits(phone)}` });
  if (email) actions.push({ ch: "email", label: "Responder por email", url: `mailto:${email}?subject=${encodeURIComponent("Naturaleza Sin Límites · tu solicitud")}` });
  actions.sort((a, b) => Number(b.ch === pref) - Number(a.ch === pref));
  const admin = `${EMAIL_BRAND.site}/admin`;
  const prefLabel = pref === "whatsapp" ? "WhatsApp" : pref === "llamada" ? "Llamada" : pref === "email" ? "Email" : null;

  const rows: [string, string][] = [
    ["Nombre", d.nombre],
    ["Interés", d.interes || "-"],
    ...(d.personas ? [["Personas", String(d.personas)] as [string, string]] : []),
    ...(phone ? [["Teléfono", phone] as [string, string]] : []),
    ...(email ? [["Email", email] as [string, string]] : []),
    ...(prefLabel ? [["Canal preferido", prefLabel] as [string, string]] : []),
    ["Origen", d.origen],
  ];
  const btn = (label: string, url: string, primary: boolean) =>
    `<tr><td style="padding:0 0 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="${primary ? EMAIL_BRAND.orange : EMAIL_BRAND.paper}" style="border:2px solid ${EMAIL_BRAND.ink};border-radius:6px"><a href="${e(url)}" style="display:block;padding:14px 18px;font-size:16px;font-weight:bold;color:${EMAIL_BRAND.ink};text-decoration:none">${e(label)}</a></td></tr></table></td></tr>`;

  const subject = `🔔 Nuevo contacto: ${d.nombre}${d.interes ? ` · ${d.interes}` : ""}`;
  const preheader = `${prefLabel ? `Prefiere ${prefLabel}. ` : ""}Responde cuanto antes para cerrar la venta.`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(subject)}</title></head><body style="margin:0;padding:0;background:${EMAIL_BRAND.paper};font-family:Arial,Helvetica,sans-serif;color:${EMAIL_BRAND.ink}"><div style="display:none;max-height:0;overflow:hidden">${e(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse">
<tr><td align="center" bgcolor="${EMAIL_BRAND.dark}" style="padding:20px;border-bottom:4px solid ${EMAIL_BRAND.orange}"><img src="${EMAIL_BRAND.logo}" alt="Naturaleza Sin Límites" width="120" style="display:block;width:120px;height:auto;margin:0 auto 8px;border:0"><div style="color:${EMAIL_BRAND.paper};font-size:13px;letter-spacing:1px;text-transform:uppercase">Aviso interno · Nuevo contacto</div></td></tr>
<tr><td style="padding:26px 20px 8px"><h1 style="margin:0 0 6px;font-size:24px;line-height:1.25">${e(d.nombre)} quiere información</h1><p style="margin:0 0 20px;font-size:16px;color:${EMAIL_BRAND.muted}">${e(d.interes || "Sin interés indicado")}${prefLabel ? ` · prefiere <strong style="color:${EMAIL_BRAND.ink}">${e(prefLabel)}</strong>` : ""}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${actions.map((a, i) => btn(a.label, a.url, i === 0)).join("")}</table></td></tr>
<tr><td style="padding:8px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${EMAIL_BRAND.line};border-radius:6px;border-collapse:separate">${rows.map(([k, v], i) => `<tr><td style="padding:10px 12px;font-size:14px;color:${EMAIL_BRAND.muted};width:38%;${i ? `border-top:1px solid ${EMAIL_BRAND.line};` : ""}">${e(k)}</td><td style="padding:10px 12px;font-size:15px;font-weight:bold;word-break:break-word;${i ? `border-top:1px solid ${EMAIL_BRAND.line};` : ""}">${e(v)}</td></tr>`).join("")}</table></td></tr>
${d.mensaje ? `<tr><td style="padding:16px 20px 0"><div style="font-size:13px;color:${EMAIL_BRAND.muted};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Mensaje</div><div style="background:${EMAIL_BRAND.surface};border-left:4px solid ${EMAIL_BRAND.orange};padding:12px 14px;font-size:15px;line-height:1.6;white-space:pre-line">${e(d.mensaje)}</div></td></tr>` : ""}
<tr><td style="padding:22px 20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${btn("Abrir en el panel de gestión", admin, false)}</table></td></tr>
<tr><td style="padding:16px 20px;border-top:1px solid ${EMAIL_BRAND.line};font-size:12px;color:${EMAIL_BRAND.muted};line-height:1.6">Recibes este aviso porque eres administrador de Naturaleza Sin Límites. Responder en la primera hora multiplica las opciones de cerrar la venta.</td></tr>
</table></td></tr></table></body></html>`;
  const text = [`Nuevo contacto: ${d.nombre}`, ...rows.map(([k, v]) => `${k}: ${v}`), d.mensaje ? `Mensaje: ${d.mensaje}` : null, ...actions.map((a) => `${a.label}: ${a.url}`), `Panel: ${admin}`].filter(Boolean).join("\n");
  return { subject, html, text };
}
