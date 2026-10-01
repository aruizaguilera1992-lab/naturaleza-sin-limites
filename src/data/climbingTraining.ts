export interface ClimbingLevel {
  code: "E1" | "E2" | "E3";
  title: string;
  duration: string;
  outcomes: string[];
  contents: string[];
  access: string;
  assessment: string;
  next: string;
}

export const climbingLevels: ClimbingLevel[] = [
  {
    code: "E1",
    title: "Iniciación a la escalada deportiva",
    duration: "16 h · 2 jornadas",
    outcomes: [
      "Preparar y comprobar el equipo con supervisión.",
      "Comunicarse y participar en una cordada supervisada.",
      "Aplicar movimientos básicos de pies, equilibrio y desplazamiento.",
    ],
    contents: [
      "Equipo, encordamiento y comprobaciones.",
      "Comunicación, aseguramiento y descenso supervisados.",
      "Pies, equilibrio y movimiento.",
    ],
    access: "Sin experiencia previa. Incluye valoración inicial.",
    assessment: "Práctica de comprobaciones, participación en cordada y técnica básica.",
    next: "Prácticas tutorizadas y E2.",
  },
  {
    code: "E2",
    title: "Escalada de primero y consolidación",
    duration: "16–20 h",
    outcomes: [
      "Progresar de primero en vías adecuadas bajo evaluación.",
      "Asegurar con protocolos consistentes.",
      "Planificar una sesión según nivel y condiciones.",
    ],
    contents: [
      "Progresión de primero, chapaje y manejo de cuerda.",
      "Aseguramiento adaptado y lectura de vías.",
      "Finalización en escenarios definidos.",
    ],
    access: "E1 superado o evaluación práctica equivalente.",
    assessment: "Evaluación práctica de progresión, aseguramiento y planificación.",
    next: "Prácticas tutorizadas y E3.",
  },
  {
    code: "E3",
    title: "Perfeccionamiento gestual y táctico",
    duration: "20–24 h repartidas",
    outcomes: [
      "Reconocer limitaciones técnicas y tácticas.",
      "Mejorar la eficiencia de movimiento y la toma de decisiones.",
      "Aplicar un plan de mejora medible.",
    ],
    contents: [
      "Análisis del movimiento, economía del esfuerzo y reposos.",
      "Lectura de secuencias y gestión de intentos.",
      "Preparación mental y revisión de seguridad.",
    ],
    access: "E2 o equivalente, experiencia reciente y valoración práctica.",
    assessment: "Evaluación comparativa y elaboración de un plan individual.",
    next: "Especializaciones bajo consulta.",
  },
];

export const climbingPractices = [
  {
    title: "Técnica gestual",
    description: "Observación y tareas concretas para ganar precisión, equilibrio y economía de esfuerzo.",
  },
  {
    title: "Cordada tutorizada",
    description: "Práctica acompañada de comunicación, comprobaciones y dinámica de cordada.",
  },
  {
    title: "Reciclaje de maniobras",
    description: "Revisión práctica de procedimientos ya aprendidos para recuperar seguridad y consistencia.",
  },
] as const;

export const climbingPath = ["Experiencia guiada", "E1", "Prácticas", "E2", "Prácticas", "E3"] as const;
