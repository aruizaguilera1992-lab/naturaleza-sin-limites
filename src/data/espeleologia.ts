import { media } from './media';

/**
 * Catálogo público de Espeleología.
 *
 * Fuente única para añadir, editar, ocultar u ordenar las actividades de
 * espeleología que se muestran en /actividades y en /espeleologia.
 *
 * Importante: los datos que todavía no están validados (cavidades concretas,
 * permisos, precios cerrados, ratios, grados de dificultad y fechas) se
 * mantienen como "Consultar disponibilidad" o "Próximamente". No añadas
 * información no confirmada.
 */

export interface ActividadEspeleologia {
  id: string;
  nombre: string;
  /** Orden de aparición; menor = primero */
  orden: number;
  /** Ponlo en false para ocultar la actividad sin borrarla */
  publicada: boolean;
  provincia: string;
  zona: string;
  nivel: string;
  nivelLabel: string;
  /** 1 = más sencillo, 5 = más exigente. Solo orienta el orden interno */
  nivelOrden: number;
  duracion: string;
  duracionHoras: number;
  precio: string;
  precioDesde: number;
  descripcionCorta: string;
  descripcionLarga: string;
  caracteristicas: string[];
  mejorEpoca: string;
  grupoMinimo: number;
  materialIncluido: boolean;
  acceso: string;
  incluye: string[];
  destacados: string[];
  requisitos: {
    edadMinima: number;
    condicionFisica: string;
    experienciaPrevia: boolean;
  };
  imagen: string;
  imagenGrande: string;
  imagenAlt: string;
}

const PENDIENTE = 'Consultar disponibilidad';

export const actividadesEspeleologia: ActividadEspeleologia[] = [
  {
    id: 'iniciacion',
    nombre: 'Espeleología de iniciación',
    orden: 1,
    publicada: true,
    provincia: 'Málaga y Andalucía',
    zona: 'Cavidad por confirmar',
    nivel: 'Iniciación',
    nivelLabel: 'Principiante',
    nivelOrden: 1,
    duracion: PENDIENTE,
    duracionHoras: 0,
    precio: PENDIENTE,
    precioDesde: 0,
    descripcionCorta:
      'Primera toma de contacto con el mundo subterráneo: desplazamiento por galerías, uso del frontal y técnica básica de progresión.',
    descripcionLarga:
      'Una salida guiada pensada para quien nunca ha entrado en una cavidad. Trabajamos la orientación bajo tierra, el desplazamiento seguro por galerías y gateras amplias, el uso correcto del casco y la iluminación, y los hábitos de mínimo impacto dentro de la cueva. El recorrido se elige el mismo día en función del grupo, el nivel y el estado de la cavidad.',
    caracteristicas: ['Apta para principiantes', 'Sin material propio', 'Grupo reducido', 'Ritmo adaptado'],
    mejorEpoca: 'Todo el año (la cueva mantiene temperatura estable)',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: PENDIENTE,
    incluye: [
      'Guía titulado',
      'Casco con iluminación frontal',
      'Mono o ropa técnica de cavidad',
      'Briefing técnico y de seguridad',
      'Seguro de accidentes y RC',
    ],
    destacados: [
      'Sin experiencia previa',
      'Aprendes técnica básica desde cero',
      'Enfoque en seguridad y conservación',
    ],
    requisitos: { edadMinima: 12, condicionFisica: 'Básica', experienciaPrevia: false },
    imagen: media.espeleologiaGrupo.src,
    imagenGrande: media.espeleologiaGrupo.src,
    imagenAlt: media.espeleologiaGrupo.alt,
  },
  {
    id: 'progresion-vertical',
    nombre: 'Progresión vertical en cavidad',
    orden: 2,
    publicada: true,
    provincia: 'Málaga y Andalucía',
    zona: 'Cavidad por confirmar',
    nivel: 'Progresión',
    nivelLabel: 'Intermedio',
    nivelOrden: 3,
    duracion: PENDIENTE,
    duracionHoras: 0,
    precio: PENDIENTE,
    precioDesde: 0,
    descripcionCorta:
      'Técnica de cuerda bajo tierra: descenso, ascenso, cambios de aparato y paso de fraccionamientos con acompañamiento técnico.',
    descripcionLarga:
      'Salida orientada a quien ya ha estado en cueva o viene del barranquismo y quiere manejarse con cuerda en vertical. Trabajamos el descensor y los bloqueadores, los cambios de aparato, el paso de fraccionamientos y nudos, y la gestión del grupo en pozos. La cavidad y los pozos se confirman según nivel del grupo, autorizaciones y condiciones.',
    caracteristicas: ['Técnica de cuerda', 'Pozos y fraccionamientos', 'Progresión vertical', 'Grupo reducido'],
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: PENDIENTE,
    incluye: [
      'Guía titulado',
      'Casco con iluminación frontal',
      'Arnés y equipo de progresión vertical',
      'Cuerdas y material colectivo',
      'Seguro de accidentes y RC',
    ],
    destacados: [
      'Aprendizaje de técnica vertical',
      'Ratio reducido por guía',
      'Buena continuación tras la iniciación',
    ],
    requisitos: { edadMinima: 16, condicionFisica: 'Media', experienciaPrevia: true },
    imagen: media.espeleologiaVertical.src,
    imagenGrande: media.espeleologiaVertical.src,
    imagenAlt: media.espeleologiaVertical.alt,
  },
  {
    id: 'exploracion',
    nombre: 'Salida de exploración',
    orden: 3,
    publicada: true,
    provincia: 'Málaga y Andalucía',
    zona: 'Cavidad por confirmar',
    nivel: 'Avanzado',
    nivelLabel: 'Avanzado',
    nivelOrden: 4,
    duracion: PENDIENTE,
    duracionHoras: 0,
    precio: PENDIENTE,
    precioDesde: 0,
    descripcionCorta:
      'Jornada larga de recorrido subterráneo para grupos con experiencia, con autonomía técnica y trabajo de equipo.',
    descripcionLarga:
      'Salida para personas con experiencia previa en cavidad que buscan un recorrido más largo y comprometido. Se planifica con el grupo: objetivos, material, tiempos, gestión del agua y del frío, y protocolo de seguridad. Requiere autorizaciones y condiciones favorables, por lo que la cavidad y la fecha se confirman caso por caso.',
    caracteristicas: ['Jornada larga', 'Requiere experiencia', 'Planificación a medida', 'Grupo reducido'],
    mejorEpoca: 'Próximamente',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: PENDIENTE,
    incluye: [
      'Guía titulado',
      'Planificación técnica previa con el grupo',
      'Material colectivo de progresión',
      'Seguro de accidentes y RC',
    ],
    destacados: [
      'Recorrido a medida del grupo',
      'Enfoque de exploración y autonomía',
      'Sujeta a permisos y condiciones',
    ],
    requisitos: { edadMinima: 18, condicionFisica: 'Alta', experienciaPrevia: true },
    imagen: media.espeleologiaHero.src,
    imagenGrande: media.espeleologiaHero.src,
    imagenAlt: media.espeleologiaHero.alt,
  },
];

