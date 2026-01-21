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
  nivel: 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6';
  nivelExperiencia: 'principiante' | 'intermedio' | 'avanzado' | 'experto';
  duracion: string;
  duracionHoras: number;
  desnivel: string;
  rapelMaximo: string;
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
}

export const barrancos: Barranco[] = [
  {
    id: 'rio-verde',
    nombre: 'Río Verde',
    provincia: 'Granada',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    duracion: '4-6 horas',
    duracionHoras: 5,
    desnivel: '280m',
    rapelMaximo: '15m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Barranco clásico de Granada con agua abundante todo el año. Ideal para iniciados con algo de experiencia.',
    descripcionLarga: 'El Río Verde es uno de los barrancos más emblemáticos de Andalucía, situado en un entorno natural privilegiado de la provincia de Granada. Con agua cristalina durante todo el año, ofrece una experiencia completa con rapeles técnicos, saltos opcionales y tramos de nado en pozas de aguas turquesas. El descenso transcurre por un cañón de paredes verticales cubiertas de vegetación mediterránea.',
    urlInfo: 'https://infobarrancos.es/barranco/rio-verde',
    imagen: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
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
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '180m',
    rapelMaximo: '12m',
    caracteristicas: ['rapeles', 'saltos', 'toboganes'],
    descripcionCorta: 'Perfecto para iniciación. Toboganes naturales y ambiente lúdico en un entorno espectacular.',
    descripcionLarga: 'El Río Lentegí es la opción perfecta para quienes buscan una primera experiencia en el mundo del barranquismo. Sus toboganes naturales de roca pulida por el agua y sus pequeños saltos opcionales hacen de este descenso una actividad divertida y accesible. El entorno es espectacular, con paredes cubiertas de hiedra y pozas de agua cristalina.',
    urlInfo: 'https://infobarrancos.es/barranco/rio-lentegi',
    imagen: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200',
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
    id: 'rio-higueron',
    nombre: 'Río Higuerón',
    provincia: 'Málaga',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    duracion: '4-5 horas',
    duracionHoras: 4.5,
    desnivel: '200m',
    rapelMaximo: '20m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Uno de los más bonitos de Málaga. Agua cristalina y formaciones rocosas impresionantes.',
    descripcionLarga: 'El Río Higuerón destaca por la belleza de sus formaciones rocosas esculpidas por el agua durante milenios. Sus pozas de agua turquesa y sus rapeles técnicos lo convierten en uno de los descensos más fotogénicos de la provincia de Málaga. El cañón ofrece un equilibrio perfecto entre técnica y diversión.',
    urlInfo: 'https://infobarrancos.es/barranco/rio-higueron',
    imagen: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1200',
    precio: '50€',
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
    id: 'chillar',
    nombre: 'Río Chillar',
    provincia: 'Málaga',
    nivel: 'V1',
    nivelExperiencia: 'principiante',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '100m',
    rapelMaximo: '0m',
    caracteristicas: ['nado', 'toboganes'],
    descripcionCorta: 'Ruta acuática ideal para familias. Sin rapeles, solo diversión en el agua.',
    descripcionLarga: 'El Río Chillar es la opción perfecta para familias y grupos que buscan una experiencia acuática sin necesidad de técnicas de rapel. El recorrido transcurre por el cauce del río, caminando entre paredes de roca y disfrutando de pequeños toboganes naturales y pozas donde refrescarse. Una aventura accesible para todos los públicos.',
    urlInfo: 'https://infobarrancos.es/barranco/rio-chillar',
    imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
    precio: '35€',
    caudal: 'bajo',
    mejorEpoca: 'Junio - Septiembre',
    grupoMinimo: 2,
    materialIncluido: true,
    acceso: 'facil',
    requisitos: {
      saberNadar: false,
      edadMinima: 8,
      condicionFisica: 'basica',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material básico (calzado acuático opcional)',
      'Seguro de accidentes',
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'zarzalones',
    nombre: 'Los Zarzalones',
    provincia: 'Málaga',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    duracion: '5-7 horas',
    duracionHoras: 6,
    desnivel: '350m',
    rapelMaximo: '35m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Barranco técnico con rapeles verticales impresionantes. Requiere buena forma física.',
    descripcionLarga: 'Los Zarzalones es un descenso técnico que pondrá a prueba tu destreza y resistencia. Con rapeles verticales de hasta 35 metros y tramos de nado exigentes, este barranco está reservado para barranquistas con experiencia previa. Las vistas desde los anclajes son espectaculares y la sensación de logro al completarlo es inolvidable.',
    urlInfo: 'https://infobarrancos.es/barranco/zarzalones',
    imagen: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    precio: '65€',
    caudal: 'medio',
    mejorEpoca: 'Abril - Octubre',
    grupoMinimo: 4,
    materialIncluido: true,
    acceso: 'dificil',
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
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '150m',
    rapelMaximo: '25m',
    caracteristicas: ['rapeles', 'saltos'],
    descripcionCorta: 'Descenso espectacular con vistas al famoso Puente Nuevo de Ronda.',
    descripcionLarga: 'El Tajo de Ronda ofrece una experiencia única: descender por el icónico cañón que ha hecho famosa a la ciudad de Ronda en todo el mundo. Los rapeles con vistas al Puente Nuevo son absolutamente espectaculares. Un descenso que combina naturaleza, historia y aventura en un enclave declarado Patrimonio de la Humanidad.',
    urlInfo: 'https://infobarrancos.es/barranco/tajo-ronda',
    imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
    precio: '55€',
    caudal: 'bajo',
    mejorEpoca: 'Todo el año',
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
    id: 'garganta-verde',
    nombre: 'Garganta Verde',
    provincia: 'Cádiz',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    duracion: '6-8 horas',
    duracionHoras: 7,
    desnivel: '400m',
    rapelMaximo: '40m',
    caracteristicas: ['rapeles', 'nado'],
    descripcionCorta: 'La catedral del barranquismo en Andalucía. Paredes verticales de vértigo.',
    descripcionLarga: 'La Garganta Verde es considerada la catedral del barranquismo andaluz. Sus impresionantes paredes verticales de más de 400 metros crean un ambiente sobrecogedor. El descenso incluye rapeles aéreos espectaculares y travesías por estrechos pasajes de roca caliza. Una experiencia reservada para barranquistas con experiencia que buscan emociones fuertes.',
    urlInfo: 'https://infobarrancos.es/barranco/garganta-verde',
    imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
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
    id: 'sima-cabra',
    nombre: 'Sima del Cabra',
    provincia: 'Cádiz',
    nivel: 'V5',
    nivelExperiencia: 'experto',
    duracion: '8-10 horas',
    duracionHoras: 9,
    desnivel: '500m',
    rapelMaximo: '60m',
    caracteristicas: ['rapeles'],
    descripcionCorta: 'Descenso extremo solo para expertos. Rapeles aéreos y técnica exigente.',
    descripcionLarga: 'La Sima del Cabra es uno de los descensos más técnicos y exigentes de toda Andalucía. Con rapeles aéreos de hasta 60 metros y pasajes que requieren técnicas avanzadas de progresión, este barranco está exclusivamente reservado para expertos con amplia experiencia demostrable. La jornada es larga e intensa, pero la recompensa es proporcional al esfuerzo.',
    urlInfo: 'https://infobarrancos.es/barranco/sima-cabra',
    imagen: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200',
    precio: '95€',
    caudal: 'bajo',
    mejorEpoca: 'Mayo - Octubre',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'dificil',
    requisitos: {
      saberNadar: true,
      edadMinima: 18,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Comida de montaña'
    ]
  },
  {
    id: 'guadalmina',
    nombre: 'Río Guadalmina',
    provincia: 'Málaga',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '120m',
    rapelMaximo: '10m',
    caracteristicas: ['rapeles', 'saltos', 'toboganes', 'nado'],
    descripcionCorta: 'Barranco muy completo para iniciación. Tiene de todo en un entorno paradisíaco.',
    descripcionLarga: 'El Río Guadalmina es el barranco más completo para iniciación en Málaga. Ofrece un poco de todo: pequeños rapeles para aprender la técnica, saltos opcionales, toboganes naturales divertidos y tramos de nado en pozas de agua cristalina. El entorno natural es espectacular, con vegetación mediterránea y paredes de roca esculpidas por el agua.',
    urlInfo: 'https://infobarrancos.es/barranco/guadalmina',
    imagen: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
    precio: '45€',
    caudal: 'medio',
    mejorEpoca: 'Abril - Octubre',
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
    id: 'almanchares',
    nombre: 'Río Almanchares',
    provincia: 'Málaga',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    duracion: '4-5 horas',
    duracionHoras: 4.5,
    desnivel: '220m',
    rapelMaximo: '18m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Enclave natural precioso en la Axarquía. Pozas cristalinas y vegetación exuberante.',
    descripcionLarga: 'El Río Almanchares transcurre por uno de los enclaves más bellos de la Axarquía malagueña. Sus pozas de agua cristalina, rodeadas de vegetación subtropical, crean un ambiente casi selvático. Los rapeles son técnicamente accesibles pero suficientemente desafiantes para mantener el interés. Un barranco ideal para quienes buscan naturaleza en estado puro.',
    urlInfo: 'https://infobarrancos.es/barranco/almanchares',
    imagen: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200',
    precio: '50€',
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
    id: 'poqueira',
    nombre: 'Río Poqueira',
    provincia: 'Granada',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    duracion: '6-7 horas',
    duracionHoras: 6.5,
    desnivel: '380m',
    rapelMaximo: '30m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'En el corazón de la Alpujarra. Agua fría de Sierra Nevada y paisajes únicos.',
    descripcionLarga: 'El Río Poqueira nace en las cumbres de Sierra Nevada y desciende por el corazón de la Alpujarra granadina. Sus aguas frías y cristalinas crean un ambiente alpino único en Andalucía. Los rapeles son técnicos y las pozas profundas. Un descenso exigente que combina la belleza de la alta montaña con la emoción del barranquismo deportivo.',
    urlInfo: 'https://infobarrancos.es/barranco/poqueira',
    imagen: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
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
    id: 'trevejo',
    nombre: 'Barranco del Trevejo',
    provincia: 'Granada',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '130m',
    rapelMaximo: '8m',
    caracteristicas: ['rapeles', 'toboganes', 'nado'],
    descripcionCorta: 'Perfecto para primeras experiencias. Corto pero muy divertido.',
    descripcionLarga: 'El Barranco del Trevejo es la introducción perfecta al mundo del barranquismo. Su corta duración y sus obstáculos accesibles lo hacen ideal para familias y grupos de amigos que buscan una primera experiencia. Los toboganes naturales y las pequeñas pozas garantizan la diversión, mientras que los rapeles cortos permiten aprender la técnica sin presión.',
    urlInfo: 'https://infobarrancos.es/barranco/trevejo',
    imagen: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
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
    id: 'majales',
    nombre: 'Los Majales',
    provincia: 'Cádiz',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    duracion: '4-5 horas',
    duracionHoras: 4.5,
    desnivel: '250m',
    rapelMaximo: '22m',
    caracteristicas: ['rapeles', 'saltos'],
    descripcionCorta: 'En plena Sierra de Grazalema. Roca caliza esculpida por el agua.',
    descripcionLarga: 'Los Majales se encuentra en el corazón del Parque Natural Sierra de Grazalema, una de las zonas más lluviosas de España. La roca caliza ha sido esculpida durante milenios, creando formas caprichosas y pasajes estrechos. Los rapeles son variados y las vistas desde los anclajes son impresionantes. Un descenso que combina belleza geológica con emoción.',
    urlInfo: 'https://infobarrancos.es/barranco/majales',
    imagen: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200',
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
  {
    id: 'paterna',
    nombre: 'Río Paterna',
    provincia: 'Cádiz',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    duracion: '3-4 horas',
    duracionHoras: 3.5,
    desnivel: '140m',
    rapelMaximo: '12m',
    caracteristicas: ['rapeles', 'saltos', 'toboganes', 'nado'],
    descripcionCorta: 'Barranco lúdico con saltos opcionales. Muy recomendado para grupos.',
    descripcionLarga: 'El Río Paterna es uno de los barrancos más divertidos de la provincia de Cádiz. Sus numerosos saltos opcionales de diferentes alturas permiten a cada participante elegir su nivel de adrenalina. Los toboganes naturales son espectaculares y las pozas perfectas para el baño. Ideal para grupos de amigos o empresas que buscan una experiencia memorable.',
    urlInfo: 'https://infobarrancos.es/barranco/paterna',
    imagen: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200',
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
    id: 'buitreras',
    nombre: 'Las Buitreras',
    provincia: 'Málaga',
    nivel: 'V5',
    nivelExperiencia: 'experto',
    duracion: '8-10 horas',
    duracionHoras: 9,
    desnivel: '450m',
    rapelMaximo: '55m',
    caracteristicas: ['rapeles', 'nado'],
    descripcionCorta: 'Uno de los más difíciles de Andalucía. Solo para barranquistas experimentados.',
    descripcionLarga: 'Las Buitreras es considerado uno de los barrancos más técnicos y exigentes de toda Andalucía. Con rapeles aéreos de hasta 55 metros sobre pozas profundas, este descenso está reservado exclusivamente para expertos con amplia experiencia. El cañón recibe su nombre de los buitres que anidan en sus paredes verticales. Una experiencia extrema para los más valientes.',
    urlInfo: 'https://infobarrancos.es/barranco/buitreras',
    imagen: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200',
    precio: '90€',
    caudal: 'medio',
    mejorEpoca: 'Mayo - Octubre',
    grupoMinimo: 3,
    materialIncluido: true,
    acceso: 'dificil',
    requisitos: {
      saberNadar: true,
      edadMinima: 18,
      condicionFisica: 'alta',
      vertigo: false
    },
    incluye: [
      'Guía profesional titulado',
      'Material técnico completo (neopreno, arnés, casco)',
      'Seguro de accidentes',
      'Reportaje fotográfico',
      'Comida de montaña'
    ]
  },
  {
    id: 'moreno',
    nombre: 'Barranco Moreno',
    provincia: 'Granada',
    nivel: 'V3',
    nivelExperiencia: 'intermedio',
    duracion: '4-5 horas',
    duracionHoras: 4.5,
    desnivel: '200m',
    rapelMaximo: '20m',
    caracteristicas: ['rapeles', 'saltos', 'toboganes'],
    descripcionCorta: 'Muy divertido con toboganes naturales espectaculares.',
    descripcionLarga: 'El Barranco Moreno destaca por sus espectaculares toboganes naturales de roca pulida. La diversión está garantizada con deslizamientos que terminan en pozas cristalinas. Los rapeles son técnicamente accesibles pero emocionantes, y el entorno natural es precioso. Un barranco que combina adrenalina con risas y buenos momentos.',
    urlInfo: 'https://infobarrancos.es/barranco/moreno',
    imagen: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200',
    precio: '50€',
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
    id: 'casares',
    nombre: 'Barranco de Casares',
    provincia: 'Málaga',
    nivel: 'V2',
    nivelExperiencia: 'principiante',
    duracion: '2-3 horas',
    duracionHoras: 2.5,
    desnivel: '100m',
    rapelMaximo: '10m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Corto y accesible, perfecto para media jornada de aventura.',
    descripcionLarga: 'El Barranco de Casares es perfecto para quienes disponen de pocas horas pero no quieren renunciar a la aventura. Su corta duración no resta emoción: pequeños rapeles, saltos opcionales y pozas para refrescarse hacen de este descenso una experiencia completa. Ideal para combinar con una visita al pintoresco pueblo blanco de Casares.',
    urlInfo: 'https://infobarrancos.es/barranco/casares',
    imagen: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200',
    precio: '40€',
    caudal: 'bajo',
    mejorEpoca: 'Abril - Octubre',
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
      'Reportaje fotográfico'
    ]
  },
  {
    id: 'lanjaron',
    nombre: 'Río Lanjarón',
    provincia: 'Granada',
    nivel: 'V4',
    nivelExperiencia: 'avanzado',
    duracion: '5-6 horas',
    duracionHoras: 5.5,
    desnivel: '320m',
    rapelMaximo: '28m',
    caracteristicas: ['rapeles', 'saltos', 'nado'],
    descripcionCorta: 'Agua abundante todo el año. Técnico pero muy gratificante.',
    descripcionLarga: 'El Río Lanjarón es famoso por mantener agua abundante durante todo el año, lo que lo convierte en una opción fiable incluso en épocas de sequía. Sus rapeles son técnicos y sus pozas profundas. El descenso transcurre por un cañón encajado con paredes de roca cubiertas de vegetación. Una experiencia gratificante para barranquistas con experiencia.',
    urlInfo: 'https://infobarrancos.es/barranco/lanjaron',
    imagen: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
    imagenGrande: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200',
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
  }
];

export type NivelExperiencia = 'principiante' | 'intermedio' | 'avanzado' | 'experto';
export type DuracionPreferida = 'medio-dia' | 'dia-completo' | 'jornada-larga';
export type Caracteristica = 'rapeles' | 'saltos' | 'toboganes' | 'nado' | 'todo';
export type Provincia = 'Málaga' | 'Granada' | 'Cádiz' | 'cualquiera';
