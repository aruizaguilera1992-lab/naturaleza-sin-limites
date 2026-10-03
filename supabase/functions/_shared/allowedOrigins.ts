// Only these site origins may appear in payment links and checkout return URLs.
export const CANONICAL_ORIGIN = "https://naturalezasinlimites.es";

const ALLOWED_EXACT = new Set([
  "https://naturalezasinlimites.es",
  "https://www.naturalezasinlimites.es",
  "https://naturalezasinlimites.lovable.app",
  "https://id-preview--e8067521-0f87-494a-b789-e89c9f7b9922.lovable.app",
]);

const ALLOWED_PATTERNS = [
  /^https:\/\/[a-z0-9-]+--e8067521-0f87-494a-b789-e89c9f7b9922\.lovable\.app$/,
  /^https:\/\/e8067521-0f87-494a-b789-e89c9f7b9922\.lovableproject\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
];

/** Returns the origin if it is approved, otherwise null. */
export function approvedOrigin(url: string | null | undefined): string | null {
  if (!url) return null;
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return null;
  }
  if (ALLOWED_EXACT.has(origin)) return origin;
  if (ALLOWED_PATTERNS.some((re) => re.test(origin))) return origin;
  return null;
}
