export interface CragRequisitos {
  experienciaPrevia: boolean;
  edadMinima: number;
  condicionFisica: 'básica' | 'media' | 'alta';
  vertigo: boolean;
}

export interface Crag {
  id: string;
  nombre: string;
  tipo: string;
  provincia: 'Málaga' | 'Granada' | 'Córdoba' | 'Cádiz' | 'Sevilla' | 'Jaén';
  zona: string;
  nivel: string;
  gradoMinimo: string;
  gradoMaximo: string;
  numeroVias: number;
  tipoEscalada: ('deportiva' | 'clásica' | 'mixta')[];
  orientacion: 'Norte' | 'Sur' | 'Este' | 'Oeste' | 'Varias';
  altura: string;
  duracion: 'Media jornada' | 'Jornada completa' | 'Curso varios días';
  aproximacion: string;
  precio: string;
  descripcionCorta: string;
  descripcionLarga: string;
  caracteristicas: ('deportiva' | 'clásica' | 'adherencia' | 'desplomes' | 'tecnica' | 'polideportivo' | 'fisuras' | 'placas')[];
  imagen: string;
  imagenGrande: string;
  mejorEpoca: string;
  grupoMinimo: number;
  materialIncluido: boolean;
  acceso: 'fácil' | 'medio' | 'difícil';
  urlInfo: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  requisitos: CragRequisitos;
  incluye: string[];
  destacados: string[];
}

