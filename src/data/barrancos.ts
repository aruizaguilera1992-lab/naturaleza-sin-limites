export interface BarrancoRequisitos {
  saberNadar: boolean;
  edadMinima: number;
  condicionFisica: 'basica' | 'media' | 'alta';
  vertigo: boolean;
}

export interface Barranco {
  id: string;
  nombre: string;
  provincia: 'Málaga' | 'Granada' | 'Cádiz' | 'Almería' | 'Jaén';
  poblacion: string;
  nivel: 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6';
  nivelExperiencia: 'principiante' | 'intermedio' | 'avanzado' | 'experto';
  clasificacionTecnica: string;
  duracion: string;
  duracionHoras: number;
  desnivel: string;
  longitud: string;
  rapelMaximo: string;
  numRapeles: number;
  caracteristicas: ('rapeles' | 'saltos' | 'toboganes' | 'nado')[];
  descripcionCorta: string;
  descripcionLarga: string;
  urlInfo: string;
  imagen: string;
  imagenGrande: string;
  precio: string;
  caudal: 'bajo' | 'medio' | 'alto';
  mejorEpoca: string;
  grupoMinimo: number;
  materialIncluido: boolean;
  acceso: 'facil' | 'medio' | 'dificil';
  requisitos: BarrancoRequisitos;
  incluye: string[];
  regulacion?: string;
}

