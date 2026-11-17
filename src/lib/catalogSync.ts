import type { ActivityProfile } from "@/data/activityProfiles";
import type { ActivityEvent } from "@/hooks/useActivityEvents";

/**
 * Datos comerciales y editoriales que el panel guarda en el catálogo (`catalog_entries`).
 * Los devuelve la función `get_catalog_for_outing(categoría, slug)`, que solo expone
 * estos campos: las fotos del catálogo siguen en el almacén privado.
 */
export interface CatalogOverride {
  key?: string;
  name?: string;
  zone?: string;
  province?: string;
  levelLabel?: string;
  level?: number;
  grade?: string;
  duration?: string;
  pricePerPersonEuros?: number | null;
  summary?: string;
  description?: string;
  includes?: string[];
  requirements?: string[];
  minAge?: number;
  fitness?: string;
  experience?: boolean;
}

/** Vista de la ficha técnica: un solo origen para todos los bloques visibles. */
export interface OutingSheet {
  title: string;
  summary: string;
  description: string;
  meetingPoint: string;
  price: number | null;
  duration: string;
  effectiveDuration: string;
  levelLabel: string;
  /** 1 iniciación · 2 intermedio · 3 avanzado. */
  level: number;
  grade: string;
  minAge: string;
  fitness: string;
  experience: string;
  includes: string[];
  requirements: string[];
  bring: string[];
  technicalElements: string[];
  itinerary: string[];
  insurancePermits: string[];
  highlights: string[];
  season: string;
  group: string;
  guideRatio: string;
  approachReturn: string;
  weatherPolicy: string;
  cancellationPolicy: string;
  /** Preguntas frecuentes de la actividad, para la última diapositiva de la ficha. */
  faqs: { question: string; answer: string }[];
  /** true cuando el catálogo del panel aporta alguno de los datos mostrados. */
  fromCatalog: boolean;
}

const LEVEL_WORDS: [RegExp, number][] = [
  [/inicia|f[aá]cil|intro/i, 1],
  [/intermed|med io|medio/i, 2],
  [/avanz|experto|integral/i, 3],
];

/** Nivel 1-3 a partir de una etiqueta escrita a mano («Intermedio», «K3»…). */
export function levelFromLabel(label?: string | null): number | null {
  if (!label) return null;
  for (const [re, n] of LEVEL_WORDS) if (re.test(label)) return n;
  const k = label.match(/K\s*([1-6])/i);
  if (k) {
    const v = Number(k[1]);
    return v <= 2 ? 1 : v <= 4 ? 2 : 3;
  }
  return null;
}

const text = (...v: (string | null | undefined)[]) => v.find((s) => Boolean(s && s.trim()))?.trim() ?? "";
const list = (...v: (string[] | null | undefined)[]) => v.find((s) => Array.isArray(s) && s.length > 0) ?? [];

/**
 * Combina la salida programada con la ficha del catálogo.
 * Orden de prioridad: lo que el admin escribió en el catálogo > datos de la salida > ficha original.
 */
export function mergeOutingSheet(
  event: Pick<ActivityEvent, "title" | "zone" | "meeting_point_public" | "price_cents">,
  profile: ActivityProfile | undefined,
  override: CatalogOverride | null | undefined,
): OutingSheet {
  const o = override ?? {};
  const p = profile;
  const levelLabel = text(o.levelLabel, p?.experienceLevel);
  const level =
    typeof o.level === "number" && o.level >= 1 && o.level <= 3
      ? Math.round(o.level)
      : levelFromLabel(levelLabel) ?? levelFromLabel(p?.technicalLevel) ?? 1;
  const price =
    event.price_cents && event.price_cents > 0
      ? event.price_cents / 100
      : typeof o.pricePerPersonEuros === "number" && o.pricePerPersonEuros > 0
        ? o.pricePerPersonEuros
        : p?.priceValue ?? null;

  return {
    title: text(o.name, event.title, p?.name),
    summary: text(o.summary, p?.shortDescription),
    description: text(o.description, p?.commercialDescription),
    meetingPoint: text(event.meeting_point_public, o.zone, event.zone, p?.zone),
    price,
    duration: text(o.duration, p?.totalDuration),
    effectiveDuration: text(p?.effectiveDuration),
    levelLabel: levelLabel || text(p?.technicalLevel),
    level,
    grade: text(o.grade, p?.technicalLevel),
    minAge: typeof o.minAge === "number" && o.minAge > 0 ? `+${Math.round(o.minAge)}` : text(p?.minimumAge),
    fitness: text(o.fitness, p?.physicalLevel),
    experience:
      o.experience === true
        ? "Requiere experiencia previa"
        : o.experience === false
          ? "No requiere experiencia previa"
          : text(p?.experienceLevel, p?.previousExperience),
    includes: list(o.includes, p?.included),
    requirements: list(o.requirements, p?.safetyRequirements),
    bring: list(p?.bring),
    technicalElements: list(p?.technicalElements),
    itinerary: list(p?.itinerary),
    insurancePermits: list(p?.insurancePermits),
    highlights: list(p?.highlights),
    season: text(p?.season),
    group: text(p?.group),
    guideRatio: text(p?.guideRatio),
    approachReturn: text(p?.approachReturn),
    weatherPolicy: text(p?.weatherPolicy),
    cancellationPolicy: text(p?.cancellationPolicy),
    faqs: Array.isArray(p?.faqs) ? p.faqs : [],
    fromCatalog: Boolean(o.key),
  };
}