export const crags: Crag[] = [
  // MÁLAGA
  {
    id: 'chorro-frontales',
    nombre: 'El Chorro - Sector Frontales',
    tipo: 'Escuela de escalada',
    provincia: 'Málaga',
    zona: 'El Chorro',
    nivel: '5a - 8b',
    gradoMinimo: '5a',
    gradoMaximo: '8b',
    numeroVias: 150,
    tipoEscalada: ['deportiva'],
    orientacion: 'Sur',
    altura: '20-80m',
    duracion: 'Jornada completa',
    aproximacion: '10 min',
    precio: '49€',
    descripcionCorta: 'Una de las mejores escuelas de Europa con más de 150 vías equipadas en roca caliza de alta calidad.',
    descripcionLarga: 'El Chorro es un destino de clase mundial para escaladores de todos los niveles. El sector Frontales ofrece una gran variedad de vías desde el 5a hasta el 8b, en una roca caliza de excelente calidad. La orientación sur permite escalar todo el año, y la aproximación es cómoda. Ideal tanto para principiantes como para escaladores experimentados. El entorno junto al Caminito del Rey lo convierte en una experiencia única.',
    caracteristicas: ['deportiva', 'polideportivo', 'adherencia', 'desplomes'],
    imagen: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1920',
    mejorEpoca: 'Todo el año (mejor Oct - May)',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/el-chorro',
    coordenadas: { lat: 36.9167, lng: -4.7500 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: true
    },
    incluye: [
      'Guía profesional titulado en escalada deportiva',
      'Material técnico completo (cuerda, arnés, casco, grigri)',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico de la jornada',
      'Transporte desde punto de encuentro (opcional)'
    ],
    destacados: [
      'Más de 150 vías equipadas',
      'Roca caliza de alta calidad',
      'Apto para todos los niveles',
      'Escenario único junto al Caminito del Rey'
    ]
  },
  {
    id: 'chorro-escalera-arabe',
    nombre: 'El Chorro - Escalera Árabe',
    tipo: 'Escuela de escalada',
    provincia: 'Málaga',
    zona: 'El Chorro',
    nivel: '6a - 7c',
    gradoMinimo: '6a',
    gradoMaximo: '7c',
    numeroVias: 80,
    tipoEscalada: ['deportiva'],
    orientacion: 'Este',
    altura: '25-60m',
    duracion: 'Jornada completa',
    aproximacion: '15 min',
    precio: '55€',
    descripcionCorta: 'Sector técnico con vías de gran calidad y movimientos exigentes en roca perfecta.',
    descripcionLarga: 'La Escalera Árabe es uno de los sectores más emblemáticos de El Chorro. Con 80 vías que van desde el 6a hasta el 7c, ofrece escalada técnica de alta calidad. La roca es excepcional, con cantos y regletas que exigen una buena técnica de pies. Orientación este ideal para escalar por las mañanas evitando el calor del verano.',
    caracteristicas: ['deportiva', 'tecnica', 'adherencia', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/el-chorro/area/369336607',
    coordenadas: { lat: 36.9180, lng: -4.7520 },
    requisitos: {
      experienciaPrevia: true,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: true
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      '80 vías técnicas de alta calidad',
      'Roca perfecta para técnica de pies',
      'Sector emblemático de El Chorro',
      'Ideal para mejorar nivel'
    ]
  },
  {
    id: 'valle-abdalajis',
    nombre: 'Valle de Abdalajís',
    tipo: 'Escuela de escalada',
    provincia: 'Málaga',
    zona: 'Valle de Abdalajís',
    nivel: '5a - 7a',
    gradoMinimo: '5a',
    gradoMaximo: '7a',
    numeroVias: 45,
    tipoEscalada: ['deportiva', 'clásica'],
    orientacion: 'Varias',
    altura: '15-40m',
    duracion: 'Media jornada',
    aproximacion: '5 min',
    precio: '39€',
    descripcionCorta: 'Escuela ideal para iniciación con vías fáciles y acceso muy cómodo.',
    descripcionLarga: 'El Valle de Abdalajís es perfecto para quienes empiezan en la escalada. Con 45 vías de grados accesibles (5a-7a), ofrece un entorno tranquilo y familiar. La aproximación es muy corta y el ambiente relajado. Ideal para cursos de iniciación y primeras experiencias en roca natural.',
    caracteristicas: ['deportiva', 'polideportivo', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/area/12003629',
    coordenadas: { lat: 36.9333, lng: -4.6833 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 8,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Ideal para iniciación',
      'Aproximación muy corta',
      'Ambiente familiar',
      'Vías fáciles y bien equipadas'
    ]
  },
  {
    id: 'gaitanes',
    nombre: 'Desfiladero de los Gaitanes',
    tipo: 'Escuela de escalada',
    provincia: 'Málaga',
    zona: 'El Chorro',
    nivel: '6b - 8a',
    gradoMinimo: '6b',
    gradoMaximo: '8a',
    numeroVias: 60,
    tipoEscalada: ['deportiva'],
    orientacion: 'Norte',
    altura: '30-100m',
    duracion: 'Jornada completa',
    aproximacion: '20 min',
    precio: '65€',
    descripcionCorta: 'Escalada espectacular en las paredes del famoso Caminito del Rey.',
    descripcionLarga: 'El Desfiladero de los Gaitanes ofrece algunas de las vías más espectaculares de Andalucía. Con paredes que superan los 100 metros y vistas impresionantes, es un destino para escaladores con experiencia. La roca es caliza de altísima calidad y el entorno es simplemente sobrecogedor. Escalada atlética con desplomes y techos.',
    caracteristicas: ['deportiva', 'desplomes', 'tecnica'],
    imagen: 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=1920',
    mejorEpoca: 'Octubre - Abril',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/el-chorro/area/12003641',
    coordenadas: { lat: 36.9200, lng: -4.7600 },
    requisitos: {
      experienciaPrevia: true,
      edadMinima: 16,
      condicionFisica: 'alta',
      vertigo: true
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Paredes de más de 100 metros',
      'Entorno del Caminito del Rey',
      'Roca caliza excepcional',
      'Escalada atlética y espectacular'
    ]
  },
  {
    id: 'torcal-antequera',
    nombre: 'El Torcal de Antequera',
    tipo: 'Escuela de escalada',
    provincia: 'Málaga',
    zona: 'Antequera',
    nivel: '5b - 7b',
    gradoMinimo: '5b',
    gradoMaximo: '7b',
    numeroVias: 55,
    tipoEscalada: ['deportiva', 'clásica'],
    orientacion: 'Varias',
    altura: '10-35m',
    duracion: 'Media jornada',
    aproximacion: '10 min',
    precio: '45€',
    descripcionCorta: 'Escalada en un paisaje kárstico único, declarado Patrimonio de la Humanidad.',
    descripcionLarga: 'El Torcal ofrece una experiencia de escalada única en formaciones kársticas espectaculares. Con 55 vías repartidas en diferentes sectores, combina escalada deportiva y clásica en un entorno natural protegido. La roca presenta formas caprichosas que hacen cada vía diferente y especial.',
    caracteristicas: ['deportiva', 'clásica', 'polideportivo', 'adherencia'],
    imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/area/12003599',
    coordenadas: { lat: 36.9500, lng: -4.5333 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Paisaje kárstico único',
      'Patrimonio de la Humanidad',
      'Formaciones rocosas espectaculares',
      'Combinación deportiva y clásica'
    ]
  },
  // GRANADA
  {
    id: 'cahorros',
    nombre: 'Los Cahorros',
    tipo: 'Escuela de escalada',
    provincia: 'Granada',
    zona: 'Monachil',
    nivel: '5b - 7b',
    gradoMinimo: '5b',
    gradoMaximo: '7b',
    numeroVias: 70,
    tipoEscalada: ['deportiva'],
    orientacion: 'Sur',
    altura: '15-45m',
    duracion: 'Media jornada',
    aproximacion: '15 min',
    precio: '42€',
    descripcionCorta: 'Escuela clásica granadina con vías variadas y excelente ambiente.',
    descripcionLarga: 'Los Cahorros es uno de los destinos de escalada más populares de Granada. Con 70 vías de todos los niveles, ofrece escalada deportiva de calidad en un entorno espectacular junto al río Monachil. El puente colgante marca el inicio de esta zona de escalada llena de historia.',
    caracteristicas: ['deportiva', 'polideportivo', 'placas', 'adherencia'],
    imagen: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/los-cahorros',
    coordenadas: { lat: 37.1167, lng: -3.5333 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      '70 vías de todos los niveles',
      'Ambiente junto al río',
      'Famoso puente colgante',
      'Historia de la escalada granadina'
    ]
  },
  {
    id: 'sierra-huetor',
    nombre: 'Sierra de Huétor',
    tipo: 'Escuela de escalada',
    provincia: 'Granada',
    zona: 'Sierra de Huétor',
    nivel: '5a - 7c',
    gradoMinimo: '5a',
    gradoMaximo: '7c',
    numeroVias: 100,
    tipoEscalada: ['deportiva', 'clásica'],
    orientacion: 'Varias',
    altura: '20-50m',
    duracion: 'Jornada completa',
    aproximacion: '10 min',
    precio: '49€',
    descripcionCorta: 'Gran variedad de sectores con más de 100 vías en un parque natural.',
    descripcionLarga: 'La Sierra de Huétor ofrece múltiples sectores de escalada en el corazón de un parque natural. Con más de 100 vías que van desde el 5a hasta el 7c, hay opciones para todos los niveles. La combinación de escalada deportiva y clásica, junto con el entorno natural privilegiado, la convierte en un destino muy completo.',
    caracteristicas: ['deportiva', 'clásica', 'polideportivo', 'fisuras', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/sierra-de-huetor',
    coordenadas: { lat: 37.2500, lng: -3.5000 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Más de 100 vías',
      'Múltiples sectores',
      'Parque natural',
      'Deportiva y clásica'
    ]
  },
  {
    id: 'padul',
    nombre: 'El Padul',
    tipo: 'Escuela de escalada',
    provincia: 'Granada',
    zona: 'Padul',
    nivel: '6a - 7c+',
    gradoMinimo: '6a',
    gradoMaximo: '7c+',
    numeroVias: 85,
    tipoEscalada: ['deportiva'],
    orientacion: 'Sur',
    altura: '20-40m',
    duracion: 'Jornada completa',
    aproximacion: '10 min',
    precio: '52€',
    descripcionCorta: 'Escalada técnica de alto nivel en conglomerado único.',
    descripcionLarga: 'El Padul es conocido por su roca de conglomerado que ofrece una escalada única y muy técnica. Con 85 vías desde el 6a hasta el 7c+, es un destino para escaladores que buscan mejorar su técnica y enfrentarse a movimientos exigentes. La orientación sur permite escalar todo el año.',
    caracteristicas: ['deportiva', 'tecnica', 'adherencia', 'desplomes'],
    imagen: 'https://images.unsplash.com/photo-1508138221679-760a23a2285b?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1508138221679-760a23a2285b?w=1920',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/el-padul',
    coordenadas: { lat: 37.0167, lng: -3.6167 },
    requisitos: {
      experienciaPrevia: true,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: true
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      '85 vías técnicas',
      'Roca de conglomerado única',
      'Escalada exigente',
      'Orientación sur'
    ]
  },
  {
    id: 'alfacar',
    nombre: 'Alfacar',
    tipo: 'Escuela de escalada',
    provincia: 'Granada',
    zona: 'Alfacar',
    nivel: '5c - 7a',
    gradoMinimo: '5c',
    gradoMaximo: '7a',
    numeroVias: 40,
    tipoEscalada: ['deportiva'],
    orientacion: 'Este',
    altura: '15-30m',
    duracion: 'Media jornada',
    aproximacion: '5 min',
    precio: '38€',
    descripcionCorta: 'Escuela cercana a Granada con vías de grado medio.',
    descripcionLarga: 'Alfacar es una escuela perfecta para sesiones de media jornada. A solo 10 minutos de Granada capital, ofrece 40 vías de grado medio en un entorno tranquilo. Ideal para escaladores locales y visitantes que buscan una sesión rápida de escalada de calidad.',
    caracteristicas: ['deportiva', 'polideportivo', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=1920',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/alfacar',
    coordenadas: { lat: 37.2333, lng: -3.5667 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes'
    ],
    destacados: [
      'Muy cerca de Granada',
      'Acceso rápido',
      'Grados medios',
      'Sesiones de media jornada'
    ]
  },
  {
    id: 'loja',
    nombre: 'Loja - Infiernos',
    tipo: 'Escuela de escalada',
    provincia: 'Granada',
    zona: 'Loja',
    nivel: '6a - 8a',
    gradoMinimo: '6a',
    gradoMaximo: '8a',
    numeroVias: 65,
    tipoEscalada: ['deportiva'],
    orientacion: 'Norte',
    altura: '25-50m',
    duracion: 'Jornada completa',
    aproximacion: '15 min',
    precio: '55€',
    descripcionCorta: 'Sector atlético con vías desplomadas de gran intensidad.',
    descripcionLarga: 'Los Infiernos de Loja son famosos por su escalada atlética y desplomada. Con 65 vías que van desde el 6a hasta el 8a, es un destino para quienes buscan escalada física y de resistencia. La roca es caliza de excelente calidad con buenos agarres.',
    caracteristicas: ['deportiva', 'desplomes', 'tecnica'],
    imagen: 'https://images.unsplash.com/photo-1516592673884-4a382d1124c3?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1516592673884-4a382d1124c3?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/loja',
    coordenadas: { lat: 37.1667, lng: -4.1500 },
    requisitos: {
      experienciaPrevia: true,
      edadMinima: 14,
      condicionFisica: 'alta',
      vertigo: true
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Escalada atlética',
      'Vías desplomadas',
      'Roca de alta calidad',
      'Para escaladores fuertes'
    ]
  },
  // CÓRDOBA
  {
    id: 'los-vados',
    nombre: 'Los Vados',
    tipo: 'Escuela de escalada',
    provincia: 'Córdoba',
    zona: 'Priego de Córdoba',
    nivel: '5c - 7b',
    gradoMinimo: '5c',
    gradoMaximo: '7b',
    numeroVias: 50,
    tipoEscalada: ['deportiva'],
    orientacion: 'Sur',
    altura: '15-35m',
    duracion: 'Media jornada',
    aproximacion: '10 min',
    precio: '42€',
    descripcionCorta: 'La mejor escuela de escalada de la provincia de Córdoba.',
    descripcionLarga: 'Los Vados es el principal destino de escalada en Córdoba. Con 50 vías de grados variados, ofrece escalada deportiva de calidad en un entorno rural tranquilo. La roca caliza proporciona buenos agarres y las vías están bien equipadas. Ideal para escapadas desde Córdoba o Sevilla.',
    caracteristicas: ['deportiva', 'polideportivo', 'placas', 'adherencia'],
    imagen: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1920',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/los-vados',
    coordenadas: { lat: 37.4333, lng: -4.1833 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Mejor escuela de Córdoba',
      '50 vías variadas',
      'Buena equipación',
      'Entorno rural tranquilo'
    ]
  },
  {
    id: 'cabra',
    nombre: 'Sierra de Cabra',
    tipo: 'Escuela de escalada',
    provincia: 'Córdoba',
    zona: 'Cabra',
    nivel: '5a - 6c',
    gradoMinimo: '5a',
    gradoMaximo: '6c',
    numeroVias: 35,
    tipoEscalada: ['deportiva', 'clásica'],
    orientacion: 'Varias',
    altura: '10-25m',
    duracion: 'Media jornada',
    aproximacion: '10 min',
    precio: '38€',
    descripcionCorta: 'Escalada tranquila en el Geoparque de las Sierras Subbéticas.',
    descripcionLarga: 'La Sierra de Cabra ofrece escalada en un entorno natural protegido dentro del Geoparque de las Sierras Subbéticas. Con 35 vías de grados accesibles, es ideal para iniciación y escaladores de nivel medio. El paisaje kárstico y la tranquilidad del lugar hacen cada jornada especial.',
    caracteristicas: ['deportiva', 'clásica', 'polideportivo'],
    imagen: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/sierra-de-cabra',
    coordenadas: { lat: 37.4667, lng: -4.4333 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 8,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes'
    ],
    destacados: [
      'Geoparque natural',
      'Escalada tranquila',
      'Grados accesibles',
      'Paisaje kárstico'
    ]
  },
  // CÁDIZ
  {
    id: 'zaframagon',
    nombre: 'Peñón de Zaframagón',
    tipo: 'Escuela de escalada',
    provincia: 'Cádiz',
    zona: 'Olvera',
    nivel: '6a - 7c',
    gradoMinimo: '6a',
    gradoMaximo: '7c',
    numeroVias: 40,
    tipoEscalada: ['deportiva'],
    orientacion: 'Sur',
    altura: '30-80m',
    duracion: 'Jornada completa',
    aproximacion: '20 min',
    precio: '55€',
    descripcionCorta: 'Escalada espectacular en un peñón emblemático de la Ruta de los Pueblos Blancos.',
    descripcionLarga: 'El Peñón de Zaframagón es uno de los lugares más espectaculares para escalar en Cádiz. Con 40 vías que van desde el 6a hasta el 7c, ofrece escalada vertical y técnica en paredes de hasta 80 metros. El entorno es único, rodeado de buitres y con vistas a la campiña gaditana.',
    caracteristicas: ['deportiva', 'tecnica', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=1920',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/zaframagon',
    coordenadas: { lat: 36.9500, lng: -5.3333 },
    requisitos: {
      experienciaPrevia: true,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: true
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Peñón emblemático',
      'Paredes de 80 metros',
      'Colonia de buitres',
      'Ruta Pueblos Blancos'
    ]
  },
  {
    id: 'grazalema',
    nombre: 'Sierra de Grazalema',
    tipo: 'Escuela de escalada',
    provincia: 'Cádiz',
    zona: 'Grazalema',
    nivel: '5a - 7a',
    gradoMinimo: '5a',
    gradoMaximo: '7a',
    numeroVias: 55,
    tipoEscalada: ['deportiva', 'clásica'],
    orientacion: 'Varias',
    altura: '15-40m',
    duracion: 'Media jornada',
    aproximacion: '15 min',
    precio: '45€',
    descripcionCorta: 'Escalada en el corazón del Parque Natural Sierra de Grazalema.',
    descripcionLarga: 'La Sierra de Grazalema combina escalada de calidad con un entorno natural excepcional. Con 55 vías repartidas en varios sectores, ofrece opciones para todos los niveles. El parque natural más lluvioso de España presenta una vegetación exuberante y fauna variada.',
    caracteristicas: ['deportiva', 'clásica', 'polideportivo', 'fisuras'],
    imagen: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/grazalema',
    coordenadas: { lat: 36.7667, lng: -5.3667 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Parque Natural',
      'Entorno excepcional',
      '55 vías variadas',
      'Deportiva y clásica'
    ]
  },
  // SEVILLA
  {
    id: 'constantina',
    nombre: 'Constantina',
    tipo: 'Escuela de escalada',
    provincia: 'Sevilla',
    zona: 'Sierra Norte',
    nivel: '5b - 6c',
    gradoMinimo: '5b',
    gradoMaximo: '6c',
    numeroVias: 30,
    tipoEscalada: ['deportiva'],
    orientacion: 'Sur',
    altura: '10-25m',
    duracion: 'Media jornada',
    aproximacion: '5 min',
    precio: '35€',
    descripcionCorta: 'La única escuela de escalada de la provincia de Sevilla.',
    descripcionLarga: 'Constantina es el único destino de escalada deportiva en Sevilla. Con 30 vías de grados accesibles, ofrece una opción perfecta para escaladores sevillanos que no quieren desplazarse lejos. El entorno de la Sierra Norte proporciona un ambiente tranquilo y natural.',
    caracteristicas: ['deportiva', 'polideportivo', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/constantina',
    coordenadas: { lat: 37.8833, lng: -5.6167 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes'
    ],
    destacados: [
      'Única en Sevilla',
      'Sierra Norte',
      'Grados accesibles',
      'Cerca de Sevilla capital'
    ]
  },
  // JAÉN
  {
    id: 'despeñaperros',
    nombre: 'Despeñaperros',
    tipo: 'Escuela de escalada',
    provincia: 'Jaén',
    zona: 'Santa Elena',
    nivel: '5c - 7b',
    gradoMinimo: '5c',
    gradoMaximo: '7b',
    numeroVias: 60,
    tipoEscalada: ['deportiva'],
    orientacion: 'Varias',
    altura: '20-50m',
    duracion: 'Jornada completa',
    aproximacion: '15 min',
    precio: '48€',
    descripcionCorta: 'Escalada en el emblemático paso natural de Sierra Morena.',
    descripcionLarga: 'Despeñaperros ofrece escalada en un entorno histórico y natural único. Con 60 vías de calidad, es el principal destino de escalada de Jaén. Las paredes de cuarcita proporcionan una escalada diferente a la caliza andaluza, con agarres más pequeños y técnicos.',
    caracteristicas: ['deportiva', 'tecnica', 'adherencia', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/despeñaperros',
    coordenadas: { lat: 38.3833, lng: -3.5167 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 12,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Paso histórico',
      'Roca de cuarcita',
      '60 vías de calidad',
      'Principal destino de Jaén'
    ]
  },
  {
    id: 'cazorla',
    nombre: 'Sierra de Cazorla',
    tipo: 'Escuela de escalada',
    provincia: 'Jaén',
    zona: 'Cazorla',
    nivel: '5a - 7a',
    gradoMinimo: '5a',
    gradoMaximo: '7a',
    numeroVias: 45,
    tipoEscalada: ['deportiva', 'clásica'],
    orientacion: 'Sur',
    altura: '15-35m',
    duracion: 'Media jornada',
    aproximacion: '10 min',
    precio: '42€',
    descripcionCorta: 'Escalada en el mayor espacio protegido de España.',
    descripcionLarga: 'La Sierra de Cazorla combina escalada con naturaleza en el parque natural más grande de España. Con 45 vías de grados variados, ofrece opciones para todos. El entorno es espectacular, con posibilidad de avistar fauna como ciervos, cabras montesas y águilas.',
    caracteristicas: ['deportiva', 'clásica', 'polideportivo'],
    imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/cazorla',
    coordenadas: { lat: 37.9167, lng: -3.0000 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Mayor parque natural de España',
      'Fauna espectacular',
      '45 vías variadas',
      'Entorno único'
    ]
  },
  // Más escuelas adicionales
  {
    id: 'ardales',
    nombre: 'Ardales',
    tipo: 'Escuela de escalada',
    provincia: 'Málaga',
    zona: 'Ardales',
    nivel: '5a - 6c',
    gradoMinimo: '5a',
    gradoMaximo: '6c',
    numeroVias: 35,
    tipoEscalada: ['deportiva'],
    orientacion: 'Este',
    altura: '15-30m',
    duracion: 'Media jornada',
    aproximacion: '5 min',
    precio: '35€',
    descripcionCorta: 'Pequeña escuela ideal para iniciación cerca de El Chorro.',
    descripcionLarga: 'Ardales es una alternativa tranquila a El Chorro, perfecta para iniciación. Con 35 vías de grados fáciles, ofrece un ambiente relajado para primeras experiencias. Muy cerca del famoso Caminito del Rey, permite combinar escalada con turismo.',
    caracteristicas: ['deportiva', 'polideportivo', 'placas'],
    imagen: 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=1920',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://www.thecrag.com/es/climbing/spain/ardales',
    coordenadas: { lat: 36.8833, lng: -4.8333 },
    requisitos: {
      experienciaPrevia: false,
      edadMinima: 8,
      condicionFisica: 'básica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes'
    ],
    destacados: [
      'Ideal para iniciación',
      'Cerca de El Chorro',
      'Ambiente relajado',
      'Combina con Caminito del Rey'
    ]
  }
];

export type NivelEscalada = 'principiante' | 'iniciacion' | 'intermedio' | 'avanzado' | 'experto';
export type TipoEscalada = 'deportiva' | 'clásica' | 'mixta' | 'cualquiera';
export type DuracionEscalada = 'Media jornada' | 'Jornada completa' | 'Curso varios días';
export type ProvinciaEscalada = 'Málaga' | 'Granada' | 'Córdoba' | 'Cádiz' | 'Sevilla' | 'Jaén' | 'cualquiera';
