export interface DificultadTecnica {
  fisica: number;
  tecnica: number;
  psicologica: number;
  vertical: number;
}

export interface RequisitosCueva {
  cursoIniciacion: boolean;
  experienciaPrevia: boolean;
  edadMinima: number;
  condicionFisica: 'básica' | 'media' | 'alta';
  claustrofobia: boolean;
}

export interface Cueva {
  id: string;
  nombre: string;
  tipo: 'cueva-horizontal' | 'sima-vertical' | 'cavidad-mixta';
  requiereCurso: boolean;
  provincia: string;
  zona: string;
  nivel: string;
  nivelTecnico: 'I' | 'II' | 'III' | 'IV' | 'V';
  desarrollo: string;
  desnivel: string;
  verticalMaxima: string;
  duracion: string;
  aproximacion: string;
  precio: string;
  descripcionCorta: string;
  descripcionLarga: string;
  caracteristicas: string[];
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
  requisitos: RequisitosCueva;
  incluye: string[];
  destacados: string[];
  dificultadTecnica: DificultadTecnica;
  estado: 'seca' | 'húmeda' | 'acuática';
}

export interface CursoIniciacion {
  id: string;
  tipo: 'curso';
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  duracion: string;
  horario: string;
  precio: string;
  grupoMinimo: number;
  grupoMaximo: number;
  certificado: boolean;
  contenido: string[];
  incluye: string[];
  requisitos: {
    edadMinima: number;
    condicionFisica: 'básica' | 'media' | 'alta';
    experienciaPrevia: boolean;
  };
}

export const cursoIniciacion: CursoIniciacion = {
  id: 'curso-iniciacion-espeleologia',
  tipo: 'curso',
  nombre: 'Curso de Iniciación a la Espeleología',
  descripcionCorta: 'Formación obligatoria para acceder a simas verticales',
  descripcionLarga: 'Curso intensivo de fin de semana donde aprenderás todas las técnicas básicas de espeleología y progresión vertical. Incluye teoría sobre formación de cuevas, equipamiento, seguridad, técnicas de progresión en vertical con simple y doble cuerda, uso de bloqueadores, descendedores, y práctica en cueva escuela.',
  duracion: '2 días (16 horas)',
  horario: 'Sábado y Domingo 9:00-18:00',
  precio: '120€',
  grupoMinimo: 4,
  grupoMaximo: 6,
  certificado: true,
  contenido: [
    'Introducción a la espeleología y geología',
    'Material técnico: conocimiento y mantenimiento',
    'Nudos básicos de espeleología',
    'Técnicas de progresión en horizontal',
    'Técnicas de progresión en vertical (ascenso y descenso)',
    'Instalación y uso de bloqueadores y descendedores',
    'Seguridad y rescate básico',
    'Práctica en cueva escuela',
    'Primeros auxilios en medio subterráneo'
  ],
  incluye: [
    'Manual del alumno',
    'Material técnico completo durante el curso',
    'Seguro de accidentes',
    'Certificado de asistencia',
    'Acceso a comunidad de espeleólogos'
  ],
  requisitos: {
    edadMinima: 16,
    condicionFisica: 'media',
    experienciaPrevia: false
  }
};