export const barrancos: Barranco[] = [
  // ==========================================
  // BARRANCOS DE MÁLAGA (fuente: docuwiki.infobarrancos.es)
  // ==========================================
  {
    id: 'guadalmina',
    nombre: 'Río Guadalmina',
    provincia: 'Málaga',
    poblacion: 'Benahavís',
    nivel: 'V1',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V1 A3 I',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '60m',
    longitud: '1000m',
    rapelMaximo: '5m',
    numRapeles: 1,
    caracteristicas: ['nado', 'toboganes'],
    descripcionCorta: 'Paseo acuático ideal para familias. Más que un barranco, es un parque acuático natural con un solo rápel.',
    descripcionLarga: 'El Río Guadalmina en Benahavís es un recorrido acuático perfecto para iniciación y familias. Realmente no es un barranco al uso, sino un paseo por un río con un solo rápel de 5 metros. En época de lluvias la zona engorgada puede ser más interesante, pero el resto del tiempo funciona como un divertido parque acuático natural. Su acceso inmediato y retorno rápido lo hacen ideal para media jornada.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:guadalmina',
    imagen: '/images/barrancos/guadalmina.jpg',
    imagenGrande: '/images/barrancos/guadalmina.jpg',
    precio: '35€',
    caudal: 'medio',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: true,
      edadMinima: 8,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Transporte desde punto de encuentro'
    ]
  },
  {
    id: 'sima-diablo',
    nombre: 'Sima del Diablo',
    provincia: 'Málaga',
    poblacion: 'Júzcar',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V2 A1 I',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '100m',
    longitud: '1000m',
    rapelMaximo: '10m',
    numRapeles: 5,
    caracteristicas: ['rapeles', 'nado'],
    descripcionCorta: 'Barranco ideal para iniciación con 5 rápeles suaves. Ubicado en el pintoresco pueblo de Júzcar.',
    descripcionLarga: 'La Sima del Diablo es un barranco ideal para iniciación, con solo 5 rápeles y el más alto de 10 metros. Ubicado junto al pintoresco pueblo de Júzcar (el antiguo Pueblo Pitufo), ofrece un descenso accesible y divertido. Es mejor realizarlo tras lluvias para que lleve más agua y el cauce esté más limpio. El entorno del Valle del Genal es espectacular.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:sima_diablo',
    imagen: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920',
    precio: '40€',
    caudal: 'bajo',
    mejorEpoca: 'Octubre - Junio',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: false,
      edadMinima: 10,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'barranco-blanco',
    nombre: 'Barranco Blanco',
    provincia: 'Málaga',
    poblacion: 'Coín',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V2 A2 I',
    duracion: '1-2 horas',
    duracionHoras: 1,
    desnivel: '10m',
    longitud: '30m',
    rapelMaximo: '10m',
    numRapeles: 1,
    caracteristicas: ['rapeles', 'nado'],
    descripcionCorta: 'Zona de prácticas con un rápel y pozas naturales. Perfecto para bautismo de barranquismo.',
    descripcionLarga: 'Barranco Blanco no es un barranco como tal, sino una zona perfecta para prácticas y bautismos. Tiene un solo rápel de casi 10 metros desde un puente natural y una bonita zona de pozas aguas arriba. Ideal para ir de prácticas y darse un buen baño. Su acceso es inmediato desde la carretera.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:blanco',
    imagen: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920',
    precio: '30€',
    caudal: 'bajo',
    mejorEpoca: 'Junio - Septiembre',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: true,
      edadMinima: 8,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'almanchares',
    nombre: 'Río Almanchares',
    provincia: 'Málaga',
    poblacion: 'Canillas de Aceituno',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V2 A2 II',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '240m',
    longitud: '1250m',
    rapelMaximo: '15m',
    numRapeles: 12,
    caracteristicas: ['rapeles', 'toboganes', 'nado'],
    descripcionCorta: 'Entretenido barranco de iniciación con 12 rápeles para practicar técnica. En la Axarquía malagueña.',
    descripcionLarga: 'El Río Almanchares es un entretenido barranco ideal para iniciación, con 12 rápeles en los que se puede practicar pasamanos, guiados y diversas técnicas. Ubicado en Canillas de Aceituno, en plena Axarquía, ofrece un descenso completo con rápeles variados (el más largo de 15m) y un tobogán final. El equipamiento está en buen estado (reequipado en 2016). Prohibido su descenso del 15 de enero al 15 de junio por regulación medioambiental.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:alamachares',
    imagen: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920',
    precio: '45€',
    caudal: 'medio',
    mejorEpoca: 'Junio - Enero',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    regulacion: 'Prohibido del 15 de enero al 15 de junio',
    requisitos: {
      saberNadar: true,
      edadMinima: 12,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'jorox',
    nombre: 'Barranco de Jorox',
    provincia: 'Málaga',
    poblacion: 'Alozaina',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A2 II',
    duracion: '1-2 horas',
    duracionHoras: 1.5,
    desnivel: '50m',
    longitud: '300m',
    rapelMaximo: '22m',
    numRapeles: 5,
    caracteristicas: ['rapeles', 'toboganes'],
    descripcionCorta: 'Corto pero espectacular: rápeles técnicos, toboganes y una cascada final de 22m impresionante.',
    descripcionLarga: 'El Barranco de Jorox es un descenso sencillo pero ideal para iniciar gente en el barranquismo. Tiene varios rápeles cortitos, un par de toboganes y un rápel final de 22 metros absolutamente espectacular. Su acceso es inmediato y el retorno muy corto (15 min), lo que lo convierte en la opción perfecta para una media jornada de aventura cerca de la Sierra de las Nieves.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:jorox',
    imagen: '/images/barrancos/jorox.jpg',
    imagenGrande: '/images/barrancos/jorox.jpg',
    precio: '45€',
    caudal: 'bajo',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: false,
      edadMinima: 12,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'moreno',
    nombre: 'Barranco Moreno',
    provincia: 'Málaga',
    poblacion: 'Cómpeta',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A1 II',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '170m',
    longitud: '1500m',
    rapelMaximo: '21m',
    numRapeles: 7,
    caracteristicas: ['rapeles', 'saltos'],
    descripcionCorta: 'Sencillo barranco con una espectacular cascada final de 21m. Lo mejor de la zona de Cómpeta.',
    descripcionLarga: 'El Barranco Moreno es un descenso sencillo que puede realizarse como iniciación. Su cascada final de 21 metros es de lo mejorcito de la zona y lo más reseñable de este descenso. Tiene 7 rápeles variados con equipamiento mixto (material de repuesto y naturales). En verano puede secarse, por lo que es preferible realizarlo en primavera u otoño.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:moreno',
    imagen: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920',
    precio: '50€',
    caudal: 'medio',
    mejorEpoca: 'Octubre - Junio',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: false,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'arroyo-miel',
    nombre: 'Arroyo de la Miel',
    provincia: 'Málaga',
    poblacion: 'Estepona',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A1 I',
    duracion: '3-4 horas',
    duracionHoras: 3,
    desnivel: '200m',
    longitud: '700m',
    rapelMaximo: '26m',
    numRapeles: 4,
    caracteristicas: ['rapeles'],
    descripcionCorta: 'Barranco técnico con un impresionante primer rápel de 26m. En la Costa del Sol occidental.',
    descripcionLarga: 'El Barranco del Arroyo de la Miel es un descenso de iniciación avanzada, con 4 rápeles siendo el primero de 26 metros bastante impresionante. Ubicado en Estepona, generalmente no tiene mucho caudal salvo en época de lluvias. En verano puede secarse. Es un barranco de "coleccionismo" pero con encanto, perfecto para quien ya tiene algo de experiencia y quiere progresar.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:arroyo_miel',
    imagen: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1920',
    precio: '50€',
    caudal: 'bajo',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: false,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'cala',
    nombre: 'Barranco de la Cala',
    provincia: 'Málaga',
    poblacion: 'Estepona',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A1 I',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '270m',
    longitud: '1500m',
    rapelMaximo: '20m',
    numRapeles: 6,
    caracteristicas: ['rapeles'],
    descripcionCorta: 'Barranco seco perfecto para iniciación con 6 rápeles variados. Mucho mejor tras lluvias.',
    descripcionLarga: 'El Barranco de la Cala es un descenso sencillo, generalmente seco salvo tras lluvias, perfecto para iniciación. Tiene 6 rápeles variados, siendo el más largo de 20 metros. Es mucho mejor realizarlo tras período de lluvias cuando el agua da vida al cauce. El equipamiento está en buen estado. Ubicado en la zona de Estepona.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:cala',
    imagen: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920',
    precio: '50€',
    caudal: 'bajo',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: false,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'huma',
    nombre: 'Barranco de Huma',
    provincia: 'Málaga',
    poblacion: 'Valle de Abdalajís',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A1 I',
    duracion: '2-3 horas',
    duracionHoras: 2,
    desnivel: '150m',
    longitud: '400m',
    rapelMaximo: '32m',
    numRapeles: 10,
    caracteristicas: ['rapeles'],
    descripcionCorta: 'Intenso barranco seco con 10 rápeles y dos de 32m. Cerca de El Chorro, combinable con escalada.',
    descripcionLarga: 'El Barranco de Huma es un descenso generalmente seco salvo tras lluvias, momento en el que adquiere gran interés. Cuenta con 10 rápeles impresionantes, dos de ellos de 32 metros. El equipamiento es bueno con spits y material de repuesto. Ubicado en Valle de Abdalajís, cerca de El Chorro, se puede combinar con otros barrancos de la zona como Puerto de Ramos.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:huma',
    imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920',
    precio: '55€',
    caudal: 'bajo',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: false,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'zarzalones',
    nombre: 'Barranco de Zarzalones',
    provincia: 'Málaga',
    poblacion: 'Yunquera',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    clasificacionTecnica: 'V4 A2 II (Sup) / V3 A2 I (Inf)',
    duracion: '4-6 horas',
    duracionHoras: 5,
    desnivel: '240m',
    longitud: '2150m',
    rapelMaximo: '40m',
    numRapeles: 15,
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Dos partes: la superior técnica con 11 rápeles (max 40m) y la inferior acuática. ¡El integral es imprescindible!',
    descripcionLarga: 'El Barranco de Zarzalones tiene dos partes diferenciadas: la superior más técnica con 11 rápeles (el último de 40m espectacular) y rápeles más largos, y la inferior más acuática con 4 rápeles, saltos y ambiente lúdico. Se puede hacer solo la parte inferior (ideal para iniciación), solo la superior, o la integral completa. Ubicado en Yunquera, junto a la Sierra de las Nieves, es uno de los descensos más completos de Málaga.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:zarzalones',
    imagen: '/images/barrancos/jorox-cascada.jpg',
    imagenGrande: '/images/barrancos/jorox-cascada.jpg',
    precio: '60€',
    caudal: 'medio',
    mejorEpoca: 'Abril - Noviembre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: true,
      edadMinima: 16,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Snack energético'
    ]
  },
  {
    id: 'tajo-ronda',
    nombre: 'Tajo de Ronda',
    provincia: 'Málaga',
    poblacion: 'Ronda',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    clasificacionTecnica: 'V4 A2 III',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '110m',
    longitud: '600m',
    rapelMaximo: '35m',
    numRapeles: 2,
    caracteristicas: ['rapeles'],
    descripcionCorta: 'Solo 2 rápeles pero el primero de 35m con vistas al Puente Nuevo. ¡Una experiencia única!',
    descripcionLarga: 'El Tajo de Ronda es un barranco sencillo y corto en una ilustre zona: el pueblo de Ronda. Con solo 2 rápeles (35m y 25m), ofrece una experiencia espectacular con vistas al icónico Puente Nuevo. Mejor evitar el verano pues se seca y el agua estancada en las pozas puede oler. NOTA: Prohibición temporal desde noviembre de 2024.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:tajo_ronda',
    imagen: '/images/barrancos/tajo-ronda.jpg',
    imagenGrande: '/images/barrancos/tajo-ronda.jpg',
    precio: '55€',
    caudal: 'bajo',
    mejorEpoca: 'Octubre - Mayo',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    regulacion: 'Prohibición temporal desde noviembre 2024. Consultar disponibilidad.',
    requisitos: {
      saberNadar: false,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'buitreras',
    nombre: 'Cañón de las Buitreras',
    provincia: 'Málaga',
    poblacion: 'El Colmenar',
    nivel: 'V3',
    nivelExperiencia: 'avanzado',
    clasificacionTecnica: 'V3 A5 V',
    duracion: '6-8 horas',
    duracionHoras: 7,
    desnivel: '50m',
    longitud: '1500m',
    rapelMaximo: '10m',
    numRapeles: 4,
    caracteristicas: ['rapeles', 'nado'],
    descripcionCorta: 'Barranco extremadamente acuático y comprometido (A5). Requiere autorización de la Junta de Andalucía.',
    descripcionLarga: 'El Cañón de las Buitreras (Barranco del Guadiaro) es un descenso acuático regulado por nidificación de buitres y crecidas. Aunque técnicamente los rápeles son cortos (max 10m), el compromiso acuático es extremo (A5): nados largos, corrientes fuertes y SIN escapes posibles en la zona encajonada. Muy peligroso con caudal elevado. Requiere solicitar autorización a la Junta de Andalucía (concedida generalmente entre 15 junio y 15 diciembre).',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:malaga:guadiaro_o_buitreras',
    imagen: '/images/barrancos/buitreras.jpg',
    imagenGrande: '/images/barrancos/buitreras-interior.jpg',
    precio: '90€',
    caudal: 'alto',
    mejorEpoca: 'Junio - Diciembre',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'dificil',
    regulacion: 'Requiere autorización de la Junta de Andalucía. Solo del 15 de junio al 15 de diciembre.',
    requisitos: {
      saberNadar: true,
      edadMinima: 18,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno grueso, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Permiso de acceso',
      'Comida de montaña'
    ]
  },
  // ==========================================
  // BARRANCOS DE GRANADA
  // ==========================================
  {
    id: 'rio-verde',
    nombre: 'Río Verde',
    provincia: 'Granada',
    poblacion: 'Otívar',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A3 III',
    duracion: '4-6 horas',
    duracionHoras: 5,
    desnivel: '280m',
    longitud: '2000m',
    rapelMaximo: '15m',
    numRapeles: 8,
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Clásico de Granada con agua abundante todo el año. El barranco más emblemático de Andalucía.',
    descripcionLarga: 'El Río Verde es uno de los barrancos más emblemáticos de Andalucía, situado en un entorno natural privilegiado de la provincia de Granada. Con agua cristalina durante todo el año, ofrece una experiencia completa con rapeles técnicos, saltos opcionales y tramos de nado en pozas de aguas turquesas. El descenso transcurre por un cañón de paredes verticales cubiertas de vegetación mediterránea.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:granada:rio_verde',
    imagen: '/images/barrancos/rio-verde.jpg',
    imagenGrande: '/images/barrancos/rio-verde.jpg',
    precio: '55€',
    caudal: 'medio',
    mejorEpoca: 'Abril - Octubre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: true,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'rio-lentegi',
    nombre: 'Río Lentegí',
    provincia: 'Granada',
    poblacion: 'Lentegí',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V2 A3 II',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '180m',
    longitud: '1500m',
    rapelMaximo: '12m',
    numRapeles: 6,
    caracteristicas: ['rapeles', 'saltos', 'toboganes'],
    descripcionCorta: 'Perfecto para iniciación. Toboganes naturales y ambiente lúdico en un entorno espectacular.',
    descripcionLarga: 'El Río Lentegí es la opción perfecta para quienes buscan una primera experiencia en el mundo del barranquismo. Sus toboganes naturales de roca pulida por el agua y sus pequeños saltos opcionales hacen de este descenso una actividad divertida y accesible. El entorno es espectacular, con paredes cubiertas de hiedra y pozas de agua cristalina.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:granada:rio_lentegi',
    imagen: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920',
    precio: '45€',
    caudal: 'bajo',
    mejorEpoca: 'Mayo - Septiembre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: true,
      edadMinima: 10,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Transporte desde punto de encuentro'
    ]
  },
  {
    id: 'trevejo',
    nombre: 'Barranco del Trevejo',
    provincia: 'Granada',
    poblacion: 'Trevélez',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V2 A2 I',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '130m',
    longitud: '800m',
    rapelMaximo: '8m',
    numRapeles: 4,
    caracteristicas: ['rapeles', 'toboganes', 'nado'],
    descripcionCorta: 'Perfecto para primeras experiencias. Corto pero muy divertido.',
    descripcionLarga: 'El Barranco del Trevejo es la introducción perfecta al mundo del barranquismo. Su corta duración y sus obstáculos accesibles lo hacen ideal para familias y grupos de amigos que buscan una primera experiencia. Los toboganes naturales y las pequeñas pozas garantizan la diversión, mientras que los rapeles cortos permiten aprender la técnica sin presión.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:granada:trevejo',
    imagen: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920',
    precio: '40€',
    caudal: 'bajo',
    mejorEpoca: 'Mayo - Octubre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: true,
      edadMinima: 10,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Transporte desde punto de encuentro'
    ]
  },
  {
    id: 'poqueira',
    nombre: 'Río Poqueira',
    provincia: 'Granada',
    poblacion: 'Capileira',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    clasificacionTecnica: 'V4 A4 IV',
    duracion: '6-7 horas',
    duracionHoras: 6.5,
    desnivel: '380m',
    longitud: '2500m',
    rapelMaximo: '30m',
    numRapeles: 10,
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'En el corazón de la Alpujarra. Agua fría de Sierra Nevada y paisajes únicos.',
    descripcionLarga: 'El Río Poqueira nace en las cumbres de Sierra Nevada y desciende por el corazón de la Alpujarra granadina. Sus aguas frías y cristalinas crean un ambiente alpino único en Andalucía. Los rapeles son técnicos y las pozas profundas. Un descenso exigente que combina la belleza de la alta montaña con la emoción del barranquismo deportivo.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:granada:poqueira',
    imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
    precio: '65€',
    caudal: 'alto',
    mejorEpoca: 'Junio - Septiembre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: true,
      edadMinima: 16,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno grueso, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'lanjaron',
    nombre: 'Río Lanjarón',
    provincia: 'Granada',
    poblacion: 'Lanjarón',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    clasificacionTecnica: 'V4 A4 III',
    duracion: '5-6 horas',
    duracionHoras: 5.5,
    desnivel: '320m',
    longitud: '2000m',
    rapelMaximo: '28m',
    numRapeles: 8,
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Agua abundante todo el año. Técnico pero muy gratificante.',
    descripcionLarga: 'El Río Lanjarón es famoso por mantener agua abundante durante todo el año, lo que lo convierte en una opción fiable incluso en épocas de sequía. Sus rapeles son técnicos y sus pozas profundas. El descenso transcurre por un cañón encajado con paredes de roca cubiertas de vegetación. Una experiencia gratificante para barranquistas con experiencia.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:granada:lanjaron',
    imagen: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920',
    precio: '60€',
    caudal: 'alto',
    mejorEpoca: 'Todo el año',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: true,
      edadMinima: 16,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno grueso, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  // ==========================================
  // BARRANCOS DE CÁDIZ
  // ==========================================
  {
    id: 'garganta-verde',
    nombre: 'Garganta Verde',
    provincia: 'Cádiz',
    poblacion: 'Zahara de la Sierra',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    clasificacionTecnica: 'V4 A2 IV',
    duracion: '6-8 horas',
    duracionHoras: 7,
    desnivel: '400m',
    longitud: '3000m',
    rapelMaximo: '40m',
    numRapeles: 6,
    caracteristicas: ['rapeles', 'nado'],
    descripcionCorta: 'La catedral del barranquismo en Andalucía. Paredes verticales de vértigo.',
    descripcionLarga: 'La Garganta Verde es considerada la catedral del barranquismo andaluz. Sus impresionantes paredes verticales de más de 400 metros crean un ambiente sobrecogedor. El descenso incluye rapeles aéreos espectaculares y travesías por estrechos pasajes de roca caliza. Una experiencia reservada para barranquistas con experiencia que buscan emociones fuertes.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:cadiz:garganta_verde',
    imagen: '/images/barrancos/garganta-verde.jpg',
    imagenGrande: '/images/barrancos/garganta-verde.jpg',
    precio: '75€',
    caudal: 'bajo',
    mejorEpoca: 'Marzo - Noviembre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: true,
      edadMinima: 16,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Permiso de acceso al Parque Natural'
    ]
  },
  {
    id: 'paterna',
    nombre: 'Río Paterna',
    provincia: 'Cádiz',
    poblacion: 'Paterna de Rivera',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    clasificacionTecnica: 'V2 A3 II',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '140m',
    longitud: '1200m',
    rapelMaximo: '12m',
    numRapeles: 5,
    caracteristicas: ['rapeles', 'saltos', 'toboganes', 'nado'],
    descripcionCorta: 'Barranco lúdico con saltos opcionales. Muy recomendado para grupos.',
    descripcionLarga: 'El Río Paterna es uno de los barrancos más divertidos de la provincia de Cádiz. Sus numerosos saltos opcionales de diferentes alturas permiten a cada participante elegir su nivel de adrenalina. Los toboganes naturales son espectaculares y las pozas perfectas para el baño. Ideal para grupos de amigos o empresas que buscan una experiencia memorable.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:cadiz:paterna',
    imagen: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920',
    precio: '45€',
    caudal: 'medio',
    mejorEpoca: 'Abril - Octubre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: true,
      edadMinima: 12,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Transporte desde punto de encuentro'
    ]
  },
  {
    id: 'majales',
    nombre: 'Los Majales',
    provincia: 'Cádiz',
    poblacion: 'Grazalema',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    clasificacionTecnica: 'V3 A2 III',
    duracion: '4-5 horas',
    duracionHoras: 4.5,
    desnivel: '250m',
    longitud: '1800m',
    rapelMaximo: '22m',
    numRapeles: 7,
    caracteristicas: ['rapeles', 'saltos'],
    descripcionCorta: 'En plena Sierra de Grazalema. Roca caliza esculpida por el agua.',
    descripcionLarga: 'Los Majales se encuentra en el corazón del Parque Natural Sierra de Grazalema, una de las zonas más lluviosas de España. La roca caliza ha sido esculpida durante milenios, creando formas caprichosas y pasajes estrechos. Los rapeles son variados y las vistas desde los anclajes son impresionantes. Un descenso que combina belleza geológica con emoción.',
    urlInfo: 'https://www.docuwiki.infobarrancos.es/doku.php?id=barrancos:cadiz:majales',
    imagen: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85',
    imagenGrande: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920',
    precio: '55€',
    caudal: 'bajo',
    mejorEpoca: 'Abril - Noviembre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'medio',
    requisitos: {
      saberNadar: false,
      edadMinima: 14,
      condicionFisica: 'media',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Permiso de acceso al Parque Natural'
    ]
  },
];

export type NivelExperiencia = 'principiante' | 'intermedio' | 'avanzado' | 'experto';
export type DuracionPreferida = 'medio-dia' | 'dia-completo' | 'jornada-larga';
export type Caracteristica = 'rapeles' | 'saltos' | 'toboganes' | 'nado' | 'todo';
export type Provincia = 'Málaga' | 'Granada' | 'Cádiz' | 'cualquiera';
