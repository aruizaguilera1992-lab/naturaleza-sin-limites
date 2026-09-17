import { barrancos, type Barranco } from '@/data/barrancos';
import { crags, type Crag } from '@/data/crags';
import { ferratas, type Ferrata } from '@/data/ferratas';
import { espeleologiaPublicada, type ActividadEspeleologia } from '@/data/espeleologia';
import { getActivityMedia } from '@/data/activityMedia';

export const PENDING = '[PENDIENTE DE CONFIRMAR]';

export type PublicActivityCategory = 'barranquismo' | 'escalada' | 'vias-ferratas' | 'espeleologia';

export interface ActivityProfile {
  id: string;
  slug: string;
  category: PublicActivityCategory;
  categoryLabel: string;
  name: string;
  type: string;
  province: string;
  zone: string;
  image: string;
  imageAlt: string;
  price: string;
  priceValue?: number;
  totalDuration: string;
  effectiveDuration: string;
  technicalLevel: string;
  physicalLevel: string;
  minimumAge: string;
  season: string;
  group: string;
  guideRatio: string;
  approachReturn: string;
  technicalElements: string[];
  previousExperience: string;
  included: string[];
  bring: string[];
  meetingPoint: string;
  insurancePermits: string[];
  weatherPolicy: string;
  cancellationPolicy: string;
  idealClient: string;
  differentiator: string;
  shortDescription: string;
  commercialDescription: string;
  highlights: string[];
  safetyRequirements: string[];
  itinerary: string[];
  faqs: { question: string; answer: string }[];
  localSeoSections: { heading: string; paragraphs: string[] }[];
  sourceUrl?: string;
  sourceLabel: string;
}