export const cuevas: Cueva[] = [
  // MÁLAGA - CUEVAS HORIZONTALES
  {
    id: 'cueva-nerja-galerias',
    nombre: 'Cueva de Nerja (Galerías Altas)',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Málaga',
    zona: 'Nerja',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '450m',
    desnivel: '85m',
    verticalMaxima: '0m',
    duracion: '3-4 horas',
    aproximacion: '15 min',
    precio: '45€',
    descripcionCorta: 'Impresionantes galerías con formaciones espectaculares',
    descripcionLarga: 'Las Galerías Altas de Nerja ofrecen un recorrido fascinante por formaciones geológicas únicas. Con un desarrollo moderado y sin necesidad de técnicas verticales, es perfecta para iniciarse en la espeleología. Destacan sus estalactitas, estalagmitas y columnas de gran belleza. La visita transcurre por galerías amplias con techos altos.',
    caracteristicas: ['horizontal', 'formaciones', 'amplia', 'seca'],
    imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.7589, lng: -3.8408 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 12,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo (casco con luz, mono)',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico',
      'Transporte desde punto de encuentro'
    ],
    destacados: [
      'Galerías amplias y cómodas',
      'Formaciones geológicas únicas',
      'Apta para iniciación',
      'Sin necesidad de técnicas verticales'
    ],
    dificultadTecnica: { fisica: 2, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'seca'
  },
  {
    id: 'cueva-ardales',
    nombre: 'Cueva de Ardales',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Málaga',
    zona: 'Ardales',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '1500m',
    desnivel: '40m',
    verticalMaxima: '0m',
    duracion: '4-5 horas',
    aproximacion: '10 min',
    precio: '55€',
    descripcionCorta: 'Cueva prehistórica con arte rupestre de 20.000 años',
    descripcionLarga: 'La Cueva de Ardales alberga uno de los conjuntos de arte rupestre más importantes de Andalucía, con pinturas datadas en más de 20.000 años. El recorrido espeleológico atraviesa galerías amplias con impresionantes formaciones calcáreas y testimonios del pasado prehistórico de la humanidad.',
    caracteristicas: ['horizontal', 'arte-rupestre', 'formaciones', 'histórica'],
    imagen: 'https://images.unsplash.com/photo-1504699439244-a4e8fd9f3a08?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1504699439244-a4e8fd9f3a08?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.8747, lng: -4.8394 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Arte rupestre de 20.000 años',
      'Galerías amplias',
      'Valor histórico único',
      'Apta para familias'
    ],
    dificultadTecnica: { fisica: 2, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'seca'
  },
  {
    id: 'cueva-hundidero',
    nombre: 'Cueva del Hundidero-Gato',
    tipo: 'cavidad-mixta',
    requiereCurso: true,
    provincia: 'Málaga',
    zona: 'Benaoján',
    nivel: 'Intermedio',
    nivelTecnico: 'II',
    desarrollo: '4800m',
    desnivel: '185m',
    verticalMaxima: '25m',
    duracion: '6-8 horas',
    aproximacion: '20 min',
    precio: '75€',
    descripcionCorta: 'Travesía espectacular entre dos bocas con río subterráneo',
    descripcionLarga: 'El sistema Hundidero-Gato es una de las travesías más emblemáticas de Andalucía. Conecta dos impresionantes bocas a través de casi 5 km de galerías con un río subterráneo. Incluye zonas de natación, pasos estrechos y pequeños resaltes verticales. Una experiencia completa de espeleología.',
    caracteristicas: ['mixta', 'travesía', 'río-subterráneo', 'natación'],
    imagen: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200',
    mejorEpoca: 'Abril - Octubre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.7267, lng: -5.2547 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: true,
      edadMinima: 16,
      condicionFisica: 'alta',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo con neopreno',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico',
      'Transporte entre bocas'
    ],
    destacados: [
      'Travesía de casi 5 km',
      'Río subterráneo',
      'Bocas espectaculares',
      'Experiencia completa'
    ],
    dificultadTecnica: { fisica: 4, tecnica: 3, psicologica: 3, vertical: 2 },
    estado: 'acuática'
  },
  // MÁLAGA - SIMAS VERTICALES
  {
    id: 'sima-gesm',
    nombre: 'Sima GESM (Torca del Carlista)',
    tipo: 'sima-vertical',
    requiereCurso: true,
    provincia: 'Málaga',
    zona: 'Teba - Sierra de Peñarrubia',
    nivel: 'Avanzado',
    nivelTecnico: 'III',
    desarrollo: '1200m',
    desnivel: '-255m',
    verticalMaxima: '80m',
    duracion: '6-8 horas',
    aproximacion: '30 min',
    precio: '85€',
    descripcionCorta: 'Impresionante sima vertical de gran desarrollo',
    descripcionLarga: 'La Sima GESM es una de las cavidades verticales más espectaculares de Málaga. Con un pozo de entrada de 80m, requiere dominio de técnicas de progresión vertical. El sistema continúa con galerías horizontales y pozos menores hasta alcanzar los -255m. Solo para espeleólogos con curso de iniciación y experiencia en vertical.',
    caracteristicas: ['vertical', 'pozo-profundo', 'técnico', 'húmeda'],
    imagen: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.9833, lng: -4.8833 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: true,
      edadMinima: 18,
      condicionFisica: 'alta',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo de vertical',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Pozo de entrada de 80m',
      'Profundidad de -255m',
      'Formaciones únicas',
      'Experiencia extrema'
    ],
    dificultadTecnica: { fisica: 4, tecnica: 4, psicologica: 4, vertical: 5 },
    estado: 'húmeda'
  },
  {
    id: 'sima-raja',
    nombre: 'Sima Raja',
    tipo: 'sima-vertical',
    requiereCurso: true,
    provincia: 'Málaga',
    zona: 'El Torcal',
    nivel: 'Intermedio',
    nivelTecnico: 'II',
    desarrollo: '280m',
    desnivel: '-105m',
    verticalMaxima: '45m',
    duracion: '4-5 horas',
    aproximacion: '25 min',
    precio: '65€',
    descripcionCorta: 'Sima vertical clásica en el corazón del Torcal',
    descripcionLarga: 'Situada en el impresionante paisaje kárstico del Torcal de Antequera, la Sima Raja ofrece una experiencia vertical de nivel intermedio. Con un pozo principal de 45m y desarrollo moderado, es ideal para quienes quieren progresar en técnicas verticales tras el curso de iniciación.',
    caracteristicas: ['vertical', 'torcal', 'kárstico', 'formaciones'],
    imagen: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.9667, lng: -4.5333 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: false,
      edadMinima: 16,
      condicionFisica: 'media',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Paisaje único del Torcal',
      'Ideal para progresar',
      'Pozo principal de 45m',
      'Ambiente kárstico espectacular'
    ],
    dificultadTecnica: { fisica: 3, tecnica: 3, psicologica: 3, vertical: 3 },
    estado: 'seca'
  },
  // GRANADA
  {
    id: 'cueva-agua-iznalloz',
    nombre: 'Cueva del Agua de Iznalloz',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Granada',
    zona: 'Iznalloz',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '350m',
    desnivel: '25m',
    verticalMaxima: '0m',
    duracion: '3 horas',
    aproximacion: '10 min',
    precio: '40€',
    descripcionCorta: 'Cueva con formaciones de calcita y pequeño lago interior',
    descripcionLarga: 'La Cueva del Agua de Iznalloz destaca por sus espectaculares formaciones de calcita y un pequeño lago interior que da nombre a la cavidad. Recorrido horizontal sin dificultades técnicas, ideal para iniciarse en la espeleología en la provincia de Granada.',
    caracteristicas: ['horizontal', 'formaciones', 'lago', 'calcita'],
    imagen: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.4167, lng: -3.5333 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Formaciones de calcita únicas',
      'Lago interior',
      'Apta para iniciación',
      'Fácil acceso'
    ],
    dificultadTecnica: { fisica: 1, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'húmeda'
  },
  {
    id: 'cueva-murcielagos-zuheros',
    nombre: 'Cueva de los Murciélagos',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Granada',
    zona: 'Sierra de Huétor',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '2130m',
    desnivel: '90m',
    verticalMaxima: '0m',
    duracion: '4-5 horas',
    aproximacion: '15 min',
    precio: '50€',
    descripcionCorta: 'Gran cueva horizontal con importantes formaciones',
    descripcionLarga: 'La Cueva de los Murciélagos en la Sierra de Huétor es una de las mayores cavidades horizontales de Granada. Con más de 2 km de desarrollo, ofrece un recorrido variado con salas amplias y formaciones calcáreas de gran belleza. Ideal para una jornada completa de espeleología sin técnicas verticales.',
    caracteristicas: ['horizontal', 'amplia', 'formaciones', 'larga'],
    imagen: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.3167, lng: -3.5500 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 12,
      condicionFisica: 'media',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Más de 2 km de recorrido',
      'Salas amplias',
      'Sin técnicas verticales',
      'Formaciones espectaculares'
    ],
    dificultadTecnica: { fisica: 2, tecnica: 1, psicologica: 2, vertical: 0 },
    estado: 'seca'
  },
  {
    id: 'sima-cabra',
    nombre: 'Sima de la Cabra',
    tipo: 'sima-vertical',
    requiereCurso: true,
    provincia: 'Granada',
    zona: 'Sierra Harana',
    nivel: 'Avanzado',
    nivelTecnico: 'IV',
    desarrollo: '800m',
    desnivel: '-185m',
    verticalMaxima: '65m',
    duracion: '5-6 horas',
    aproximacion: '40 min',
    precio: '80€',
    descripcionCorta: 'Sima profunda con impresionantes pozos verticales',
    descripcionLarga: 'La Sima de la Cabra es una de las cavidades verticales más técnicas de Granada. Con varios pozos que superan los 50m y una profundidad total de -185m, requiere experiencia en técnicas de progresión vertical. Formaciones de gran belleza en las zonas más profundas.',
    caracteristicas: ['vertical', 'profunda', 'técnica', 'formaciones'],
    imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'difícil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.3500, lng: -3.4667 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: true,
      edadMinima: 18,
      condicionFisica: 'alta',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo de vertical',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Pozos de más de 50m',
      '-185m de profundidad',
      'Alta dificultad técnica',
      'Formaciones profundas únicas'
    ],
    dificultadTecnica: { fisica: 4, tecnica: 5, psicologica: 4, vertical: 5 },
    estado: 'húmeda'
  },
  // ALMERÍA - KARST DE SORBAS
  {
    id: 'cueva-tesoro-sorbas',
    nombre: 'Cueva del Tesoro',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Almería',
    zona: 'Karst de Sorbas',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '600m',
    desnivel: '30m',
    verticalMaxima: '0m',
    duracion: '2-3 horas',
    aproximacion: '5 min',
    precio: '35€',
    descripcionCorta: 'Ruta de iniciación en el espectacular Karst de Sorbas',
    descripcionLarga: 'El Karst de Sorbas es uno de los paisajes geológicos más singulares de Europa, formado en yesos. La Cueva del Tesoro ofrece una ruta de iniciación perfecta para conocer este ecosistema único, con galerías amplias y cristalizaciones de yeso espectaculares.',
    caracteristicas: ['horizontal', 'karst-yesos', 'cristales', 'amplia'],
    imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.0917, lng: -2.0917 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 8,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Karst de yesos único en Europa',
      'Cristalizaciones espectaculares',
      'Apta para familias',
      'Ruta de iniciación'
    ],
    dificultadTecnica: { fisica: 1, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'seca'
  },
  {
    id: 'cueva-covadura-sorbas',
    nombre: 'Cueva de Covadura',
    tipo: 'cavidad-mixta',
    requiereCurso: true,
    provincia: 'Almería',
    zona: 'Karst de Sorbas',
    nivel: 'Intermedio',
    nivelTecnico: 'II',
    desarrollo: '1800m',
    desnivel: '60m',
    verticalMaxima: '15m',
    duracion: '4-5 horas',
    aproximacion: '15 min',
    precio: '55€',
    descripcionCorta: 'Travesía técnica en el sistema kárstico de Sorbas',
    descripcionLarga: 'Covadura es una de las cavidades más técnicas del Karst de Sorbas. La travesía incluye galerías horizontales espectaculares con cristalizaciones de yeso gigantes, además de pequeños resaltes verticales que requieren conocimientos básicos de cuerda. Una experiencia completa en un entorno geológico único.',
    caracteristicas: ['mixta', 'travesía', 'cristales-gigantes', 'yesos'],
    imagen: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.0833, lng: -2.1000 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: false,
      edadMinima: 14,
      condicionFisica: 'media',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Cristales de yeso gigantes',
      '1.8 km de desarrollo',
      'Formaciones únicas',
      'Experiencia completa'
    ],
    dificultadTecnica: { fisica: 3, tecnica: 2, psicologica: 2, vertical: 2 },
    estado: 'seca'
  },
  // CÓRDOBA
  {
    id: 'cueva-murcielagos-zuheros-cordoba',
    nombre: 'Cueva de los Murciélagos de Zuheros',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Córdoba',
    zona: 'Zuheros',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '1000m',
    desnivel: '45m',
    verticalMaxima: '0m',
    duracion: '3-4 horas',
    aproximacion: '10 min',
    precio: '40€',
    descripcionCorta: 'Cueva con pinturas rupestres del Neolítico',
    descripcionLarga: 'La Cueva de los Murciélagos de Zuheros es Monumento Natural y alberga importantes pinturas rupestres del Neolítico. El recorrido espeleológico atraviesa galerías con formaciones calcáreas y testimonios de ocupación humana de hace más de 6.000 años.',
    caracteristicas: ['horizontal', 'arte-rupestre', 'neolítico', 'formaciones'],
    imagen: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.5333, lng: -4.3167 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Pinturas rupestres del Neolítico',
      'Monumento Natural',
      'Valor histórico único',
      'Apta para familias'
    ],
    dificultadTecnica: { fisica: 2, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'seca'
  },
  {
    id: 'sima-cabra-cordoba',
    nombre: 'Sima de Cabra',
    tipo: 'sima-vertical',
    requiereCurso: true,
    provincia: 'Córdoba',
    zona: 'Sierra de Cabra',
    nivel: 'Intermedio',
    nivelTecnico: 'II',
    desarrollo: '450m',
    desnivel: '-120m',
    verticalMaxima: '55m',
    duracion: '4-5 horas',
    aproximacion: '20 min',
    precio: '70€',
    descripcionCorta: 'Sima clásica de la Sierra de Cabra con pozo de entrada',
    descripcionLarga: 'La Sima de Cabra es una cavidad clásica de la espeleología cordobesa. Con un pozo de entrada de 55m y desarrollo moderado, es ideal para quienes quieren progresar en técnicas verticales. Las formaciones en su interior son espectaculares.',
    caracteristicas: ['vertical', 'clásica', 'pozo-entrada', 'formaciones'],
    imagen: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'medio',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.4833, lng: -4.3667 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: false,
      edadMinima: 16,
      condicionFisica: 'media',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo de vertical',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Pozo de entrada de 55m',
      'Cavidad clásica',
      'Ideal para progresar',
      'Formaciones espectaculares'
    ],
    dificultadTecnica: { fisica: 3, tecnica: 3, psicologica: 3, vertical: 4 },
    estado: 'seca'
  },
  // CÁDIZ
  {
    id: 'cueva-gato',
    nombre: 'Cueva del Gato (Boca Sur)',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Cádiz',
    zona: 'Benaoján',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '800m',
    desnivel: '15m',
    verticalMaxima: '0m',
    duracion: '3-4 horas',
    aproximacion: '10 min',
    precio: '45€',
    descripcionCorta: 'Espectacular entrada con surgencia y piscinas naturales',
    descripcionLarga: 'La Cueva del Gato es famosa por su impresionante boca de entrada con una surgencia de agua cristalina. El recorrido desde la boca sur permite explorar galerías amplias y refrescarse en las piscinas naturales. Una de las cuevas más icónicas de Andalucía.',
    caracteristicas: ['horizontal', 'surgencia', 'piscinas', 'icónica'],
    imagen: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200',
    mejorEpoca: 'Verano',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.7250, lng: -5.2417 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 12,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Boca de entrada icónica',
      'Piscinas naturales',
      'Agua cristalina',
      'Perfecta para verano'
    ],
    dificultadTecnica: { fisica: 2, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'acuática'
  },
  {
    id: 'cueva-pileta',
    nombre: 'Cueva de la Pileta',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Cádiz',
    zona: 'Benaoján',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '2000m',
    desnivel: '70m',
    verticalMaxima: '0m',
    duracion: '4-5 horas',
    aproximacion: '15 min',
    precio: '50€',
    descripcionCorta: 'Arte rupestre paleolítico de 25.000 años de antigüedad',
    descripcionLarga: 'La Cueva de la Pileta alberga uno de los conjuntos de arte rupestre paleolítico más importantes de la Península Ibérica. Pinturas de caballos, cabras, peces y símbolos abstractos de hace 25.000 años. El recorrido espeleológico de 2 km incluye formaciones geológicas espectaculares.',
    caracteristicas: ['horizontal', 'arte-paleolítico', 'formaciones', 'histórica'],
    imagen: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 36.6917, lng: -5.2750 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Arte paleolítico de 25.000 años',
      '2 km de recorrido',
      'Valor histórico excepcional',
      'Formaciones espectaculares'
    ],
    dificultadTecnica: { fisica: 2, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'seca'
  },
  // JAÉN
  {
    id: 'cueva-agua-tíscar',
    nombre: 'Cueva del Agua de Tíscar',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Jaén',
    zona: 'Sierra de Cazorla',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '400m',
    desnivel: '35m',
    verticalMaxima: '0m',
    duracion: '2-3 horas',
    aproximacion: '5 min',
    precio: '35€',
    descripcionCorta: 'Cueva con cascada interior en la Sierra de Cazorla',
    descripcionLarga: 'La Cueva del Agua de Tíscar destaca por su espectacular cascada interior que atraviesa la cavidad. Ubicada en el Parque Natural de Cazorla, ofrece un recorrido de iniciación en un entorno natural privilegiado. La combinación de agua, roca y luz crea un ambiente único.',
    caracteristicas: ['horizontal', 'cascada', 'cazorla', 'paisaje'],
    imagen: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200',
    mejorEpoca: 'Primavera',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.8667, lng: -3.0333 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 8,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Cascada interior espectacular',
      'Parque Natural de Cazorla',
      'Apta para familias',
      'Paisaje único'
    ],
    dificultadTecnica: { fisica: 1, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'acuática'
  },
  {
    id: 'sima-hornos',
    nombre: 'Sima de Hornos',
    tipo: 'sima-vertical',
    requiereCurso: true,
    provincia: 'Jaén',
    zona: 'Sierra de Segura',
    nivel: 'Avanzado',
    nivelTecnico: 'III',
    desarrollo: '600m',
    desnivel: '-175m',
    verticalMaxima: '70m',
    duracion: '5-6 horas',
    aproximacion: '35 min',
    precio: '80€',
    descripcionCorta: 'Impresionante sima vertical en la Sierra de Segura',
    descripcionLarga: 'La Sima de Hornos es una de las cavidades verticales más espectaculares de la Sierra de Segura. Con un pozo de entrada de 70m y sucesivos resaltes hasta los -175m, requiere experiencia en técnicas verticales. Las formaciones en su interior y el entorno natural hacen de esta una experiencia única.',
    caracteristicas: ['vertical', 'profunda', 'segura', 'formaciones'],
    imagen: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200',
    mejorEpoca: 'Primavera y Otoño',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'difícil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 38.1833, lng: -2.7167 },
    requisitos: {
      cursoIniciacion: true,
      experienciaPrevia: true,
      edadMinima: 18,
      condicionFisica: 'alta',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo de vertical',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Pozo de 70m de entrada',
      '-175m de profundidad',
      'Sierra de Segura',
      'Experiencia extrema'
    ],
    dificultadTecnica: { fisica: 4, tecnica: 4, psicologica: 4, vertical: 5 },
    estado: 'húmeda'
  },
  // HUELVA
  {
    id: 'gruta-maravillas',
    nombre: 'Gruta de las Maravillas',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Huelva',
    zona: 'Aracena',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '2130m',
    desnivel: '60m',
    verticalMaxima: '0m',
    duracion: '3-4 horas',
    aproximacion: '5 min',
    precio: '45€',
    descripcionCorta: 'Una de las cuevas más espectaculares de España',
    descripcionLarga: 'La Gruta de las Maravillas en Aracena es una de las cavidades turísticas más impresionantes de España. El recorrido espeleológico más allá de la zona turística permite descubrir galerías vírgenes con formaciones calcáreas de extraordinaria belleza, lagos cristalinos y salas de dimensiones catedralicias.',
    caracteristicas: ['horizontal', 'lagos', 'formaciones', 'espectacular'],
    imagen: 'https://images.unsplash.com/photo-1518173946687-a4c036bc9f9f?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1518173946687-a4c036bc9f9f?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.8917, lng: -6.5667 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Una de las más espectaculares de España',
      'Lagos cristalinos',
      'Formaciones únicas',
      'Acceso sencillo'
    ],
    dificultadTecnica: { fisica: 1, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'húmeda'
  },
  // SEVILLA
  {
    id: 'cueva-santiago',
    nombre: 'Cueva de Santiago',
    tipo: 'cueva-horizontal',
    requiereCurso: false,
    provincia: 'Sevilla',
    zona: 'Sierra Norte',
    nivel: 'Iniciación',
    nivelTecnico: 'I',
    desarrollo: '550m',
    desnivel: '40m',
    verticalMaxima: '0m',
    duracion: '3 horas',
    aproximacion: '15 min',
    precio: '40€',
    descripcionCorta: 'Cueva de iniciación en la Sierra Norte de Sevilla',
    descripcionLarga: 'La Cueva de Santiago ofrece un recorrido de iniciación perfecto en la Sierra Norte de Sevilla. Con galerías amplias y formaciones calcáreas variadas, es ideal para dar los primeros pasos en la espeleología. El entorno natural del Parque Natural Sierra Norte completa la experiencia.',
    caracteristicas: ['horizontal', 'iniciación', 'formaciones', 'accesible'],
    imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'fácil',
    urlInfo: 'https://catfae.com/catalogo/invitado.php',
    coordenadas: { lat: 37.9500, lng: -5.7333 },
    requisitos: {
      cursoIniciacion: false,
      experienciaPrevia: false,
      edadMinima: 10,
      condicionFisica: 'básica',
      claustrofobia: true
    },
    incluye: [
      'Guía espeleólogo profesional titulado',
      'Material técnico completo',
      'Seguro de accidentes y RC',
      'Reportaje fotográfico'
    ],
    destacados: [
      'Perfecta para iniciación',
      'Parque Natural Sierra Norte',
      'Galerías amplias',
      'Fácil acceso'
    ],
    dificultadTecnica: { fisica: 1, tecnica: 1, psicologica: 1, vertical: 0 },
    estado: 'seca'
  }
];
