import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { canyonCatalog, COMMERCIAL_LEVEL_LABEL } from '@/data/canyonCatalog';
import { ferratas } from '@/data/ferratas';
import { espeleologiaPublicada } from '@/data/espeleologia';
import { levelOffers } from '@/data/levelOffers';
import { andaluciaCanyonsRef, refLevelFromGrade } from '@/data/andaluciaCanyonsRef';
import { barrancos } from '@/data/barrancos';

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
  /** Recorrido de referencia documental (RocJumper), pendiente de validación comercial. */
  reference?: boolean;
  sourceUrl?: string;
  sourceLabel?: string;
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
  const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^(barranco|rio|arroyo|canon)\s+/, '').replace(/^(de|del)\s+/, '').replace(/^(la|las|el|los)\s+/, '').split(/[\s(]/)[0];
  const refs = andaluciaCanyonsRef.filter((r) => !canyonCatalog.some((c) =>
    c.fuentes.some((f) => f.url === r.url) || (r.slug === 'buitre-inferior-cerrada-lezar-castril' && c.id === 'buitre-inferior')
  )).map((r) => {
    const level = refLevelFromGrade(r.grado); const o = offerFor('barranquismo', level);
    return { key: `barranquismo:ref-${r.slug}`, discipline: 'barranquismo' as const, name: r.nombre, province: r.provincia, zone: r.poblacion,
      levelLabel: `${LEVEL_LABEL[level - 1]} (orientativo)`, level, grade: r.grado, duration: r.duracion, pricePerPersonEuros: null,
      summary: 'Referencia documental pendiente de revisar: no confirma acceso, permisos ni idoneidad para clientes.',
      description: r.rapelMaximo ? `Rápel más largo según la fuente: ${r.rapelMaximo}.` : '',
      includes: o ? [...o.incluye] : [], requirements: o ? [...o.caracteristicas] : [], minAge: o?.edadMinima ?? 10,
      fitness: o?.condicionFisica ?? 'Básica', experience: level > 1, reference: true, sourceUrl: r.url, sourceLabel: 'RocJumper' };
  });
  // Preserve full original routes separately from the curated lower/final sections.
  const originals = barrancos.filter((b) =>
    !canyonCatalog.some((c) => c.productoExistenteId === b.id || (!c.tramo && norm(c.nombre) === norm(b.nombre))) &&
    !andaluciaCanyonsRef.some((r) => norm(r.nombre) === norm(b.nombre))
  ).map((b) => {
    const level = b.nivelExperiencia === 'avanzado' || b.nivelExperiencia === 'experto' ? 3 : b.nivelExperiencia === 'intermedio' ? 2 : 1;
    return { key: `barranquismo:original-${b.id}`, discipline: 'barranquismo' as const,
      name: b.id === 'zarzalones' ? `${b.nombre} (Integral: superior + inferior)` : b.nombre,
      province: b.provincia, zone: b.poblacion, levelLabel: `${LEVEL_LABEL[level - 1]} (orientativo)`, level,
      grade: b.clasificacionTecnica, duration: b.duracion, pricePerPersonEuros: null,
      summary: 'Recorrido del catálogo original pendiente de revisión; no confirma acceso, permisos ni disponibilidad.',
      description: `Rápel máximo según el catálogo original: ${b.rapelMaximo}. Datos técnicos pendientes de verificar con la fuente.`,
      includes: [], requirements: [], minAge: b.requisitos.edadMinima,
      fitness: b.requisitos.condicionFisica === 'alta' ? 'Alta' : b.requisitos.condicionFisica === 'media' ? 'Media' : 'Básica',
      experience: level > 1, reference: true, sourceUrl: b.urlInfo, sourceLabel: 'Infobarrancos' };
  });
  const zarzalones = originals.find((b) => b.key === 'barranquismo:original-zarzalones');
  const superior = zarzalones ? [{ ...zarzalones, key: 'barranquismo:original-zarzalones-superior',
    name: 'Barranco de Zarzalones (Solo tramo superior)', grade: 'V4 A2 II (tramo superior)', duration: '',
    description: 'Tramo superior técnico separado del inferior. Duración pendiente de verificar con la fuente.' }] : [];
  return [...canyons, ...refs, ...originals, ...superior, ...fer, ...esp];
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
