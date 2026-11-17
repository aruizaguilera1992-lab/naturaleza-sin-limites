// Resuelve los enlaces cortos de Google Maps (maps.app.goo.gl) para saber el
// sitio exacto del punto de quedada: nombre y coordenadas. Sin claves API:
// solo sigue la redirección HTTP del propio enlace.

export type MapsTarget = { name: string | null; latitude: number | null; longitude: number | null };

/** Único host permitido: el acortador de Google Maps. Nada de URLs arbitrarias. */
const ALLOWED_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);
const MAX_HOPS = 3;
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

/** Nombre y coordenadas de un enlace de Google Maps ya resuelto. */
export function parseMapsUrl(url: string): MapsTarget {
  let name: string | null = null;
  const place = url.match(PLACE_NAME_RE) ?? url.match(SEARCH_NAME_RE);
  if (place?.[1]) {
    try { name = decodeURIComponent(place[1]).replace(/\+/g, " ").trim() || null; } catch { name = null; }
  }
  const data = url.match(DATA_COORDS_RE);
  const coords =
    (data?.[1] ? [data[1], data[2]] : data?.[3] ? [data[3], data[4]] : null) ??
    url.match(AT_COORDS_RE)?.slice(1, 3) ??
    url.match(QUERY_COORDS_RE)?.slice(1, 3) ??
    url.match(LL_COORDS_RE)?.slice(1, 3) ??
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

  let current = raw;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let res: Response;
    try {
      res = await fetchImpl(current, { redirect: "manual", headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) });
    } catch {
      return null;
    }
    const next = res.headers.get("location");
    if (!next) break;
    current = new URL(next, current).toString();
    // Enlace ya resuelto: Google Maps devuelve el sitio con nombre y coordenadas.
    if (/google\.[a-z]{2,3}\/maps/i.test(current)) break;
  }
  const target = parseMapsUrl(current);
  if (target.latitude === null && target.longitude === null && !target.name) return null;
  cache.set(raw, { at: Date.now(), target });
  return target;
}
