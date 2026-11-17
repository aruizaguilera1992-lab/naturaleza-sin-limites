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

export type MapsTarget = { name: string | null; latitude: number | null; longitude: number | null };

/**
 * Enlace a Apple Maps. Con coordenadas resueltas abre el punto exacto;
 * si no, busca el texto descriptivo (sin la URL pegada).
 */
export function appleMapsUrl(text: string, target?: MapsTarget | null): string {
  if (target && target.latitude !== null && target.longitude !== null) {
    const q = target.name ? `&q=${encodeURIComponent(target.name)}` : '';
    return `https://maps.apple.com/?ll=${target.latitude},${target.longitude}${q}`;
  }
  const query = textWithoutUrl(text) || text.trim();
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

/**
 * ¿Se puede abrir el punto en Apple Maps? Hace falta coordenadas o un nombre
 * legible; con un enlace de Google sin resolver no hay nada que buscar ahí.
 */
export function canOpenInAppleMaps(text: string, target?: MapsTarget | null): boolean {
  return !!target || !!textWithoutUrl(text);
}

/** Nombres que indican que un paso del cronograma es el punto de quedada. */
const MEETING_RE = /quedada|punto de (?:quedada|encuentro|reuni[oó]n)|lugar de encuentro|meeting point/i;
const MAPS_HOST_RE = /(?:^|\/\/|\.)(?:maps\.google\.com|google\.[a-z]{2,3}\/maps|maps\.app\.goo\.gl|goo\.gl)/i;

/** ¿Este paso del cronograma habla del punto de quedada o trae un enlace de mapas? */
export function isMeetingPointLabel(label: string): boolean {
  return MEETING_RE.test(label) || MAPS_HOST_RE.test(label);
}

/** Enlaces cortos de Google que hace falta resolver para saber el sitio exacto. */
export function isShortMapLink(url: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'maps.app.goo.gl' || host === 'goo.gl';
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

/**
 * Lee el nombre y las coordenadas de un enlace de Google Maps ya resuelto
 * (el que devuelve maps.app.goo.gl tras seguir la redirección).
 */
export function parseMapsUrl(url: string): MapsTarget {
  let name: string | null = null;
  const place = url.match(PLACE_NAME_RE) ?? url.match(SEARCH_NAME_RE);
  if (place?.[1]) {
    try { name = decodeURIComponent(place[1]).replace(/\+/g, ' ').trim() || null; } catch { name = null; }
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
