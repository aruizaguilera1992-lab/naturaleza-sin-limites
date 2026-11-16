import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { canyonCatalog, COMMERCIAL_LEVEL_LABEL } from '@/data/canyonCatalog';
import { ferratas } from '@/data/ferratas';
import { espeleologiaPublicada } from '@/data/espeleologia';
import { levelOffers } from '@/data/levelOffers';

export type CatalogDiscipline = 'barranquismo' | 'ferratas' | 'espeleologia';

/** Ficha completa editable del catálogo original (solo panel; la web pública sigue por niveles). */
export interface CatalogItemData {
  name: string;
  province: string;
  zone: string;
  levelLabel: string;
  level: number; // 1-3
  grade: string;
  duration: string;
  pricePerPersonEuros: number | null;
  summary: string;
  description: string;
  includes: string[];
  requirements: string[];
  minAge: number;
  fitness: string;
  experience: boolean;
}

export interface CatalogItem extends CatalogItemData {
  key: string;
  discipline: CatalogDiscipline;
  /** Rutas de fotos propias en el almacenamiento (orden = portada primero). */
  photos: string[];
  edited: boolean;
}

const euros = (v: string | null | undefined) => { const n = parseInt(v?.match(/\d+/)?.[0] ?? '', 10); return n > 0 ? n : null; };
const kLevel = (k: string) => (['K1', 'K2'].includes(k) ? 1 : ['K3', 'K4'].includes(k) ? 2 : 3);
const LEVEL_LABEL = ['Iniciación', 'Intermedio', 'Avanzado'];
const offerFor = (d: 'barranquismo' | 'ferratas', level: number) => levelOffers.find((o) => o.discipline === d && o.orden === level);

export function baseCatalog(): Omit<CatalogItem, 'photos' | 'edited'>[] {
  const canyons = canyonCatalog.map((c) => {
    const level = c.nivelComercial === 'iniciacion' ? 1 : 2; const o = offerFor('barranquismo', level);
    return { key: `barranquismo:${c.id}`, discipline: 'barranquismo' as const, name: c.tramo ? `${c.nombre} (${c.tramo})` : c.nombre,
      province: c.provincia, zone: c.zona, levelLabel: COMMERCIAL_LEVEL_LABEL[c.nivelComercial], level, grade: c.gradoTecnico ?? '',
      duration: '', pricePerPersonEuros: euros(c.precio), summary: c.resumen, description: c.avisoAltura ?? '',
      includes: o ? [...o.incluye] : [], requirements: o ? [...o.caracteristicas] : [], minAge: o?.edadMinima ?? 10,
      fitness: o?.condicionFisica ?? 'Básica', experience: o?.experienciaPrevia ?? false };
  });
  const fer = ferratas.map((f) => {
    const level = kLevel(f.clasificacion); const o = offerFor('ferratas', level);
    return { key: `ferratas:${f.id}`, discipline: 'ferratas' as const, name: f.nombre, province: f.provincia, zone: f.zona,
      levelLabel: LEVEL_LABEL[level - 1], level, grade: f.clasificacion, duration: f.duracion, pricePerPersonEuros: euros(f.precio),
      summary: f.descripcionCorta, description: f.descripcionLarga, includes: o ? [...o.incluye] : [], requirements: o ? [...o.caracteristicas] : [],
      minAge: o?.edadMinima ?? 10, fitness: o?.condicionFisica ?? 'Básica', experience: o?.experienciaPrevia ?? false };
  });
  const esp = espeleologiaPublicada().map((e, i) => ({ key: `espeleologia:${e.id}`, discipline: 'espeleologia' as const, name: e.nombre,
    province: e.provincia, zone: e.zona, levelLabel: e.nivelLabel, level: Math.min(3, i + 1), grade: '', duration: e.duracion,
    pricePerPersonEuros: e.precioDesde > 0 ? e.precioDesde : null, summary: e.descripcionCorta, description: e.descripcionLarga,
    includes: [...e.incluye], requirements: [...e.caracteristicas], minAge: e.requisitos.edadMinima, fitness: e.requisitos.condicionFisica,
    experience: e.requisitos.experienciaPrevia }));
  return [...canyons, ...fer, ...esp];
}

export interface CatalogOverride { key: string; data: Partial<CatalogItemData>; photos: string[] }

/** Los cambios guardados en el panel prevalecen; lo no editado conserva el dato original. */
export function mergeCatalog(base: Omit<CatalogItem, 'photos' | 'edited'>[], overrides: CatalogOverride[]): CatalogItem[] {
  const map = new Map(overrides.map((o) => [o.key, o]));
  return base.map((b) => { const o = map.get(b.key); return { ...b, ...(o?.data ?? {}), key: b.key, discipline: b.discipline, photos: o?.photos ?? [], edited: Boolean(o) }; });
}

export const CATALOG_BUCKET = 'catalog-photos';
const signedCache = new Map<string, string>();
/** El almacén es privado: las fotos se sirven con enlaces firmados de larga duración. */
export async function photoUrls(paths: string[]): Promise<Record<string, string>> {
  const missing = paths.filter((p) => !signedCache.has(p));
  if (missing.length) {
    const { data } = await supabase.storage.from(CATALOG_BUCKET).createSignedUrls(missing, 60 * 60 * 24 * 7);
    data?.forEach((d) => { if (d.path && d.signedUrl) signedCache.set(d.path, d.signedUrl); });
  }
  return Object.fromEntries(paths.filter((p) => signedCache.has(p)).map((p) => [p, signedCache.get(p)!]));
}

export function usePhotoUrls(paths: string[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const key = paths.join('|');
  useEffect(() => { let alive = true; if (paths.length) void photoUrls(paths).then((u) => alive && setUrls(u)); return () => { alive = false; }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return urls;
}

export function useAdminCatalog() {
  const [items, setItems] = useState<CatalogItem[]>(() => mergeCatalog(baseCatalog(), []));
  const reload = useCallback(async () => {
    const { data } = await supabase.from('catalog_entries').select('key, data, photos');
    setItems(mergeCatalog(baseCatalog(), (data ?? []) as unknown as CatalogOverride[]));
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { items, reload };
}
