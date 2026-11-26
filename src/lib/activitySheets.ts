import { levelOffers, levelOfferExplanation, levelOfferPhotos } from '@/data/levelOffers';
import { espeleologiaPublicada } from '@/data/espeleologia';
import type { CatalogItem } from '@/lib/adminCatalog';
import { safeVideoEmbed } from '@/lib/safeVideo';
import { safeWhatsappGroup } from '@/lib/safeWhatsapp';
import type { ActivityFields } from '@/lib/activityFields';
import { buildOutingFaqs, type OutingSheet } from '@/lib/catalogSync';

export const MAX_SHEET_PEOPLE = 20;

export interface SheetContent {
  base: string; // id de nivel de partida
  discipline: 'barranquismo' | 'ferratas' | 'espeleologia';
  level: number;
  levelLabel: string;
  title: string;
  place: string;
  date: string; // YYYY-MM-DD
  duration: string;
  meetingPoint: string;
  people: number;
  pricePerPersonEuros: number | null;
  summary: string;
  /** Mismos campos que la ficha del catálogo (opcionales para fichas antiguas). */
  grade?: string;
  description?: string;
  videoUrl?: string;
  includes: string[];
  bring: string[];
  requirements: string[];
  highlights?: string[];
  notes: string;
  rules?: string;
  steps?: string;
  /** Enlace de invitación al grupo de WhatsApp de la actividad (solo chat.whatsapp.com). */
  whatsappGroup?: string;
  minAge: number;
  fitness: string;
  experience: boolean;
  photo: string | null; // clave de levelOfferPhotos o «storage:<ruta>» para fotos propias del catálogo
  /** Rutas extra (bucket catalog-photos) de las fotos guardadas en el catálogo, mostradas como galería. */
  gallery?: string[];
  customerName: string;
  /** Solicitud web de origen: al aceptar, la ficha reutiliza esa reserva en lugar de crear otra. */
  sourceBookingId?: string;
}

export interface SheetBase { id: string; label: string; discipline: SheetContent['discipline'] }

export const sheetBases: SheetBase[] = [
  ...levelOffers.map((o) => ({ id: o.id, label: o.nombre, discipline: o.discipline })),
  ...espeleologiaPublicada().map((e) => ({ id: `espeleologia-${e.id}`, label: e.nombre, discipline: 'espeleologia' as const })),
];

export const sheetPhotoOptions = Object.entries(levelOfferPhotos).map(([key, p]) => ({ key, ...p }));

/** Rellena una ficha a partir de un nivel existente (texto, indicadores, incluye, edad). */
export function sheetFromBase(baseId: string): SheetContent {
  const empty = { place: '', date: '', duration: '', meetingPoint: '', people: 2, pricePerPersonEuros: null, bring: [], notes: '', customerName: '' };
  const o = levelOffers.find((x) => x.id === baseId);
  if (o) {
    return { ...empty, base: o.id, discipline: o.discipline, level: o.orden, levelLabel: o.nivel, title: o.nombre,
      summary: levelOfferExplanation[o.id]?.consiste[0] ?? o.descripcionCorta, includes: [...o.incluye], requirements: [...o.caracteristicas],
      minAge: o.edadMinima, fitness: o.condicionFisica, experience: o.experienciaPrevia, pricePerPersonEuros: o.precioDesde,
      photo: levelOfferPhotos[o.id] ? o.id : null };
  }
  const list = espeleologiaPublicada();
  const idx = list.findIndex((e) => `espeleologia-${e.id}` === baseId);
  const e = list[Math.max(0, idx)];
  return { ...empty, base: `espeleologia-${e.id}`, discipline: 'espeleologia', level: Math.min(3, Math.max(0, idx) + 1), levelLabel: e.nivelLabel,
    title: e.nombre, summary: e.descripcionCorta, includes: [...e.incluye], requirements: [...e.caracteristicas], duration: e.duracion,
    minAge: e.requisitos.edadMinima, fitness: e.requisitos.condicionFisica, experience: e.requisitos.experienciaPrevia, photo: null };
}

