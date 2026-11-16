/**
 * Barrancos de Andalucía listados en el mapa de RocJumper (consulta: nov-2026).
 * Solo datos técnicos básicos + enlace a la fuente; sin textos ni fotos de RocJumper.
 * Uso exclusivo del panel admin: referencia documental, NO confirma acceso, permisos ni idoneidad comercial.
 */
export interface CanyonRef {
  slug: string;
  nombre: string;
  poblacion: string;
  provincia: 'Málaga' | 'Granada' | 'Almería' | 'Jaén' | 'Cádiz' | 'Córdoba' | 'Sevilla' | 'Huelva';
  grado: string;
  rapelMaximo: string;
  duracion: string;
  url: string;
}

const RJ = 'https://www.rocjumper.com/barranco/';
const r = (slug: string, nombre: string, poblacion: string, provincia: CanyonRef['provincia'], grado: string, rapelMaximo: string, duracion: string): CanyonRef =>
  ({ slug, nombre, poblacion, provincia, grado, rapelMaximo, duracion, url: `${RJ}${slug}/` });

export const andaluciaCanyonsRef: CanyonRef[] = [
  r('aguilera-tolox-yunquera', 'Barranco Aguilera', 'Tolox-Yunquera', 'Málaga', 'v3-a1-II', '33 m', '1 h'),
  r('arroyo-mijarra-pizarra', 'Barranco Arroyo de Mijarra', 'Pizarra', 'Málaga', 'v3-a1-II', '26 m', '2 h'),
  r('barranco-picapedreros-arroyo-pastelero', 'Barranco Picapedreros y Arroyo Pastelero', 'Montes de Málaga', 'Málaga', 'v4-a1-I / v2-a1-I', '35 m', '30 min + 30 min'),
  r('buho-santo-pizarra', 'Barranco del Búho o del Santo', 'Pizarra', 'Málaga', 'v3-a1-I', '15 m', '3 h'),
  r('buitre-inferior-cerrada-lezar-castril', 'Barranco del Buitre inferior o Cerrada de Lézar', 'Castril', 'Granada', 'v3-a2-III', '25 m', '2 h'),
  r('buitreras-colmenar', 'Cañón de las Buitreras (río Guadiaro)', 'El Colmenar', 'Málaga', 'v2-a4-IV', '13 m', '4 h'),
  r('castala-berja', 'Barranco de Castala', 'Berja', 'Almería', 'v4-a1-II', '21 m', '2 h'),
  r('castillejos-luna-pizarra', 'Barranco Castillejos de Luna', 'Pizarra', 'Málaga', 'v3-a1-II', '42 m', '2 h'),
  r('copon-tolox', 'Barranco del Copón (Arroyo Fuente de la Teja)', 'Tolox', 'Málaga', 'v3-a2-II', '22 m', '2,5 h'),
  r('espantaperros-salar', 'Barranco de Espantaperros', 'Salar', 'Granada', 'I (sin v/a indicado)', '20 m', '3 h'),
  r('jorox', 'Barranco de Jorox', 'Jorox', 'Málaga', 'v3-a2-II', '22 m', '1 h'),
  r('ligero-amoladoras-canales', 'Barranco Ligero o de las Amoladoras', 'Canales', 'Granada', 'v3-a1-II', '20 m', '3 h'),
  r('magdalena-castril', 'Barranco de la Magdalena', 'Castril', 'Granada', 'v3-a1-II', '28 m', '1 h'),
  r('monchalban-istan', 'Barranco de Monchalbán', 'Istán', 'Málaga', 'v3-a1-II', '30 m', '3 h'),
  r('peralejo-castril', 'Barranco del Peralejo', 'Castril', 'Granada', 'v4-a1-III', '45 m', '2 h'),
  r('pilon-inferior-miller', 'Barranco del Pilón inferior', 'Miller', 'Jaén', 'v4-a1-II', '38 m', '3 h'),
  r('puerto-ramos-antequera', 'Barranco Puerto Ramos', 'Antequera', 'Málaga', 'v3-a1-II', '26 m', '1 h'),
  r('raja-ancha-pizarra', 'Barranco Raja Ancha', 'Pizarra', 'Málaga', 'v3-a1-II', '16 m', '2,5 h'),
  r('raja-ferrata-chorro', 'Barranco Raja de la Ferrata del Chorro', 'El Chorro', 'Málaga', 'K3 y v5-a1-IV', '40 m', '2-3 h'),
  r('tajo-ronda-integral', 'Barranco Tajo de Ronda integral', 'Ronda', 'Málaga', 'v4-a2-II', '35 m', '2 h'),
  r('tunez-castril', 'Barranco de Túnez', 'Castril', 'Granada', 'v4-a1-III', '43 m', '3 h'),
];

/** Nivel orientativo a partir del grado vertical (v) y compromiso: v1-v2 → 1, v3 → 2, v4+ o compromiso III+ → 3. */
export function refLevelFromGrade(grado: string): 1 | 2 | 3 {
  const v = Number(grado.match(/v(\d)/i)?.[1] ?? 0);
  const commit = grado.match(/-(I{1,3}V?|IV|V|VI)\b/)?.[1] ?? '';
  if (v >= 4 || ['III', 'IV', 'V', 'VI'].includes(commit)) return 3;
  if (v === 3) return 2;
  if (v >= 1) return 1;
  return 2;
}
