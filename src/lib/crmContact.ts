// Helpers for CRM quick actions. They only build links; nothing is sent automatically.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string | null | undefined): boolean {
  return !!value && EMAIL_RE.test(value.trim());
}

/** Returns an international phone (digits only, with country code) or null if invalid. Spanish numbers default to +34. */
export function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (/[a-z@]/i.test(raw)) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (/^[6789]\d{8}$/.test(digits)) digits = `34${digits}`;
  if (digits.includes("+")) return null;
  if (digits.startsWith("34")) return /^34[6789]\d{8}$/.test(digits) ? digits : null;
  return /^\d{10,15}$/.test(digits) ? digits : null;
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const n = normalizePhone(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}

export function telLink(phone: string | null | undefined): string | null {
  const n = normalizePhone(phone);
  return n ? `tel:+${n}` : null;
}

export function mailtoLink(email: string | null | undefined, subject: string, body: string): string | null {
  if (!isValidEmail(email)) return null;
  return `mailto:${email!.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Picks the phone/email for a contact, falling back to the free-text "contacto" field. */
export function contactChannels(c: { email?: string | null; phone?: string | null; contacto?: string | null }) {
  const email = isValidEmail(c.email) ? c.email!.trim() : isValidEmail(c.contacto) ? c.contacto!.trim() : null;
  const phone = normalizePhone(c.phone) ? c.phone! : normalizePhone(c.contacto) ? c.contacto! : null;
  return { email, phone };
}