export function validateSheet(c: SheetContent): string[] {
  const errors: string[] = [];
  if (!c.title.trim()) errors.push('Falta el título');
  if (c.videoUrl?.trim() && !safeVideoEmbed(c.videoUrl)) errors.push('El vídeo debe ser un enlace de YouTube o Vimeo');
  if (c.whatsappGroup?.trim() && !safeWhatsappGroup(c.whatsappGroup)) errors.push('El grupo de WhatsApp debe ser un enlace de invitación (https://chat.whatsapp.com/…)');
  if (!Number.isInteger(c.people) || c.people < 1 || c.people > MAX_SHEET_PEOPLE) errors.push(`Personas entre 1 y ${MAX_SHEET_PEOPLE}`);
  if (c.pricePerPersonEuros !== null && (!(c.pricePerPersonEuros > 0) || c.pricePerPersonEuros > 5000)) errors.push('Precio no válido');
  return errors;
}

export const sheetTotalEuros = (c: Pick<SheetContent, 'people' | 'pricePerPersonEuros'>) =>
  c.pricePerPersonEuros === null ? null : Math.round(c.pricePerPersonEuros * c.people * 100) / 100;

export const slugifyTitle = (t: string) => (t || 'actividad').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'actividad';
/** Enlace legible: /ficha/<nombre-actividad>-<código corto>; sin código corto cae al token completo. */
export const sheetUrl = (origin: string, token: string, title?: string, shortCode?: string | null) =>
  `${origin.replace(/\/$/, '')}/ficha/${shortCode ? `${slugifyTitle(title ?? '')}-${shortCode}` : token}`;
/** Extrae el código corto (10 caracteres finales) de un enlace legible; null si es un token completo. */
export const shortCodeFromParam = (param: string): string | null => {
  if (/^[a-f0-9]{64}$/i.test(param)) return null;
  const m = /(?:^|-)([a-z2-9]{10})$/.exec(param.toLowerCase());
  return m ? m[1] : null;
};

/** Teléfono para wa.me: solo dígitos, con prefijo 34 si es un número español de 9 cifras. */
export function waPhone(phone: string | null | undefined): string | null {
  const d = (phone ?? '').replace(/\D/g, '').replace(/^00/, '');
  if (d.length === 9 && /^[6789]/.test(d)) return `34${d}`;
  return d.length >= 10 && d.length <= 15 ? d : null;
}

export function sheetWhatsappUrl(phone: string | null | undefined, c: Pick<SheetContent, 'title' | 'customerName'>, link: string) {
  const greet = c.customerName.trim() ? `Hola ${c.customerName.trim()}` : 'Hola';
  const text = `${greet}, te enviamos la ficha de tu actividad «${c.title}» de Naturaleza Sin Límites: ${link}`;
  const p = waPhone(phone);
  return `https://wa.me/${p ?? ''}?text=${encodeURIComponent(text)}`;
}

export type SheetState = 'borrador' | 'enviada' | 'vista' | 'aceptada' | 'caducada' | 'desactivada';
export function sheetState(s: { status: string; expires_at: string | null; first_viewed_at: string | null; accepted_at?: string | null }, now = new Date()): SheetState {
  if (s.status === 'desactivada') return 'desactivada';
  if (s.status === 'borrador') return 'borrador';
  if (s.accepted_at) return 'aceptada';
  if (s.expires_at && new Date(s.expires_at) < now) return 'caducada';
  return s.first_viewed_at ? 'vista' : 'enviada';
}

export const STORAGE_PHOTO = 'storage:';

/** Rellena una ficha desde un recorrido del catálogo editable (con su foto de portada propia si la hay). */
export function sheetFromCatalog(item: CatalogItem): SheetContent {
  return { base: `catalog:${item.key}`, discipline: item.discipline, level: item.level, levelLabel: item.levelLabel, title: item.name,
    place: [item.zone, item.province].filter(Boolean).join(', '), date: '', duration: item.duration, meetingPoint: '', people: 2,
    pricePerPersonEuros: item.pricePerPersonEuros, summary: item.summary, grade: item.grade, description: item.description,
    videoUrl: item.videoUrl ?? '', includes: [...item.includes], bring: [...(item.bring ?? [])], rules: item.rules ?? '', steps: item.steps ?? '',
    requirements: [...item.requirements], highlights: [...(item.highlights ?? [])], notes: '', minAge: item.minAge, fitness: item.fitness, experience: item.experience,
    photo: item.photos[0] ? `${STORAGE_PHOTO}${item.photos[0]}` : null, gallery: [...item.photos], customerName: '' };
}

