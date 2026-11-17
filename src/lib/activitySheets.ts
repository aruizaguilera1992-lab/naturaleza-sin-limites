import { levelOffers, levelOfferExplanation, levelOfferPhotos } from '@/data/levelOffers';
import { espeleologiaPublicada } from '@/data/espeleologia';
import type { CatalogItem } from '@/lib/adminCatalog';

export const MAX_SHEET_PEOPLE = 6;

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
  includes: string[];
  bring: string[];
  requirements: string[];
  notes: string;
  rules?: string;
  steps?: string;
  minAge: number;
  fitness: string;
  experience: boolean;
  photo: string | null; // clave de levelOfferPhotos o «storage:<ruta>» para fotos propias del catálogo
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
  if (!Number.isInteger(c.people) || c.people < 1 || c.people > MAX_SHEET_PEOPLE) errors.push(`Personas entre 1 y ${MAX_SHEET_PEOPLE}`);
  if (c.pricePerPersonEuros !== null && (!(c.pricePerPersonEuros > 0) || c.pricePerPersonEuros > 5000)) errors.push('Precio no válido');
  return errors;
}

export const sheetTotalEuros = (c: Pick<SheetContent, 'people' | 'pricePerPersonEuros'>) =>
  c.pricePerPersonEuros === null ? null : Math.round(c.pricePerPersonEuros * c.people * 100) / 100;

export const sheetUrl = (origin: string, token: string) => `${origin.replace(/\/$/, '')}/ficha/${token}`;

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
    pricePerPersonEuros: item.pricePerPersonEuros, summary: item.summary, includes: [...item.includes], bring: [],
    requirements: [...item.requirements], notes: '', minAge: item.minAge, fitness: item.fitness, experience: item.experience,
    photo: item.photos[0] ? `${STORAGE_PHOTO}${item.photos[0]}` : null, customerName: '' };
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
