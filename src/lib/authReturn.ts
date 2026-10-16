/** Only same-origin internal paths, including OAuth consent query parameters. */
export function safeNext(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  let decoded = raw;
  for (let i = 0; i < 8; i++) {
    if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decoded)) return fallback;
    const pathname = decoded.split(/[?#]/, 1)[0];
    try {
      const normalized = new URL(pathname, "https://internal.invalid").pathname;
      if (normalized.startsWith("//") || /^\/login\/?$/i.test(normalized)) return fallback;
    } catch { return fallback; }
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) return raw;
      decoded = next;
    } catch { return fallback; }
  }
  return fallback;
}
type ReturnStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const KEY = "auth_next";
function browserStorage(): ReturnStorage | undefined {
  try { return window.sessionStorage; } catch { return undefined; }
}
export function readAuthNext(storage = browserStorage()): string | null {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return null;
    const valid = safeNext(raw, "");
    if (!valid) { clearAuthNext(storage); return null; }
    return valid;
  } catch { return null; }
}
export function clearAuthNext(storage = browserStorage()): void {
  try { storage?.removeItem(KEY); } catch { /* Storage may be disabled. */ }
}
export function storeAuthNext(next: string, storage = browserStorage()): boolean {
  try {
    if (!storage) return false;
    storage.setItem(KEY, safeNext(next));
    return storage.getItem(KEY) === safeNext(next);
  } catch { return false; }
}
export function googleCallbackUrl(origin: string, next: string, stored: boolean): string {
  return stored ? origin : `${origin}/login?next=${encodeURIComponent(safeNext(next))}`;
}