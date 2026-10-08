// Origins this business may send customers back to (checkout return, portal,
// emailed links). Anything else is rejected to avoid phishing redirects.
const TRUSTED = new Set([
  "https://naturalezasinlimites.es",
  "https://www.naturalezasinlimites.es",
  "https://e8067521-0f87-494a-b789-e89c9f7b9922.lovableproject.com",
  "https://id-preview--e8067521-0f87-494a-b789-e89c9f7b9922.lovable.app",
]);

export function isTrustedSiteOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (TRUSTED.has(url.origin)) return true;
    if (url.protocol === "https:" && url.hostname.endsWith("e8067521-0f87-494a-b789-e89c9f7b9922.lovable.app")) return true;
    if (url.protocol === "https:" && url.hostname.endsWith(".lovable.app") && url.hostname.includes("e8067521")) return true;
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}
