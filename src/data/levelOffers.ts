/**
 * Oferta comercial por niveles de Barranquismo y Vías ferratas (mismo modelo que Espeleología).
 * Las rutas concretas se eligen con el grupo; las fichas individuales no se publican.
 * El precio «Desde» se calcula a partir de los productos existentes, nunca se inventa.
 */
import { ferratas } from './ferratas';
import { canyonCatalog } from './canyonCatalog';

export type LevelDiscipline = 'barranquismo' | 'ferratas';

export interface LevelOffer {
  id: string;
  discipline: LevelDiscipline;
  orden: 1 | 2 | 3;
  nivel: 'Iniciación' | 'Intermedio' | 'Avanzado';
  nombre: string;
  grado: string;
  descripcionCorta: string;
  caracteristicas: string[];
  incluye: string[];
  edadMinima: number;
  condicionFisica: string;
  experienciaPrevia: boolean;
  /** Precio por persona; null => «Precio a consultar». */
  precioDesde: number | null;
}

const minPrice = (values: string[]) => {
  const nums = values.map((v) => parseInt(v.match(/\d+/)?.[0] ?? '', 10)).filter((n) => n > 0);
  return nums.length ? Math.min(...nums) : null;
};

const INCLUYE = ['Guía titulado', 'Material técnico homologado', 'Seguro de accidentes y RC', 'Grupo de máximo 6 personas'];

export const levelOffers: LevelOffer[] = [
  {
    id: 'barranquismo-iniciacion', discipline: 'barranquismo', orden: 1, nivel: 'Iniciación',
    nombre: 'Barranquismo de iniciación', grado: 'Recorridos sencillos',
    descripcionCorta: 'Primer descenso de barranco: toboganes, saltos opcionales y rápeles cortos con el guía a tu lado.',
    caracteristicas: ['Sin experiencia previa', 'Rápeles cortos', 'Saltos opcionales', 'Ideal para empezar'],
    incluye: [...INCLUYE, 'Neopreno'], edadMinima: 10, condicionFisica: 'Básica', experienciaPrevia: false,
    precioDesde: minPrice(canyonCatalog.filter((c) => c.nivelComercial === 'iniciacion' && c.precio).map((c) => c.precio!)),
  },
  {
    id: 'barranquismo-intermedio', discipline: 'barranquismo', orden: 2, nivel: 'Intermedio',
    nombre: 'Barranquismo intermedio', grado: 'Mayor verticalidad',
    descripcionCorta: 'Para quien ya ha hecho algún barranco: rápeles más largos, más agua y más tiempo en el cauce.',
    caracteristicas: ['Rápeles más largos', 'Más tiempo en el agua', 'Técnica de cuerda', 'Grupo reducido'],
    incluye: [...INCLUYE, 'Neopreno'], edadMinima: 14, condicionFisica: 'Media', experienciaPrevia: true, precioDesde: null,
  },
  {
    id: 'barranquismo-avanzado', discipline: 'barranquismo', orden: 3, nivel: 'Avanzado',
    nombre: 'Barranquismo avanzado', grado: 'Recorridos técnicos',
    descripcionCorta: 'Jornadas exigentes con grandes cascadas y compromiso técnico, para grupos con experiencia.',
    caracteristicas: ['Requiere experiencia', 'Grandes rápeles', 'Jornada larga', 'Planificación a medida'],
    incluye: INCLUYE, edadMinima: 18, condicionFisica: 'Alta', experienciaPrevia: true, precioDesde: null,
  },
  {
    id: 'ferratas-iniciacion', discipline: 'ferratas', orden: 1, nivel: 'Iniciación',
    nombre: 'Vía ferrata de iniciación', grado: 'K1–K2',
    descripcionCorta: 'Tu primera ferrata: grapas continuas, poca exposición y el guía enseñándote cada paso.',
    caracteristicas: ['Sin experiencia previa', 'Baja exposición', 'Grapas continuas', 'Ideal para empezar'],
    incluye: INCLUYE, edadMinima: 10, condicionFisica: 'Básica', experienciaPrevia: false,
    precioDesde: minPrice(ferratas.filter((f) => f.clasificacion === 'K1' || f.clasificacion === 'K2').map((f) => f.precio)),
  },
  {
    id: 'ferratas-intermedio', discipline: 'ferratas', orden: 2, nivel: 'Intermedio',
    nombre: 'Vía ferrata intermedia', grado: 'K3–K4',
    descripcionCorta: 'Tramos verticales seguidos, puentes y más altura para quien ya ha probado una ferrata.',
    caracteristicas: ['Tramos verticales', 'Puentes', 'Más exposición', 'Grupo reducido'],
    incluye: INCLUYE, edadMinima: 14, condicionFisica: 'Media', experienciaPrevia: true, precioDesde: null,
  },
  {
    id: 'ferratas-avanzado', discipline: 'ferratas', orden: 3, nivel: 'Avanzado',
    nombre: 'Vía ferrata avanzada', grado: 'K5–K6',
    descripcionCorta: 'Pasos atléticos, desplomes y fuerte exposición. Exige brazos fuertes y experiencia previa.',
    caracteristicas: ['Requiere experiencia', 'Fuerte exposición', 'Pasos atléticos', 'Planificación a medida'],
    incluye: INCLUYE, edadMinima: 16, condicionFisica: 'Alta', experienciaPrevia: true, precioDesde: null,
  },
];

