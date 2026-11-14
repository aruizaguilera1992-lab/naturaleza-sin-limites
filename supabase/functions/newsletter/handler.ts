// Newsletter double opt-in. Pure logic is kept here so it can be unit tested.
export const CONSENT_VERSION = "2026-11-v1";
export const CONSENT_TEXT =
  "Acepto recibir la newsletter de Naturaleza Sin Límites con novedades, salidas y ofertas. Puedo darme de baja en cualquier momento.";
export const SEGMENTS = ["barranquismo", "ferratas", "espeleologia"] as const;

export type Parsed =
  | { ok: true; action: "subscribe"; email: string; segments: string[] }
  | { ok: true; action: "confirm" | "unsubscribe"; token: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_RE = /^[a-f0-9]{48}$/;

export function parseRequest(body: unknown): Parsed {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_body" };
  const b = body as Record<string, unknown>;
  if (b.action === "subscribe") {
    const email = typeof b.email === "string" ? b.email.trim() : "";
    if (email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, error: "invalid_email" };
    // Marketing consent must be an explicit, separate yes.
    if (b.consent !== true) return { ok: false, error: "consent_required" };
    const segs = Array.isArray(b.segments) ? b.segments.filter((s): s is string => (SEGMENTS as readonly string[]).includes(s as string)) : [];
    return { ok: true, action: "subscribe", email, segments: [...new Set(segs)] };
  }
  if (b.action === "confirm" || b.action === "unsubscribe") {
    const token = typeof b.token === "string" ? b.token : "";
    if (!TOKEN_RE.test(token)) return { ok: false, error: "invalid_token" };
    return { ok: true, action: b.action, token };
  }
  return { ok: false, error: "invalid_action" };
}

export function discountCode(id: string): string {
  return `NSL10-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
