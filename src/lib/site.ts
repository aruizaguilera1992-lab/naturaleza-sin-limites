/**
 * Dominio canónico único del sitio.
 *
 * Se usa en canonical, og:url, JSON-LD, sitemap y robots. No debe apuntar
 * nunca a dominios de preview (*.lovable.app / *.lovableproject.com):
 * esas URLs son entornos internos y no deben indexarse.
 */
export const SITE_URL = 'https://naturalezasinlimites.es';

/** Devuelve la URL absoluta canónica de una ruta interna. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