export const levelOffersFor = (d: LevelDiscipline) =>
  levelOffers.filter((o) => o.discipline === d).sort((a, b) => a.orden - b.orden);

export const levelOfferWhatsapp = (o: LevelOffer) =>
  `https://wa.me/34685609542?text=${encodeURIComponent(`Hola, me interesa «${o.nombre}». ¿Me podéis dar precio y disponibilidad?`)}`;

export const levelOfferHref = (o: LevelOffer) =>
  `/${o.discipline === 'ferratas' ? 'vias-ferratas' : 'barranquismo'}#${o.id}`;

export interface LevelOfferPhoto { src: string; alt: string; autor: string; licencia: string; fuente: string }

/** Fotos ilustrativas de uso libre (Wikimedia Commons). No muestran nuestros recorridos concretos. */
export const levelOfferPhotos: Record<string, LevelOfferPhoto> = {
  'barranquismo-iniciacion': { src: '/images/niveles/barranquismo-iniciacion.webp', alt: 'Cauce de un barranco con agua entre paredes de roca y vegetación', autor: 'Fredok64', licencia: 'CC0', fuente: 'https://commons.wikimedia.org/wiki/File:Canyon_du_Canceigt.jpg' },
  'barranquismo-intermedio': { src: '/images/niveles/barranquismo-intermedio.webp', alt: 'Barranquista descendiendo una cascada con cuerda', autor: 'Fabricio Cardenas', licencia: 'CC BY-SA 4.0', fuente: 'https://commons.wikimedia.org/wiki/File:Cascade_des_Baoussous_-_Canyoning.jpg' },
  'barranquismo-avanzado': { src: '/images/niveles/barranquismo-avanzado.webp', alt: 'Garganta estrecha y vertical con un rápel en cascada', autor: 'Haeferl', licencia: 'CC BY-SA 3.0', fuente: 'https://commons.wikimedia.org/wiki/File:Oetz_-_Canyoning_in_der_Auerklamm.jpg' },
  'ferratas-iniciacion': { src: '/images/niveles/ferratas-iniciacion.webp', alt: 'Tramo sencillo de vía ferrata con cable de vida junto a un sendero', autor: 'Ajznponar', licencia: 'CC0', fuente: 'https://commons.wikimedia.org/wiki/File:Ajdna,_via_ferrata_at_eastern_face_01.jpg' },
  'ferratas-intermedio': { src: '/images/niveles/ferratas-intermedio.webp', alt: 'Cable de vía ferrata sobre una ladera de roca caliza', autor: 'Ajznponar', licencia: 'CC0', fuente: 'https://commons.wikimedia.org/wiki/File:Begunjscica,_via_ferrata_on_north_slope.jpg' },
  'ferratas-avanzado': { src: '/images/niveles/ferratas-avanzado.webp', alt: 'Persona progresando por una vía ferrata vertical con escalera metálica', autor: 'theviktoriakiss (Pixabay)', licencia: 'CC0', fuente: 'https://commons.wikimedia.org/wiki/File:Via-ferrata-1375709.jpg' },
};
