/**
 * Handoff de confirmaciones por WhatsApp.
 *
 * No envía mensajes: prepara el teléfono normalizado y el texto ya escrito para
 * que el panel lo abra en WhatsApp. El envío automático por API requeriría una
 * conexión de WhatsApp Business, que este proyecto no tiene.
 */

/** Teléfono para wa.me: solo dígitos, con prefijo 34 para números españoles. */
export function normalizeWaPhone(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  // "034 606 33 00 19" o "0685..." : cero inicial delante del prefijo.
  else if (/^0\d{9,}$/.test(digits)) digits = digits.slice(1);
  if (digits.includes("+")) return null;
  if (/^[6789]\d{8}$/.test(digits)) return `34${digits}`;
  if (digits.startsWith("34")) return /^34[6789]\d{8}$/.test(digits) ? digits : null;
  return /^\d{10,15}$/.test(digits) ? digits : null;
}

const euros = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: (currency || "eur").toUpperCase() }).format(cents / 100);

const fecha = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

/** Texto corto de cobro/confirmación con el enlace de pago. */
export function buildWhatsappPaymentMessage(d: {
  name?: string | null;
  activity: string;
  date?: string | null;
  amountCents: number;
  currency?: string | null;
  totalCents?: number | null;
  deposit?: boolean;
  payUrl: string;
  expiresAt?: string | null;
  concept?: string | null;
}): string {
  const greet = d.name?.trim() ? `Hola ${d.name.trim()}` : "Hola";
  const importe = euros(d.amountCents, d.currency ?? "eur");
  const lines: string[] = [`${greet},`];

  if (d.deposit) {
    const when = fecha(d.date);
    lines.push(
      when
        ? `Tu actividad «${d.activity}» del ${when} está confirmada.`
        : `Tu actividad «${d.activity}» está confirmada.`,
    );
    if (typeof d.totalCents === "number" && d.totalCents > 0) {
      const total = euros(d.totalCents, d.currency ?? "eur");
      lines.push(`Total de la actividad: ${total}.`);
      lines.push(`Señal a pagar ahora (30 %): ${importe}. Resto pendiente: ${euros(d.totalCents - d.amountCents, d.currency ?? "eur")}.`);
    } else {
      lines.push(`Señal a pagar ahora: ${importe}.`);
    }
    lines.push("Puedes pagar la señal de forma segura aquí:");
  } else {
    lines.push(`Te dejamos el enlace para pagar ${importe} (${d.concept ?? d.activity}).`);
    lines.push("Enlace de pago seguro:");
  }

  lines.push(d.payUrl);
  const hasta = fecha(d.expiresAt);
  if (hasta) lines.push(`Enlace válido hasta el ${hasta}.`);
  lines.push("Naturaleza Sin Límites · Aventura con los pies en la tierra.");
  return lines.join("\n");
}

/** Enlace wa.me con el mensaje ya escrito; null si el teléfono no es válido. */
export function whatsappHandoffUrl(phone: string | null | undefined, message: string): string | null {
  const p = normalizeWaPhone(phone);
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(message)}` : null;
}
