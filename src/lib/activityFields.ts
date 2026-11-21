import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { CatalogItem } from '@/lib/adminCatalog';
import type { CatalogOverride } from '@/lib/catalogSync';

/**
 * Campos de la actividad comunes a Catálogo, Grupo abierto y Grupo privado.
 * Un solo formato para editar en cualquiera de los tres sitios y guardarlo de vuelta en el catálogo.
 */
export interface ActivityFields {
  name: string;
  grade: string;
  level: number;
  levelLabel: string;
  duration: string;
  pricePerPersonEuros: number | null;
  minAge: number;
  fitness: string;
  experience: boolean;
  summary: string;
  videoUrl: string;
  description: string;
  includes: string[];
  bring: string[];
  requirements: string[];
  /** Lo más destacado (ficha técnica); vacío = se usan los de la ficha original. */
  highlights: string[];
  rules: string;
  steps: string;
  /** Ruta de la foto propia en el bucket catalog-photos; '' = sin foto propia. */
  imagePath: string;
}

export const LEVEL_LABELS = ['Iniciación', 'Intermedio', 'Avanzado'];

export function fieldsFromCatalog(item: CatalogItem): ActivityFields {
  return {
    name: item.name, grade: item.grade, level: item.level, levelLabel: item.levelLabel, duration: item.duration,
    pricePerPersonEuros: item.pricePerPersonEuros, minAge: item.minAge, fitness: item.fitness, experience: item.experience,
    summary: item.summary, videoUrl: item.videoUrl ?? '', description: item.description,
    includes: [...item.includes], bring: [...(item.bring ?? [])], requirements: [...item.requirements], highlights: [...(item.highlights ?? [])],
    rules: item.rules ?? '', steps: item.steps ?? '', imagePath: item.photos[0] ?? '',
  };
}

/** Copia que guarda una salida de grupo abierto: la web la muestra tal cual, aunque luego cambie el catálogo. */
export function snapshotFromFields(key: string, f: ActivityFields, place: { zone?: string; province?: string } = {}): CatalogOverride {
  return { key, name: f.name, zone: place.zone, province: place.province, levelLabel: f.levelLabel, level: f.level, grade: f.grade,
    duration: f.duration, pricePerPersonEuros: f.pricePerPersonEuros, summary: f.summary, description: f.description,
    includes: f.includes, bring: f.bring, requirements: f.requirements, highlights: f.highlights, minAge: f.minAge, fitness: f.fitness,
    experience: f.experience, videoUrl: f.videoUrl, imagePath: f.imagePath || undefined };
}

/** Clave del catálogo para una salida abierta (inversa de openGroupKeyFor). */
export const catalogKeyForEvent = (category: string, slug: string) =>
  `${category === 'vias-ferratas' ? 'ferratas' : category}:${slug}`;

/**
 * Lo editado desde una salida se guarda también en la ficha del catálogo (sin tocar fotos ni otros datos).
 * El precio no se escribe: cada salida puede tener su propio precio acordado.
 * Las salidas ya creadas conservan su copia; solo las nuevas toman estos cambios.
 */
export async function saveFieldsToCatalog(key: string, f: ActivityFields): Promise<string | null> {
  const { data: row, error: readError } = await supabase.from('catalog_entries').select('data, photos').eq('key', key).maybeSingle();
  if (readError) return readError.message;
  const { pricePerPersonEuros: _price, imagePath, ...editorial } = f;
  const data = { ...((row?.data as Record<string, unknown> | null) ?? {}), ...editorial };
  // La foto elegida pasa a ser la primera; el resto de fotos propias se conservan.
  const rest = (row?.photos ?? []).filter((p) => p !== imagePath);
  const photos = imagePath ? [imagePath, ...rest] : rest;
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from('catalog_entries').upsert({ key, data: data as unknown as Json, photos, updated_by: u.user?.id ?? null });
  return error?.message ?? null;
}

/** Campos de una salida abierta guardada: su copia manda; lo que falte se toma del catálogo actual. */
export function fieldsFromSnapshot(snap: CatalogOverride | null | undefined, fallback: ActivityFields, rules?: string | null, steps?: string | null): ActivityFields {
  const o = snap ?? {};
  return {
    ...fallback,
    ...Object.fromEntries(Object.entries({ name: o.name, grade: o.grade, level: o.level, levelLabel: o.levelLabel, duration: o.duration,
      pricePerPersonEuros: o.pricePerPersonEuros, minAge: o.minAge, fitness: o.fitness, experience: o.experience, summary: o.summary,
      videoUrl: o.videoUrl, description: o.description, includes: o.includes, bring: o.bring, requirements: o.requirements, highlights: o.highlights,
      imagePath: o.imagePath })
      .filter(([, v]) => v !== undefined)),
    rules: rules ?? fallback.rules, steps: steps ?? fallback.steps,
  } as ActivityFields;
}
