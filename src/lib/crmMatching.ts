export type MatchLevel = "relacionada" | "posible" | null;

export function normEmail(v?: string | null): string | null {
  const e = (v ?? "").trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
}

export function normPhone(v?: string | null): string | null {
  if (!v) return null;
  let d = v.replace(/[^0-9+]/g, "");
  if (d.startsWith("00")) d = "+" + d.slice(2);
  if (/^[6789]\d{8}$/.test(d)) d = "+34" + d;
  return /^\+[1-9]\d{7,14}$/.test(d) ? d : null;
}

type Person = { email?: string | null; phone?: string | null };

/** Certain match only when both email and phone agree; one alone is only "posible". Never merges. */
export function matchBooking(contact: Person, booking: Person): { level: MatchLevel; reason: string } {
  const ce = normEmail(contact.email), be = normEmail(booking.email);
  const cp = normPhone(contact.phone), bp = normPhone(booking.phone);
  const email = !!ce && ce === be;
  const phone = !!cp && cp === bp;
  if (email && phone) return { level: "relacionada", reason: "Mismo email y teléfono" };
  if (email) return { level: "posible", reason: "Solo coincide el email" };
  if (phone) return { level: "posible", reason: "Solo coincide el teléfono" };
  return { level: null, reason: "" };
}