const parsePrice = (price: string) => {
  const match = price.match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const uniqueSix = (values: string[]) => [...new Set(values.filter(Boolean))].slice(0, 6);

function buildEditorial(profile: Omit<ActivityProfile, 'commercialDescription' | 'highlights' | 'safetyRequirements' | 'itinerary' | 'faqs' | 'localSeoSections'>): ActivityProfile {
  const experienceText = profile.previousExperience.startsWith('No')
    ? 'No exige experiencia previa según la información disponible, aunque el recorrido siempre se adapta al nivel real del grupo.'
    : `La experiencia previa indicada es: ${profile.previousExperience}.`;

  const commercialDescription = `${profile.name} propone una jornada de ${profile.categoryLabel.toLowerCase()} en ${profile.zone}, ${profile.province}, con una duración total estimada de ${profile.totalDuration}. El recorrido está catalogado con nivel técnico ${profile.technicalLevel} y demanda una condición física ${profile.physicalLevel.toLowerCase()}. ${experienceText} La propuesta se dirige especialmente a ${profile.idealClient.toLowerCase()} El itinerario, el horario y cualquier restricción se revisan antes de confirmar la salida, porque las condiciones del terreno y la normativa pueden cambiar. Consulta la disponibilidad para recibir una valoración adecuada del grupo, conocer el punto de encuentro definitivo y confirmar los servicios incluidos. No se garantiza la realización hasta comprobar condiciones, permisos y requisitos.`;

  const highlights = uniqueSix([
    `${profile.categoryLabel} en ${profile.zone}, ${profile.province}`,
    `Nivel técnico ${profile.technicalLevel}`,
    `Duración total estimada: ${profile.totalDuration}`,
    `Temporada indicada: ${profile.season}`,
    ...profile.technicalElements,
    profile.differentiator,
  ]);
  while (highlights.length < 6) highlights.push(PENDING);

  const safetyRequirements = [
    `Edad mínima: ${profile.minimumAge}`,
    `Nivel físico: ${profile.physicalLevel}`,
    `Experiencia previa: ${profile.previousExperience}`,
    `Ratio guía-participantes: ${profile.guideRatio}`,
    ...profile.insurancePermits,
    `La salida queda condicionada a la meteorología, el estado del recorrido y las restricciones vigentes.`,
  ];

  const itinerary = [
    `Confirmación de disponibilidad, nivel del grupo y requisitos de participación.`,
    `Envío del punto de encuentro y horario definitivos: ${profile.meetingPoint}`,
    `Recepción del grupo, comprobación del material y briefing técnico.`,
    `Aproximación al inicio del recorrido: ${profile.approachReturn}`,
    `Desarrollo de la actividad con progresión adaptada al grupo.`,
    `Finalización del recorrido, retorno y recogida del material.`,
    `Cierre de la actividad y recomendaciones posteriores del guía.`,
  ];

  const faqs = [
    { question: `¿Dónde se realiza ${profile.name}?`, answer: `La actividad se desarrolla en ${profile.zone}, ${profile.province}. El punto exacto de encuentro se facilita tras confirmar la reserva: ${profile.meetingPoint}.` },
    { question: '¿Cuánto dura la actividad?', answer: `La duración total estimada es ${profile.totalDuration}. La duración efectiva del recorrido figura como ${profile.effectiveDuration}; puede variar por el ritmo del grupo y las condiciones.` },
    { question: '¿Necesito experiencia previa?', answer: `${profile.previousExperience}. Antes de confirmar, se revisará la experiencia y condición física de cada participante.` },
    { question: '¿Qué edad mínima se exige?', answer: `La edad mínima indicada es ${profile.minimumAge}. La participación de menores también depende de talla, autonomía, condiciones del recorrido y autorización responsable.` },
    { question: '¿Qué material está incluido?', answer: profile.included.length ? profile.included.join('. ') : PENDING },
    { question: '¿Qué tengo que llevar?', answer: profile.bring.join('. ') },
    { question: '¿Qué ocurre si cambia el tiempo?', answer: profile.weatherPolicy },
    { question: '¿Puedo reservar una salida privada?', answer: `Sí, puedes solicitar una salida privada. Precio, ratio, disponibilidad y condiciones finales: ${PENDING}.` },
  ];

  const localSeoSections = [
    {
      heading: `${profile.categoryLabel} en ${profile.zone}: qué esperar`,
      paragraphs: [
        `${profile.name} se encuentra en ${profile.zone}, dentro de ${profile.province}, y forma parte de la oferta de turismo activo disponible en Andalucía. La ficha actual sitúa la duración total en ${profile.totalDuration}, con un nivel técnico ${profile.technicalLevel} y una exigencia física ${profile.physicalLevel.toLowerCase()}. Estos datos ayudan a comparar opciones, pero no sustituyen la valoración previa del guía ni la comprobación de las condiciones del día. En actividades de montaña, el agua, la temperatura, el viento, el estado del equipamiento y las restricciones de acceso pueden alterar el programa previsto.`,
        `El perfil recomendado es ${profile.idealClient.toLowerCase()} ${experienceText} Antes de reservar conviene comunicar la edad, experiencia, condición física y cualquier circunstancia médica relevante. El objetivo es elegir una actividad coherente con el grupo, no forzar un recorrido por haberlo seleccionado previamente. La edad mínima publicada es ${profile.minimumAge}, sujeta a comprobación individual cuando participen menores.`,
      ],
    },
    {
      heading: `Características del recorrido y preparación`,
      paragraphs: [
        `Entre los elementos técnicos identificados figuran ${profile.technicalElements.join(', ')}. La aproximación y el retorno se resumen así: ${profile.approachReturn}. La temporada indicada es ${profile.season}. Estos valores describen el recorrido de forma orientativa y deben contrastarse cerca de la fecha elegida. Si una autorización, regulación temporal o condición ambiental afecta al itinerario, la salida solo se confirmará cuando pueda realizarse conforme a la normativa aplicable.`,
        `El material incluido actualmente indicado es: ${profile.included.join(', ') || PENDING}. Por su parte, el material personal que debe aportar el cliente es: ${profile.bring.join(', ')}. No se deben comprar elementos técnicos específicos antes de recibir las instrucciones definitivas. La talla del equipo, el calzado y la ropa adecuada influyen directamente en la comodidad y en la progresión del grupo durante la actividad.`,
      ],
    },
    {
      heading: `Cómo reservar ${profile.name}`,
      paragraphs: [
        `Para solicitar plaza en un grupo abierto, indica la actividad, una fecha preferente, el número de participantes y la experiencia previa. El grupo publicado es ${profile.group} y el ratio guía-participantes está ${profile.guideRatio}. La solicitud no equivale a una confirmación automática: primero se revisan disponibilidad, perfil de participantes, meteorología, accesos y condiciones operativas. El punto de encuentro definitivo figura como ${profile.meetingPoint}.`,
        `También es posible consultar una salida privada para familia, amistades, clubes o equipos. Esta modalidad permite valorar el ritmo y los objetivos del grupo, pero sus condiciones comerciales deben confirmarse expresamente. La política meteorológica indicada es: ${profile.weatherPolicy} La política de cancelación es: ${profile.cancellationPolicy} Para decidir con rigor, utiliza los botones de reserva y solicita por escrito el precio final, servicios incluidos y condiciones aplicables a tu fecha.`,
      ],
    },
  ];

  return { ...profile, commercialDescription, highlights, safetyRequirements, itinerary, faqs, localSeoSections };
}

function fromBarranco(item: Barranco): ActivityProfile {
  const included = item.incluye.length ? item.incluye : [PENDING];
  const activityImage = getActivityMedia(item.id);
  return buildEditorial({
    id: `barranco-${item.id}`, slug: item.id, category: 'barranquismo', categoryLabel: 'Barranquismo',
    name: item.nombre, type: 'Descenso de barrancos', province: item.provincia, zone: item.poblacion,
    image: activityImage?.src ?? item.imagenGrande, imageAlt: activityImage?.alt ?? `Barranquismo en ${item.nombre}, ${item.poblacion}, ${item.provincia}`,
    price: item.precio || PENDING, priceValue: parsePrice(item.precio), totalDuration: item.duracion,
    effectiveDuration: PENDING, technicalLevel: `${item.clasificacionTecnica} (${item.nivel})`,
    physicalLevel: cap(item.requisitos.condicionFisica), minimumAge: `${item.requisitos.edadMinima} años`,
    season: item.mejorEpoca, group: `Mínimo ${item.grupoMinimo}; máximo ${PENDING}`, guideRatio: PENDING,
    approachReturn: item.acceso === 'facil' ? `Acceso fácil; tiempos exactos ${PENDING}` : `Acceso ${item.acceso}; tiempos exactos ${PENDING}`,
    technicalElements: [`${item.numRapeles} rápel(es)`, `rápel máximo ${item.rapelMaximo}`, `desnivel ${item.desnivel}`, `longitud ${item.longitud}`, ...item.caracteristicas],
    previousExperience: item.nivelExperiencia === 'principiante' ? 'No; sujeto a valoración previa' : `Sí o experiencia equivalente; nivel ${item.nivelExperiencia}`,
    included, bring: [PENDING], meetingPoint: PENDING,
    insurancePermits: [`Seguro y acreditación profesional: ${included.some((v) => /seguro/i.test(v)) ? 'incluido según catálogo; documentación concreta ' + PENDING : PENDING}`, `Permisos y regulación: ${item.regulacion || PENDING}`],
    weatherPolicy: PENDING, cancellationPolicy: PENDING,
    idealClient: item.nivelExperiencia === 'principiante' ? 'personas que buscan iniciarse con acompañamiento profesional.' : `personas con nivel ${item.nivelExperiencia} que buscan un descenso acorde a su experiencia.`,
    differentiator: `Recorrido con clasificación ${item.clasificacionTecnica} en ${item.poblacion}`,
    shortDescription: item.descripcionCorta, sourceUrl: item.urlInfo, sourceLabel: 'Infobarrancos (fuente técnica colaborativa)',
  });
}

function fromCrag(item: Crag): ActivityProfile {
  const activityImage = getActivityMedia(item.id);
  return buildEditorial({
    id: `crag-${item.id}`, slug: item.id, category: 'escalada', categoryLabel: 'Escalada', name: item.nombre,
    type: item.tipo, province: item.provincia, zone: item.zona, image: activityImage?.src ?? item.imagenGrande,
    imageAlt: activityImage?.alt ?? `Escalada en ${item.nombre}, ${item.zona}, ${item.provincia}`, price: item.precio || PENDING,
    priceValue: parsePrice(item.precio), totalDuration: item.duracion, effectiveDuration: PENDING,
    technicalLevel: `${item.gradoMinimo}–${item.gradoMaximo}`, physicalLevel: cap(item.requisitos.condicionFisica),
    minimumAge: `${item.requisitos.edadMinima} años`, season: item.mejorEpoca,
    group: `Mínimo ${item.grupoMinimo}; máximo ${PENDING}`, guideRatio: PENDING,
    approachReturn: `Aproximación ${item.aproximacion}; retorno ${PENDING}`,
    technicalElements: [`${item.numeroVias} vías en la escuela`, `altura ${item.altura}`, `orientación ${item.orientacion}`, ...item.tipoEscalada, ...item.caracteristicas],
    previousExperience: item.requisitos.experienciaPrevia ? 'Sí; nivel concreto sujeto a valoración' : 'No; sujeto a valoración previa',
    included: item.incluye.length ? item.incluye : [PENDING], bring: [PENDING], meetingPoint: PENDING,
    insurancePermits: [`Seguro, permisos y acreditaciones: ${PENDING}`], weatherPolicy: PENDING, cancellationPolicy: PENDING,
    idealClient: item.requisitos.experienciaPrevia ? 'escaladores con experiencia previa que desean progresar en roca.' : 'personas que quieren iniciarse o mejorar su técnica en roca.',
    differentiator: item.destacados[0] || `Escalada en ${item.zona}`,
    shortDescription: item.descripcionCorta, sourceUrl: item.urlInfo, sourceLabel: 'TheCrag (referencia técnica comunitaria)',
  });
}

function fromFerrata(item: Ferrata): ActivityProfile {
  const activityImage = getActivityMedia(item.id);
  return buildEditorial({
    id: item.id, slug: item.id, category: 'vias-ferratas', categoryLabel: 'Vía ferrata', name: item.nombre,
    type: item.tipo.replace(/-/g, ' '), province: item.provincia === 'cualquiera' ? 'Andalucía' : item.provincia,
    zone: item.zona, image: activityImage?.src ?? item.imagenGrande, imageAlt: activityImage?.alt ?? `Vía ferrata ${item.nombre} en ${item.zona}`,
    price: item.precio || PENDING, priceValue: parsePrice(item.precio), totalDuration: item.duracion,
    effectiveDuration: item.desarrollo || PENDING, technicalLevel: `${item.clasificacion} · ${item.dificultad}`,
    physicalLevel: cap(item.requisitos.condicionFisica), minimumAge: `${item.requisitos.edadMinima} años`, season: item.mejorEpoca,
    group: `${item.grupoMinimo}–${item.grupoMaximo} participantes`, guideRatio: PENDING,
    approachReturn: `Aproximación ${item.aproximacion}; retorno ${PENDING}`,
    technicalElements: [`desnivel ${item.desnivel}`, `altura máxima ${item.alturaMaxima}`, `exposición ${item.exposicion}`, `${item.elementosDestacados.puentes} puente(s)`, `${item.elementosDestacados.tirolinas} tirolina(s)`, ...item.caracteristicas],
    previousExperience: item.requisitos.experienciaPrevia ? 'Sí; nivel concreto sujeto a valoración' : 'No; sujeto a valoración previa',
    included: item.incluye.length ? item.incluye : [PENDING], bring: [PENDING], meetingPoint: PENDING,
    insurancePermits: [`Reserva o permiso: ${item.reservaObligatoria ? 'obligatorio; trámite concreto ' + PENDING : PENDING}`, `Seguro y acreditaciones: ${PENDING}`, ...(item.regulacion ? [`Regulación: ${item.regulacion}`] : [])],
    weatherPolicy: PENDING, cancellationPolicy: PENDING,
    idealClient: item.requisitos.experienciaPrevia ? 'personas con experiencia previa y tolerancia a la exposición.' : 'personas con condición física adecuada que quieren conocer la progresión por cable y peldaños.',
    differentiator: item.destacados[0] || `Itinerario ${item.clasificacion} en ${item.zona}`,
    shortDescription: item.descripcionCorta, sourceUrl: item.urlInfo, sourceLabel: 'RocJumper (referencia técnica)',
  });
}

function fromCave(item: ActividadEspeleologia): ActivityProfile {
  const activityImage = getActivityMedia(item.id);
  return buildEditorial({
    id: `espeleologia-${item.id}`, slug: item.id, category: 'espeleologia', categoryLabel: 'Espeleología', name: item.nombre,
    type: 'Actividad de espeleología', province: item.provincia, zone: item.zona, image: activityImage?.src ?? item.imagenGrande,
    imageAlt: activityImage?.alt ?? item.imagenAlt, price: item.precio, priceValue: item.precioDesde || undefined,
    totalDuration: item.duracion, effectiveDuration: PENDING, technicalLevel: item.nivel,
    physicalLevel: cap(item.requisitos.condicionFisica), minimumAge: `${item.requisitos.edadMinima} años`, season: item.mejorEpoca,
    group: `Mínimo ${item.grupoMinimo}; máximo ${PENDING}`, guideRatio: PENDING, approachReturn: item.acceso,
    technicalElements: item.caracteristicas, previousExperience: item.requisitos.experienciaPrevia ? 'Sí; condiciones concretas sujetas a valoración' : 'No; sujeto a valoración previa',
    included: item.incluye, bring: [PENDING], meetingPoint: PENDING,
    insurancePermits: [`Seguro, permisos y acreditaciones: ${PENDING}`], weatherPolicy: PENDING, cancellationPolicy: PENDING,
    idealClient: item.requisitos.experienciaPrevia ? 'personas con experiencia previa que buscan progresión subterránea.' : 'personas que desean una primera experiencia subterránea guiada.',
    differentiator: item.destacados[0] || 'Actividad adaptada al nivel del grupo', shortDescription: item.descripcionCorta,
    sourceLabel: 'Catálogo propio; cavidad y datos operativos por confirmar',
  });
}

export const activityProfiles: ActivityProfile[] = [
  ...barrancos.map(fromBarranco),
  ...crags.map(fromCrag),
  ...ferratas.map(fromFerrata),
  ...espeleologiaPublicada().map(fromCave),
];

export const getActivityProfile = (category?: string, slug?: string) =>
  activityProfiles.find((profile) => profile.category === category && profile.slug === slug);

export const getRelatedProfiles = (profile: ActivityProfile) =>
  activityProfiles
    .filter((item) => item.id !== profile.id && (item.category === profile.category || item.province === profile.province))
    .sort((a, b) => Number(b.zone === profile.zone) - Number(a.zone === profile.zone))
    .slice(0, 3);
