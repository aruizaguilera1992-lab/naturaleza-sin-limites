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
  /** Enlace de vídeo (YouTube o Vimeo) escrito en el catálogo del panel. */
  videoUrl?: string;
  /** Qué llevar, escrito en el catálogo o en la salida. */
  bring?: string[];
  /** Lo más destacado escrito en el catálogo o en la salida. */
  highlights?: string[];
  /** Ruta de la foto propia en el bucket catalog-photos (solo la sirve la función outing-photo). */
  imagePath?: string;
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
  /** Vídeo de la actividad (enlace validado de YouTube o Vimeo), si el catálogo lo define. */
  videoUrl: string;
  /** Foto propia subida desde el panel (ruta en el almacén privado), si la salida la define. */
  imagePath: string;
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
 * Los textos de duración que la ficha original redactó a partir de su propio dato
 * (la pastilla de destacados, la descripción y las preguntas frecuentes) pasan a
 * llevar la duración escrita en el catálogo del panel.
 */
const DURATION_PATTERNS: [RegExp, (d: string) => string][] = [
  [/(Duración total(?: estimada)?):\s*[^.]+/i, (d) => `$1: ${d}`],
  [/(duración total estimada de )[^.]+/i, (d) => `$1${d}`],
];

function withDuration(value: string, duration: string) {
  if (!value || !duration) return value;
  return DURATION_PATTERNS.reduce(
    (out, [re, build]) => out.replace(re, build(duration)),
    value,
  );
}

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
  /** Duración escrita en el catálogo del panel: manda sobre la redacción de la ficha original. */
  const catalogDuration = text(o.duration);
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

  const sheet: OutingSheet = {
    title: text(o.name, event.title, p?.name),
    summary: text(o.summary, p?.shortDescription),
    description: withDuration(text(o.description, p?.commercialDescription), catalogDuration),
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
    bring: list(o.bring, p?.bring),
    technicalElements: list(p?.technicalElements),
    itinerary: list(p?.itinerary),
    insurancePermits: list(p?.insurancePermits),
    highlights: list(o.highlights, p?.highlights).map((h) => withDuration(h, catalogDuration)),
    season: text(p?.season),
    group: text(p?.group),
    guideRatio: text(p?.guideRatio),
    approachReturn: text(p?.approachReturn),
    weatherPolicy: text(p?.weatherPolicy),
    cancellationPolicy: text(p?.cancellationPolicy),
    videoUrl: text(o.videoUrl),
    imagePath: text(o.imagePath),
    faqs: Array.isArray(p?.faqs)
      ? p.faqs.map((f) => ({ ...f, answer: withDuration(f.answer, catalogDuration) }))
      : [],
    fromCatalog: Boolean(o.key),
  };
  sheet.faqs = buildOutingFaqs(sheet, {
    place: text(o.zone, event.meeting_point_public, event.zone, p?.zone),
    province: text(o.province, p?.province),
  });
  return sheet;
}

const PENDING_RE = /pendiente|consultar disponibilidad/i;
const known = (v?: string) => (v && v.trim() && !PENDING_RE.test(v) ? v.trim().replace(/[.\s]+$/, "") : "");
const joinList = (items: string[]) => items.map((i) => i.replace(/[.\s]+$/, "")).filter(Boolean).join(", ");

/**
 * Preguntas frecuentes redactadas con los datos concretos de esta ficha
 * (catálogo del panel > salida > ficha original). Si un dato no existe, se dice
 * que se confirma antes de la salida; nunca se inventa.
 */
