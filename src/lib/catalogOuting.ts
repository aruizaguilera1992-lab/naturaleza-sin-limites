import type { CatalogItem } from '@/lib/adminCatalog';

export type OutingMode = 'abierto' | 'privado';
/** Petición desde Catálogo para configurar una salida a partir de un recorrido ya documentado. */
export interface CatalogOutingStart { item: CatalogItem; mode: OutingMode; nonce: number }

/**
 * Producto reservable (categoría|slug) equivalente a un recorrido del catálogo, solo si existe uno idéntico.
 * Las referencias documentales nunca se asocian: no pueden cobrar señal automática.
 */
export function openGroupKeyFor(item: Pick<CatalogItem, 'key' | 'discipline' | 'reference'>, sellableKeys: string[]): string | null {
  if (item.reference) return null;
  const id = item.key.slice(item.key.indexOf(':') + 1);
  const candidate = `${item.discipline === 'ferratas' ? 'vias-ferratas' : item.discipline}|${id}`;
  return sellableKeys.includes(candidate) ? candidate : null;
}
