// Resuelve los enlaces cortos de Google Maps (maps.app.goo.gl) para saber el
// sitio exacto del punto de quedada: nombre y coordenadas. Sin claves API:
// solo sigue la redirección HTTP del propio enlace.

export type MapsTarget = { name: string | null; latitude: number | null; longitude: number | null };

/** Único host permitido: el acortador de Google Maps. Nada de URLs arbitrarias. */
const ALLOWED_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const TTL_MS = 24 * 60 * 60 * 1000;

const cache = new Map<string, { at: number; target: MapsTarget }>();

export function isAllowedShortLink(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

const PLACE_NAME_RE = /\/maps\/(?:place|pl)\/([^/?#]+)/i;
const SEARCH_NAME_RE = /\/maps\/search\/([^/?#]+)/i;
const DATA_COORDS_RE = /!3d(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)|!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i;
const AT_COORDS_RE = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const QUERY_COORDS_RE = /[?&](?:q|query|daddr|destination|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i;
const LL_COORDS_RE = /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i;

const num = (s: string | undefined) => {
  const n = Number(s);
  return Number.isFinite(n) && Math.abs(n) <= 180 ? n : null;
};

const URL_RE = /https?:\/\/[^\s]+/i;

/** Primera URL http(s) del texto, o null. */
export const extractUrl = (text: string): string | null => text.match(URL_RE)?.[0] ?? null;

/** Texto descriptivo sin la URL pegada. */
export const textWithoutUrl = (text: string): string => text.replace(URL_RE, '').replace(/\s{2,}/g, ' ').trim();

/** ¿Es un enlace corto de Google que conviene resolver? */
export const isShortMapLink = (url: string | null): boolean => (url ? isAllowedShortLink(url) : false);

/** Enlace a Google Maps: respeta la URL pegada; si no, busca el texto. */
export const googleMapsUrl = (text: string): string =>
  extractUrl(text) ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text.trim())}`;

/** Enlace a Apple Maps: punto exacto si hay coordenadas; si no, búsqueda por texto. */
export const appleMapsUrl = (text: string, target?: MapsTarget | null): string => {
  if (target && target.latitude !== null && target.longitude !== null) {
    const q = target.name ? `&q=${encodeURIComponent(target.name)}` : '';
    return `https://maps.apple.com/?ll=${target.latitude},${target.longitude}${q}`;
  }
  return `https://maps.apple.com/?q=${encodeURIComponent(textWithoutUrl(text) || text.trim())}`;
};

/** Nombre y coordenadas de un enlace de Google Maps ya resuelto. */
export function parseMapsUrl(url: string): MapsTarget {
  let name: string | null = null;
  const place = url.match(PLACE_NAME_RE) ?? url.match(SEARCH_NAME_RE);
  if (place?.[1]) {
    try { name = decodeURIComponent(place[1]).replace(/\+/g, " ").trim() || null; } catch { name = null; }
  }
  // Las coordenadas suelen venir con la coma escapada (%2C): se normaliza antes de buscarlas.
  const flat = (() => { try { return decodeURIComponent(url); } catch { return url; } })();
  const data = flat.match(DATA_COORDS_RE);
  const coords =
    (data?.[1] ? [data[1], data[2]] : data?.[3] ? [data[3], data[4]] : null) ??
    flat.match(AT_COORDS_RE)?.slice(1, 3) ??
    flat.match(QUERY_COORDS_RE)?.slice(1, 3) ??
    flat.match(LL_COORDS_RE)?.slice(1, 3) ??
    null;
  const latitude = coords ? num(coords[0]) : null;
  const longitude = coords ? num(coords[1]) : null;
  return { name, latitude, longitude };
}

/**
 * Sigue la redirección del enlace corto y devuelve el sitio al que apunta.
 * Devuelve null si el enlace no es del acortador permitido o no se puede resolver.
 */
export async function resolveMapsLink(raw: string, fetchImpl: typeof fetch = fetch): Promise<MapsTarget | null> {
  if (!isAllowedShortLink(raw)) return null;
  const hit = cache.get(raw);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.target;

  let finalUrl = raw;
  try {
    // redirect: "follow" deja en res.url el destino final; con "manual" la
    // cabecera Location no es legible desde fetch y no serviría.
    const res = await fetchImpl(raw, { redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(10000) });
    if (res.url) finalUrl = res.url;
  } catch {
    return null;
  }
  const target = parseMapsUrl(finalUrl);
  if (target.latitude === null && target.longitude === null && !target.name) return null;
  cache.set(raw, { at: Date.now(), target });
  return target;
}