export interface SheetRequestPrefill { bookingId: string; activity: string; date: string | null; people: string | null; level: string | null; name: string | null; email: string | null; phone: string | null; message: string | null }

const norm = (s: string | null | undefined) => (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Ficha nueva a partir de una solicitud web: elige nivel por actividad + experiencia y copia los datos del cliente. */
export function sheetFromRequest(p: SheetRequestPrefill): SheetContent {
  const a = norm(p.activity), l = norm(p.level);
  const discipline = a.includes('ferrat') ? 'ferratas' : a.includes('espeleo') || a.includes('cueva') ? 'espeleologia' : a.includes('barran') ? 'barranquismo' : null;
  const tier = l.includes('avanz') || l.includes('experto') ? 'avanzado' : l.includes('inter') ? 'intermedio' : 'iniciacion';
  const base = discipline === 'espeleologia' ? (sheetBases.find((b) => b.discipline === 'espeleologia')?.id ?? sheetBases[0].id)
    : `${discipline ?? 'barranquismo'}-${tier}`;
  const c = sheetFromBase(sheetBases.some((b) => b.id === base) ? base : sheetBases[0].id);
  const n = parseInt(p.people ?? '', 10);
  return { ...c, sourceBookingId: p.bookingId, customerName: (p.name ?? '').trim(), date: p.date ?? '',
    people: Number.isFinite(n) ? Math.min(MAX_SHEET_PEOPLE, Math.max(1, n)) : c.people,
    notes: p.message?.trim() ? `Mensaje del cliente: ${p.message.trim()}` : '' };
}

/** Campos comunes (mismo editor que Catálogo y Grupo abierto). */
export function fieldsFromSheet(c: SheetContent): ActivityFields {
  return { name: c.title, grade: c.grade ?? '', level: c.level, levelLabel: c.levelLabel, duration: c.duration,
    pricePerPersonEuros: c.pricePerPersonEuros, minAge: c.minAge, fitness: c.fitness, experience: c.experience,
    summary: c.summary, videoUrl: c.videoUrl ?? '', description: c.description ?? '', includes: c.includes,
    bring: c.bring, requirements: c.requirements, highlights: c.highlights ?? [], rules: c.rules ?? '', steps: c.steps ?? '',
    imagePath: c.photo?.startsWith(STORAGE_PHOTO) ? c.photo.slice(STORAGE_PHOTO.length) : '' };
}
export function applyFieldsToSheet(c: SheetContent, f: ActivityFields): SheetContent {
  const { name, imagePath, ...rest } = f;
  // Una foto propia nueva sustituye a la anterior; vaciarla quita solo las fotos propias
  // y conserva las ilustrativas de las ofertas por nivel.
  const photo = imagePath ? `${STORAGE_PHOTO}${imagePath}` : c.photo?.startsWith(STORAGE_PHOTO) ? null : c.photo;
  return { ...c, ...rest, title: name, photo };
}

/**
 * Preguntas frecuentes de la ficha privada, redactadas con los datos escritos en ella
 * (mismo redactor que las salidas de grupo abierto). Lo que la ficha no define se
 * anuncia como «se confirma antes de la salida»: nunca se inventa.
 */
export function sheetFaqs(c: SheetContent): { question: string; answer: string }[] {
  const s: OutingSheet = {
    title: c.title, summary: c.summary, description: c.description ?? '', meetingPoint: c.meetingPoint,
    price: c.pricePerPersonEuros, duration: c.duration, effectiveDuration: '', levelLabel: c.levelLabel,
    level: c.level, grade: c.grade ?? '', minAge: c.minAge ? `+${c.minAge}` : '', fitness: c.fitness,
    experience: c.experience ? 'Requiere experiencia previa' : 'No requiere experiencia previa',
    includes: c.includes, requirements: c.requirements, bring: c.bring,
    technicalElements: [], itinerary: [], insurancePermits: [], highlights: c.highlights ?? [], season: '',
    group: `${c.people} ${c.people === 1 ? 'persona' : 'personas'}`, guideRatio: '',
    approachReturn: '', weatherPolicy: '', cancellationPolicy: '', videoUrl: c.videoUrl ?? '',
    imagePath: '', faqs: [], fromCatalog: false,
  };
  return buildOutingFaqs(s, { place: c.place, province: '' });
}
