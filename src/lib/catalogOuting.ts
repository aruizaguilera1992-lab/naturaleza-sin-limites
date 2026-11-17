import type { CatalogItem } from '@/lib/adminCatalog';

export type OutingMode = 'abierto' | 'privado';
/** Petición desde Catálogo para configurar una salida a partir de un recorrido ya documentado. */
export interface CatalogOutingStart { item: CatalogItem; mode: OutingMode; nonce: number }

/**
 * Producto reservable (categoría|slug) equivalente a un recorrido del catálogo, solo si existe uno idéntico.
 * Las referencias documentales y la espeleología nunca se asocian: no pueden cobrar señal automática.
 */
export function openGroupKeyFor(item: Pick<CatalogItem, 'key' | 'discipline' | 'reference'>, sellableKeys: string[]): string | null {
  if (item.reference || item.discipline === 'espeleologia') return null;
  const id = item.key.slice(item.key.indexOf(':') + 1);
  const candidate = `${item.discipline === 'ferratas' ? 'vias-ferratas' : 'barranquismo'}|${id}`;
  return sellableKeys.includes(candidate) ? candidate : null;
}
