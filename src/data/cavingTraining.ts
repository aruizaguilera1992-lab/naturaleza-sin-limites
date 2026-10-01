/**
 * Formación propia NSL en espeleología (propuesta pendiente de aprobación).
 * No es un curso federativo ni oficial. No añadir horas, precios, fechas,
 * plazas, ubicaciones, titulaciones, seguros ni material sin aprobación.
 */
export const CAVING_PENDING = "Consultar programa y disponibilidad";

export interface CavingLevel {
  code: "E1" | "E2" | "E3";
  title: string;
  audience: string;
  contents: string[];
  outcomes: string[];
  access: string;
  assessment: string;
  next: string;
}

export const cavingLevels: CavingLevel[] = [
  {
    code: "E1",
    title: "Iniciación",
    audience: "Personas que han hecho una experiencia guiada o quieren empezar con método.",
    contents: [
      "Hábitos de seguridad y comunicación bajo tierra.",
      "Iluminación, equipo personal y su revisión.",
      "Progresión horizontal en galerías y pasos sencillos.",
      "Mínimo impacto y respeto por la cavidad.",
    ],
    outcomes: [
      "Revisar el equipo personal con supervisión.",
      "Desplazarse con seguridad en tramos horizontales.",
      "Comunicarse y moverse dentro de un grupo.",
    ],
    access: "Sin experiencia previa. Valoración inicial con el equipo de guías.",
    assessment: "Observación práctica de revisiones, desplazamiento y comunicación.",
    next: "Prácticas tutorizadas y E2.",
  },
  {
    code: "E2",
    title: "Progresión y consolidación",
    audience: "Personas con E1 o experiencia equivalente que quieren afianzar la progresión por cuerda.",
    contents: [
      "Ascenso y descenso por cuerda en escenarios controlados.",
      "Paso de fraccionamientos y cambios de aparato.",
      "Gestión del esfuerzo y de los tiempos de grupo.",
    ],
    outcomes: [
      "Progresar por cuerda en tramos sencillos bajo supervisión.",
      "Realizar cambios de aparato de forma consistente.",
      "Mantener la comunicación y los protocolos del grupo.",
    ],
    access: "E1 superado o valoración práctica equivalente.",
    assessment: "Evaluación práctica de maniobras y progresión en escenario definido.",
    next: "Prácticas tutorizadas y E3.",
  },
  {
    code: "E3",
    title: "Técnicas avanzadas",
    audience: "Personas con E2 o equivalente y práctica reciente que buscan mayor autonomía técnica.",
    contents: [
      "Progresión en cavidades más técnicas.",
      "Nociones de instalación y gestión de roces.",
      "Resolución de situaciones comunes en equipo.",
    ],
    outcomes: [
      "Reconocer sus límites técnicos y los del grupo.",
      "Aplicar maniobras con mayor eficiencia.",
      "Participar en la planificación de una salida.",
    ],
    access: "E2 o equivalente, práctica reciente y valoración práctica.",
    assessment: "Evaluación práctica comparativa y plan de mejora individual.",
    next: "Monográficos bajo consulta.",
  },
];

export const cavingPractices = [
  {
    title: "Sesiones tutorizadas",
    description: "Práctica acompañada para afianzar lo aprendido entre niveles.",
  },
  {
    title: "Reciclaje de maniobras",
    description: "Repaso de procedimientos ya aprendidos para recuperar seguridad.",
  },
  {
    title: "Monográficos",
    description: "Posibles temas específicos (orientación, conservación…) según demanda.",
  },
] as const;

export const cavingPath = ["Experiencia guiada", "E1", "Prácticas", "E2", "Prácticas", "E3"] as const;

export const cavingWhatsapp = (topic: string) =>
  "https://wa.me/34685609542?text=" +
  encodeURIComponent(`¡Hola! Me interesa la formación de espeleología de NSL: ${topic}. ¿Podéis enviarme programa y disponibilidad?`);
