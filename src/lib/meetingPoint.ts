// Enlaces interactivos del punto de encuentro (Google Maps / Apple Maps).

const URL_RE = /https?:\/\/[^\s]+/i;

/** Primera URL http(s) encontrada en el texto, o null. */
export function extractUrl(text: string): string | null {
  const m = text.match(URL_RE);
  return m ? m[0] : null;
}

/** Texto descriptivo sin la URL (para usarlo como búsqueda). */
export function textWithoutUrl(text: string): string {
  return text.replace(URL_RE, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Enlace a Google Maps: si el texto ya trae una URL se respeta tal cual;
 * si no, se busca el texto del punto de encuentro.
 */
export function googleMapsUrl(text: string): string {
  const url = extractUrl(text);
  if (url) return url;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text.trim())}`;
}

/**
 * Enlace a Apple Maps: busca el texto descriptivo; si solo hay URL,
 * se usa la URL como consulta (Apple la resuelve si es un enlace de lugar).
 */
export function appleMapsUrl(text: string): string {
  const query = textWithoutUrl(text) || text.trim();
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}
