/** Pure helpers for the admin commercial agenda (Europe/Madrid calendar days). */
export type AgendaBucket = "vencido" | "hoy" | "proximo7" | "mas_adelante" | "sin_seguimiento";
export type AgendaFilter = "todos" | AgendaBucket;

export type AgendaContact = {
  id: string;
  nombre: string;
  interes?: string | null;
  email?: string | null;
  phone?: string | null;
  contacto?: string | null;
  created_at: string;
  next_action?: string | null;
  next_action_at?: string | null;
  priority?: string | null;
  pipeline_stage?: string | null;
};

const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

/** Adds n calendar days to a YYYY-MM-DD key (UTC arithmetic, DST-safe). */
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const isOpen = (c: AgendaContact) => c.pipeline_stage !== "ganado" && c.pipeline_stage !== "perdido";

/** Bucket for a contact, or null when it does not belong in the agenda (closed without follow-up). */
export function agendaBucket(c: AgendaContact, now = new Date()): AgendaBucket | null {
  const at = c.next_action_at ? new Date(c.next_action_at) : null;
  const valid = at && !Number.isNaN(at.getTime());
  if (!c.next_action?.trim() || !valid) return isOpen(c) ? "sin_seguimiento" : null;
  const a = dayKey(at!), today = dayKey(now);
  if (a < today) return "vencido";
  if (a === today) return "hoy";
  if (a <= addDays(today, 7)) return "proximo7";
  return "mas_adelante";
}

export function agendaCounts(list: AgendaContact[], now = new Date()) {
  const counts: Record<AgendaBucket, number> = { vencido: 0, hoy: 0, proximo7: 0, mas_adelante: 0, sin_seguimiento: 0 };
  for (const c of list) { const b = agendaBucket(c, now); if (b) counts[b]++; }
  return counts;
}

const BUCKET_ORDER: Record<AgendaBucket, number> = { vencido: 0, hoy: 1, proximo7: 2, mas_adelante: 3, sin_seguimiento: 4 };
const PRIORITY_ORDER: Record<string, number> = { alta: 0, media: 1, baja: 2 };
const prio = (p?: string | null) => (p && p in PRIORITY_ORDER ? PRIORITY_ORDER[p] : 3);

export function matchesSearch(c: AgendaContact, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const digits = s.replace(/\D/g, "");
  const hay = [c.nombre, c.interes, c.email, c.phone, c.contacto].filter(Boolean).join(" ").toLowerCase();
  if (hay.includes(s)) return true;
  return digits.length >= 3 && hay.replace(/\D/g, "").includes(digits);
}

export type AgendaItem<T extends AgendaContact> = { contact: T; bucket: AgendaBucket };

export function buildAgenda<T extends AgendaContact>(list: T[], filter: AgendaFilter, q: string, now = new Date()): AgendaItem<T>[] {
  const items: AgendaItem<T>[] = [];
  for (const c of list) {
    const b = agendaBucket(c, now);
    if (!b || (filter !== "todos" && filter !== b) || !matchesSearch(c, q)) continue;
    items.push({ contact: c, bucket: b });
  }
  return items.sort((x, y) =>
    BUCKET_ORDER[x.bucket] - BUCKET_ORDER[y.bucket] ||
    prio(x.contact.priority) - prio(y.contact.priority) ||
    (x.bucket === "sin_seguimiento"
      ? x.contact.created_at.localeCompare(y.contact.created_at)
      : new Date(x.contact.next_action_at!).getTime() - new Date(y.contact.next_action_at!).getTime()),
  );
}

export function formatAgendaDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("es-ES", { timeZone: "Europe/Madrid", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
