/**
 * Selección comercial visible en /barranquismo (Málaga y Granada, iniciación e intermedio).
 * El nivel comercial es una decisión de producto y se muestra separado del grado técnico;
 * nunca se deduce solo de la cifra V. No modifica el dataset técnico `barrancos`.
 */
export type CatalogProvince = 'Málaga' | 'Granada';
export type CommercialLevel = 'iniciacion' | 'intermedio';

export interface CatalogSource {
  label: string;
  url: string;
}

export interface CanyonCatalogItem {
  id: string;
  nombre: string;
  tramo?: string;
  provincia: CatalogProvince;
  zona: string;
  nivelComercial: CommercialLevel;
  /** Grado técnico documentado, o null si no hay dato verificado para este tramo. */
  gradoTecnico: string | null;
  rapelMaximo: string | null;
  resumen: string;
  avisoAltura?: string;
  /** Precio existente de un producto idéntico; null => «Consultar». */
  precio: string | null;
  /** Id del producto existente idéntico (ficha y reserva ya existentes). */
  productoExistenteId?: string;
  pendienteValidacion: boolean;
  fuentes: CatalogSource[];
}

export const MAX_GROUP_SIZE = 6;

export const COMMERCIAL_LEVEL_LABEL: Record<CommercialLevel, string> = {
  iniciacion: 'Iniciación',
  intermedio: 'Intermedio',
};

const INFOBARRANCOS = 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:';
const CASTRIL =
  'https://www.juntadeandalucia.es/medioambiente/portal/web/ventanadelvisitante/detalle-actividad-espec-esp-nat/-/asset_publisher/3ocCazn1AeTs/content/barranquismo-en-el-parque-natural-sierra-de-castril/255035';

