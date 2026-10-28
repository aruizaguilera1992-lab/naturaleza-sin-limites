import { isValidEmail, normalizePhone } from "./crmContact";

export type FollowUpBucket = "vencido" | "hoy" | "proximo" | null;

const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

/** Classifies a next-action date relative to "now" using the Madrid calendar day. */
export function followUpBucket(nextActionAt: string | null | undefined, now = new Date()): FollowUpBucket {
  if (!nextActionAt) return null;
  const at = new Date(nextActionAt);
  if (Number.isNaN(at.getTime())) return null;
  const a = dayKey(at), n = dayKey(now);
  if (a < n) return "vencido";
  if (a === n) return "hoy";
  return "proximo";
}

type Dupable = { id: string; nombre: string; email?: string | null; phone?: string | null; contacto?: string | null };

const keysOf = (c: { email?: string | null; phone?: string | null; contacto?: string | null }) => {
  const keys = new Set<string>();
  for (const v of [c.email, c.phone, c.contacto]) {
    if (isValidEmail(v)) keys.add(`e:${v!.trim().toLowerCase()}`);
    const p = normalizePhone(v);
    if (p) keys.add(`p:${p}`);
  }
  return keys;
};

/** Existing contacts sharing an email or phone with the candidate. */
export function findDuplicates<T extends Dupable>(candidate: { email?: string | null; phone?: string | null; contacto?: string | null }, existing: T[]): T[] {
  const k = keysOf(candidate);
  if (k.size === 0) return [];
  return existing.filter((c) => [...keysOf(c)].some((x) => k.has(x)));
}