export const espeleologiaPublicada = () =>
  actividadesEspeleologia.filter((a) => a.publicada).sort((a, b) => a.orden - b.orden);

/** Contenido editorial de la página /espeleologia */
export const espeleologiaContenido = {
  titulo: 'Espeleología en Málaga y Andalucía',
  subtitulo:
    'Explora el mundo subterráneo con seguridad, técnica y respeto por el medio natural.',
  introduccion:
    'La espeleología es la exploración guiada de cavidades y galerías subterráneas. En Naturaleza Sin Límites la planteamos como una actividad progresiva: adaptamos el recorrido, la técnica y el ritmo al nivel y la experiencia del grupo, desde una primera entrada sencilla hasta salidas con progresión vertical por cuerda.',
  queViviras: [
    'Entrar en un entorno que no se parece a nada de lo que se ve en superficie: silencio, temperatura estable y oscuridad total.',
    'Aprender a moverte bajo tierra: apoyos, equilibrio, gateras, destrepes y uso del frontal.',
    'Descubrir la geología viva de la caliza andaluza: coladas, formaciones y cursos de agua.',
    'Trabajar en equipo con ratios reducidos y acompañamiento técnico continuo.',
  ],
  nivelRequisitos: [
    'Hay opciones de iniciación sin experiencia previa y salidas técnicas para quien ya conoce la cuerda.',
    'Condición física básica: caminar, agacharse y mantener la actividad durante la salida.',
    'No es recomendable con claustrofobia severa, problemas cardiacos o lesiones recientes.',
    'Menores de edad siempre con autorización y acompañamiento del adulto responsable.',
  ],
  queIncluye: [
    'Guía titulado y ratio reducido.',
    'Casco con iluminación frontal e iluminación de repuesto.',
    'Mono o ropa técnica de cavidad y material colectivo.',
    'Arnés y equipo de progresión vertical en las salidas que lo requieran.',
    'Seguro de accidentes y responsabilidad civil.',
    'Briefing técnico previo y acompañamiento durante toda la actividad.',
  ],
  queTraer: [
    'Ropa cómoda que pueda mancharse y muda completa de recambio.',
    'Calzado de montaña con buena suela.',
    'Agua y algo de comida ligera.',
    'Guantes de trabajo y, si tienes, frontal propio.',
    'Toalla y bolsa para la ropa sucia.',
  ],
  seguridad: [
    'Nunca se entra en una cavidad sin planificación, material adecuado y personas formadas.',
    'Iluminación redundante: siempre se sale con más de una fuente de luz por persona.',
    'Se respetan los itinerarios balizados y las autorizaciones de acceso de cada cavidad.',
    'No se tocan formaciones, no se deja ningún residuo y no se altera la fauna cavernícola.',
    'La actividad puede aplazarse por crecidas, lluvias intensas o cualquier condición que reduzca el margen de seguridad.',
  ],
  faqs: [
    {
      pregunta: '¿Necesito experiencia previa?',
      respuesta:
        'No para la salida de iniciación: se diseña para quien entra por primera vez. Para la progresión vertical y la salida de exploración sí pedimos experiencia previa en cavidad o en técnica de cuerda.',
    },
    {
      pregunta: '¿Es peligroso o claustrofóbico?',
      respuesta:
        'La actividad se realiza con guía, material homologado y recorridos elegidos según el grupo. Aun así, si tienes claustrofobia importante coméntanoslo antes: adaptamos el itinerario o te orientamos hacia otra actividad.',
    },
    {
      pregunta: '¿Qué cuevas hacéis y cuánto cuesta?',
      respuesta:
        'Trabajamos siempre con cavidades autorizadas y las confirmamos al cerrar la salida, junto con la duración y el precio, porque dependen del grupo y de los permisos vigentes. Escríbenos y te pasamos la propuesta concreta.',
    },
    {
      pregunta: '¿Hay fechas fijas en el calendario?',
      respuesta:
        'Próximamente. De momento las salidas se organizan bajo petición, por grupos y según disponibilidad.',
    },
    {
      pregunta: '¿Puedo ir con niños o con un grupo grande?',
      respuesta:
        'Sí, con edad mínima según la salida. Para grupos grandes escríbenos y preparamos una propuesta a medida con los guías necesarios.',
    },
  ],
  creditosFoto:
    'Fotografías documentales con licencia; pendientes de sustituir por imágenes propias de nuestras salidas.',
};