export const canyonCatalog: CanyonCatalogItem[] = [
  {
    id: 'guadalmina',
    nombre: 'Río Guadalmina',
    provincia: 'Málaga',
    zona: 'Benahavís',
    nivelComercial: 'iniciacion',
    gradoTecnico: 'V1 A3 I',
    rapelMaximo: '5 m',
    resumen: 'Iniciación acuática: tramos de agua y un único rápel corto.',
    precio: '35€',
    productoExistenteId: 'guadalmina',
    pendienteValidacion: false,
    fuentes: [{ label: 'Infobarrancos', url: `${INFOBARRANCOS}malaga:guadalmina` }],
  },
  {
    id: 'sima-diablo',
    nombre: 'Sima del Diablo',
    provincia: 'Málaga',
    zona: 'Júzcar',
    nivelComercial: 'iniciacion',
    gradoTecnico: 'V2 A1 I',
    rapelMaximo: '10 m',
    resumen: 'Iniciación con rápeles cortos en el Valle del Genal.',
    precio: '40€',
    productoExistenteId: 'sima-diablo',
    pendienteValidacion: false,
    fuentes: [{ label: 'Infobarrancos', url: `${INFOBARRANCOS}malaga:sima_diablo` }],
  },
  {
    id: 'zarzalones-inferior',
    nombre: 'Barranco de Zarzalones',
    tramo: 'Solo tramo inferior',
    provincia: 'Málaga',
    zona: 'Yunquera',
    nivelComercial: 'iniciacion',
    gradoTecnico: 'V3 A2 I (tramo inferior)',
    rapelMaximo: null,
    resumen: 'Solo la parte inferior, más acuática. No incluye el tramo superior técnico.',
    precio: null,
    pendienteValidacion: true,
    fuentes: [{ label: 'Infobarrancos', url: `${INFOBARRANCOS}malaga:zarzalones` }],
  },
  {
    id: 'jorox',
    nombre: 'Barranco de Jorox',
    provincia: 'Málaga',
    zona: 'Alozaina',
    nivelComercial: 'iniciacion',
    gradoTecnico: 'V3 A2 II',
    rapelMaximo: '22 m (máximo documentado)',
    resumen: 'Iniciación guiada con rápel, recorrido corto.',
    avisoAltura:
      'Iniciación no significa ausencia de altura: el recorrido incluye un rápel de hasta 22 m.',
    precio: '45€',
    productoExistenteId: 'jorox',
    pendienteValidacion: false,
    fuentes: [{ label: 'RocJumper', url: 'https://www.rocjumper.com/barranco/jorox/' }],
  },
  {
    id: 'puerto-ramos',
    nombre: 'Barranco de Puerto Ramos',
    provincia: 'Málaga',
    zona: 'Antequera',
    nivelComercial: 'iniciacion',
    gradoTecnico: 'V3 A1 II',
    rapelMaximo: '26 m (máximo documentado)',
    resumen: 'Iniciación vertical, con poca agua y protagonismo de los rápeles.',
    avisoAltura:
      'Iniciación no significa ausencia de altura: hay exposición vertical con un rápel de hasta 26 m.',
    precio: null,
    pendienteValidacion: true,
    fuentes: [
      { label: 'RocJumper', url: 'https://www.rocjumper.com/barranco/puerto-ramos-antequera/' },
    ],
  },
  {
    id: 'rio-verde-inferior',
    nombre: 'Río Verde',
    tramo: 'Solo tramo inferior',
    provincia: 'Granada',
    zona: 'Otívar',
    nivelComercial: 'iniciacion',
    gradoTecnico: null,
    rapelMaximo: null,
    resumen: 'Solo el tramo inferior del río, como iniciación acuática.',
    precio: null,
    pendienteValidacion: true,
    fuentes: [{ label: 'Infobarrancos', url: `${INFOBARRANCOS}granada:rio_verde` }],
  },
  {
    id: 'rio-lentegi',
    nombre: 'Río Lentegí',
    tramo: 'Clásico',
    provincia: 'Granada',
    zona: 'Lentegí',
    nivelComercial: 'intermedio',
    gradoTecnico: 'V2 A3 II',
    rapelMaximo: '12 m',
    resumen: 'Para personas activas: más duración y verticalidad que una iniciación.',
    precio: '45€',
    productoExistenteId: 'rio-lentegi',
    pendienteValidacion: false,
    fuentes: [
      { label: 'Infobarrancos', url: `${INFOBARRANCOS}granada:rio_lentegi` },
      { label: 'Explore Granada', url: 'https://exploregranada.es/actividades/rio-lentegi-3/' },
    ],
  },
  {
    id: 'buitre-inferior',
    nombre: 'Barranco del Buitre',
    tramo: 'Solo tramo inferior · Cerrada de Lézar',
    provincia: 'Granada',
    zona: 'Sierra de Castril',
    nivelComercial: 'intermedio',
    gradoTecnico: null,
    rapelMaximo: '25 m (rápeles finales de 23 y 25 m)',
    resumen: 'Tramo inferior por la Cerrada de Lézar, con rápeles finales largos.',
    precio: null,
    pendienteValidacion: true,
    fuentes: [{ label: 'Junta de Andalucía (divulgativa, no es permiso)', url: CASTRIL }],
  },
  {
    id: 'magdalena-final',
    nombre: 'Barranco de la Magdalena',
    tramo: 'Solo tramo final',
    provincia: 'Granada',
    zona: 'Sierra de Castril',
    nivelComercial: 'intermedio',
    gradoTecnico: null,
    rapelMaximo: '28 m (dos rápeles de 25 y 28 m)',
    resumen: 'Tramo final, intermedio por su verticalidad.',
    precio: null,
    pendienteValidacion: true,
    fuentes: [{ label: 'Junta de Andalucía (divulgativa, no es permiso)', url: CASTRIL }],
  },
];

export type ProvinceFilter = 'todas' | CatalogProvince;
export type LevelFilter = 'todos' | CommercialLevel;

export function filterCanyonCatalog(
  items: CanyonCatalogItem[],
  provincia: ProvinceFilter,
  nivel: LevelFilter,
): CanyonCatalogItem[] {
  return items.filter(
    (item) =>
      (provincia === 'todas' || item.provincia === provincia) &&
      (nivel === 'todos' || item.nivelComercial === nivel),
  );
}

/** Solo un producto idéntico ya existente conserva ficha y reserva; el resto va a consulta sin cobro. */
export function canyonCatalogLinks(item: CanyonCatalogItem) {
  if (item.productoExistenteId) {
    return {
      ficha: `/actividades/barranquismo/${item.productoExistenteId}`,
      reserva: `/reservar/barranquismo/${item.productoExistenteId}`,
    };
  }
  return { ficha: `/barranquismo#${item.id}`, reserva: null };
}