export function buildOutingFaqs(
  s: OutingSheet,
  where: { place: string; province: string },
): { question: string; answer: string }[] {
  const name = s.title.replace(/[.\s]+$/, "");
  const place = [known(where.place), known(where.province)].filter(Boolean).join(", ");
  const meeting = known(s.meetingPoint);
  const approach = known(s.approachReturn);
  const duration = known(s.duration);
  const effective = known(s.effectiveDuration);
  const level = known(s.levelLabel);
  const grade = known(s.grade);
  const fitness = known(s.fitness);
  const minAge = known(s.minAge);
  const group = known(s.group);
  const ratio = known(s.guideRatio);
  const season = known(s.season);
  const includes = s.includes.filter((i) => known(i));
  const bring = s.bring.filter((i) => known(i));
  const reqs = s.requirements.filter((i) => known(i));
  const later = "se confirma antes de la salida";
  const faqs: { question: string; answer: string }[] = [
    {
      question: `¿Dónde se realiza ${name}?`,
      answer: [
        place ? `En ${place}.` : `El lugar exacto ${later}.`,
        meeting && meeting !== known(where.place) ? `Zona de encuentro: ${meeting}.` : "",
        approach ? `Aproximación y retorno: ${approach}.` : "",
        "El punto exacto se envía al confirmar la plaza.",
      ].filter(Boolean).join(" "),
    },
    {
      question: `¿Cuánto dura ${name}?`,
      answer: [
        duration ? `Duración total: ${duration}.` : `La duración ${later}.`,
        effective && effective !== duration ? `Actividad efectiva: ${effective}.` : "",
        "El tiempo real depende del ritmo del grupo y de las condiciones del día.",
      ].filter(Boolean).join(" "),
    },
    {
      question: "¿Qué nivel tiene?",
      answer: [
        level ? `Nivel: ${level}.` : "",
        grade ? `Grado técnico: ${grade}.` : "",
        fitness ? `Condición física: ${fitness}.` : "",
      ].filter(Boolean).join(" ") || `El nivel ${later}.`,
    },
    {
      question: "¿Necesito experiencia previa?",
      answer: `${known(s.experience) || "Se valora con cada participante"}. Antes de cerrar la plaza revisamos la experiencia y la condición física de cada persona.`,
    },
    {
      question: "¿Qué edad mínima se exige?",
      answer: minAge
        ? `Edad mínima: ${minAge.replace(/^\+/, "")}${/año/.test(minAge) ? "" : " años"}. En menores se requiere la autorización de la persona responsable.`
        : `La edad mínima ${later}.`,
    },
    {
      question: "¿Cuánto cuesta y cómo se paga?",
      answer: `${s.price ? `${s.price} € por persona` : "El precio se confirma al cerrar la salida"}. La plaza se confirma con una señal del 30 %; el resto se abona antes de la actividad por Bizum, en efectivo o por el enlace de pago.`,
    },
    {
      question: "¿Cuántas personas forman el grupo?",
      answer: [group ? `Grupo: ${group}.` : `El tamaño del grupo ${later}.`, ratio && /\d/.test(ratio) ? `Ratio: ${ratio}.` : ""]
        .filter(Boolean).join(" "),
    },
    {
      question: "¿En qué época se puede hacer?",
      answer: season ? `Temporada: ${season}. La fecha se confirma según las condiciones y permisos vigentes.` : `La temporada ${later}.`,
    },
    {
      question: "¿Qué material está incluido?",
      answer: includes.length ? `Incluye: ${joinList(includes)}.` : `El material incluido ${later}.`,
    },
    {
      question: "¿Qué tengo que llevar?",
      answer: bring.length ? `Lleva: ${joinList(bring)}.` : "Te enviamos la lista de material personal al confirmar la reserva.",
    },
  ];
  if (reqs.length) {
    faqs.push({ question: "¿Qué requisitos hay para participar?", answer: `${joinList(reqs)}.` });
  }
  faqs.push({
    question: "¿Qué ocurre si cambia el tiempo?",
    answer: [known(s.weatherPolicy) || "Si la meteorología no es segura, proponemos una nueva fecha", known(s.cancellationPolicy)]
      .filter(Boolean).map((t) => `${t}.`).join(" "),
  });
  return faqs;
}
