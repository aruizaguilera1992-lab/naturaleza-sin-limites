import { CalendarActivity } from './types';

// Helper to create dates for 2026
const d = (month: number, day: number, hour: number = 9, minute: number = 0) => 
  new Date(2026, month - 1, day, hour, minute);

export const calendarActivities: CalendarActivity[] = [
  // January 2026
  {
    id: 'ent-jan-1',
    date: d(1, 20, 19, 0),
    title: 'Fuerza de dedos y bloque',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1.5h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Sesión enfocada en el desarrollo de la fuerza de contacto y la técnica de bloque. Trabajaremos hangboard, campus y problemas específicos.',
      requirements: ['Ropa cómoda', 'Pies de gato propios'],
      equipment: ['Hangboard', 'Campus board', 'Muro de boulder'],
      physicalLevel: 'medio',
      technicalLevel: 'básico',
      notes: 'Calentamiento incluido. Traer toalla.'
    }
  },
  {
    id: 'ent-jan-2',
    date: d(1, 22, 19, 0),
    title: 'Core y movilidad funcional',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Trabajo de estabilidad central y flexibilidad específica para escalada y deportes verticales.',
      requirements: ['Esterilla propia opcional'],
      equipment: ['TRX', 'Anillas', 'Bandas elásticas'],
      physicalLevel: 'bajo',
      technicalLevel: 'iniciación'
    }
  },
  {
    id: 'fer-jan-1',
    date: d(1, 25, 8, 0),
    title: 'Vía Ferrata El Chorro',
    type: 'ferrata',
    time: '08:00',
    duration: '5h',
    location: 'El Chorro, Málaga',
    spots: 8,
    difficulty: 'K3',
    technicalInfo: {
      description: 'Espectacular ferrata junto al Caminito del Rey con vistas al desfiladero de los Gaitanes. Recorrido aéreo con puente tibetano.',
      requirements: ['Buena forma física', 'Sin vértigo severo', 'Mayores de 14 años'],
      equipment: ['Casco', 'Arnés', 'Disipador', 'Guantes'],
      physicalLevel: 'medio',
      technicalLevel: 'básico',
      notes: 'Material técnico incluido. Llevar agua y snack.'
    }
  },
  {
    id: 'ent-jan-3',
    date: d(1, 27, 19, 0),
    title: 'Técnica de rapel y maniobras',
    type: 'entrenamiento',
    time: '19:00',
    duration: '2h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Práctica de descenso con diferentes dispositivos, maniobras de paso de nudo y autorrescate básico.',
      requirements: ['Conocimientos básicos de cuerdas'],
      equipment: ['Cuerdas', 'Descensores', 'Bloqueadores'],
      physicalLevel: 'bajo',
      technicalLevel: 'intermedio'
    }
  },
  {
    id: 'bar-jan-1',
    date: d(1, 31, 9, 0),
    title: 'Barranco Río Verde',
    type: 'barranco',
    time: '09:00',
    duration: '6h',
    location: 'Otívar, Granada',
    spots: 6,
    difficulty: 'V3/A3/III',
    technicalInfo: {
      description: 'Uno de los barrancos acuáticos más bonitos de Andalucía. Toboganes naturales, saltos y rapeles en un entorno espectacular.',
      requirements: ['Saber nadar', 'Buena forma física', 'Experiencia previa recomendada'],
      equipment: ['Neopreno 5mm', 'Casco', 'Arnés', 'Descensor'],
      physicalLevel: 'alto',
      technicalLevel: 'intermedio',
      notes: 'Neopreno incluido. Agua a 14°C aprox.'
    }
  },
  
  // February 2026
  {
    id: 'fer-feb-1',
    date: d(2, 1, 8, 30),
    title: 'Vía Ferrata El Hacho',
    type: 'ferrata',
    time: '08:30',
    duration: '4h',
    location: 'Gaucín, Málaga',
    spots: 10,
    difficulty: 'K2',
    technicalInfo: {
      description: 'Ferrata de iniciación con vistas panorámicas al Estrecho de Gibraltar y África. Ideal para primeras experiencias.',
      requirements: ['Forma física básica', 'Mayores de 10 años'],
      equipment: ['Casco', 'Arnés', 'Disipador'],
      physicalLevel: 'bajo',
      technicalLevel: 'iniciación',
      notes: 'Perfecta para principiantes. Material incluido.'
    }
  },
  {
    id: 'ent-feb-1',
    date: d(2, 3, 19, 0),
    title: 'Resistencia en escalada',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1.5h',
    location: 'Rocódromo',
    technicalInfo: {
      description: 'Circuitos de resistencia específica. Trabajo de bombeo controlado y recuperación activa.',
      requirements: ['Nivel de escalada mínimo 5c'],
      equipment: ['Muro de escalada', 'Presas variadas'],
      physicalLevel: 'alto',
      technicalLevel: 'intermedio'
    }
  },
  {
    id: 'ent-feb-2',
    date: d(2, 5, 19, 0),
    title: 'Fuerza de tracción',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1.5h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Trabajo de dominadas, muscle-ups y ejercicios de tracción aplicados a la escalada.',
      equipment: ['Barra de dominadas', 'Anillas', 'Lastre'],
      physicalLevel: 'alto',
      technicalLevel: 'básico'
    }
  },
  {
    id: 'fer-feb-2',
    date: d(2, 7, 8, 0),
    title: 'Vía Ferrata Presa de los Caballeros',
    type: 'ferrata',
    time: '08:00',
    duration: '4h',
    location: 'Marbella, Málaga',
    spots: 8,
    difficulty: 'K3',
    technicalInfo: {
      description: 'Ferrata urbana con espectaculares vistas a la Costa del Sol. Incluye tirolina y puente.',
      requirements: ['Forma física media', 'Sin vértigo'],
      equipment: ['Casco', 'Arnés', 'Disipador', 'Guantes'],
      physicalLevel: 'medio',
      technicalLevel: 'básico'
    }
  },
  {
    id: 'fer-feb-3',
    date: d(2, 8, 8, 0),
    title: 'Vía Ferrata Doble de Ronda',
    type: 'ferrata',
    time: '08:00',
    duration: '6h',
    location: 'Ronda, Málaga',
    spots: 6,
    difficulty: 'K4',
    technicalInfo: {
      description: 'Combinación de dos ferratas con vistas al Tajo de Ronda. Recorrido técnico y muy aéreo.',
      requirements: ['Experiencia previa en ferratas', 'Buena forma física'],
      equipment: ['Casco', 'Arnés', 'Disipador', 'Guantes'],
      physicalLevel: 'alto',
      technicalLevel: 'intermedio',
      notes: 'Requiere experiencia previa. Jornada completa.'
    }
  },
  {
    id: 'ent-feb-3',
    date: d(2, 10, 19, 0),
    title: 'Técnica de pies en escalada',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1.5h',
    location: 'Rocódromo',
    technicalInfo: {
      description: 'Trabajo específico de colocación de pies, adherencia y transferencia de peso.',
      physicalLevel: 'bajo',
      technicalLevel: 'básico'
    }
  },
  {
    id: 'fer-feb-4',
    date: d(2, 14, 8, 0),
    title: 'Vía Ferrata Triple de Comares',
    type: 'ferrata',
    time: '08:00',
    duration: '7h',
    location: 'Comares, Málaga',
    spots: 6,
    difficulty: 'K5',
    technicalInfo: {
      description: 'Triple ferrata en el pueblo colgado de la Axarquía. Reto técnico con vistas a la costa y montaña.',
      requirements: ['Experiencia en ferratas K3+', 'Muy buena forma física', 'Sin vértigo'],
      equipment: ['Casco', 'Arnés', 'Disipador', 'Guantes', 'Frontal'],
      physicalLevel: 'muy alto',
      technicalLevel: 'avanzado',
      notes: 'Solo para experimentados. Jornada muy exigente.'
    }
  },
  {
    id: 'fer-feb-5',
    date: d(2, 15, 8, 30),
    title: 'Vía Ferrata El Turrión',
    type: 'ferrata',
    time: '08:30',
    duration: '4h',
    location: 'Ardales, Málaga',
    spots: 10,
    difficulty: 'K2',
    technicalInfo: {
      description: 'Ferrata corta y divertida ideal para iniciación. Vistas al embalse del Guadalhorce.',
      requirements: ['Forma física básica'],
      equipment: ['Casco', 'Arnés', 'Disipador'],
      physicalLevel: 'bajo',
      technicalLevel: 'iniciación'
    }
  },
  {
    id: 'ent-feb-4',
    date: d(2, 17, 19, 0),
    title: 'Yoga para escaladores',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Sesión de yoga adaptada a las necesidades de escaladores: caderas, hombros y core.',
      equipment: ['Esterilla'],
      physicalLevel: 'bajo',
      technicalLevel: 'iniciación'
    }
  },
  {
    id: 'bar-feb-1',
    date: d(2, 21, 9, 0),
    title: 'Barranco Puerto Ramos',
    type: 'barranco',
    time: '09:00',
    duration: '5h',
    location: 'Almuñécar, Granada',
    spots: 8,
    difficulty: 'V2/A2/II',
    technicalInfo: {
      description: 'Barranco seco con formaciones geológicas únicas. Ideal para practicar técnica sin agua.',
      requirements: ['Forma física media'],
      equipment: ['Casco', 'Arnés', 'Descensor'],
      physicalLevel: 'medio',
      technicalLevel: 'básico'
    }
  },
  {
    id: 'fer-feb-6',
    date: d(2, 22, 8, 0),
    title: 'Vía Ferrata Caminito del Rey',
    type: 'ferrata',
    time: '08:00',
    duration: '5h',
    location: 'Ardales, Málaga',
    spots: 8,
    difficulty: 'K3',
    technicalInfo: {
      description: 'La ferrata más emblemática de Málaga junto al famoso Caminito. Experiencia única.',
      requirements: ['Forma física media', 'Sin vértigo severo'],
      equipment: ['Casco', 'Arnés', 'Disipador'],
      physicalLevel: 'medio',
      technicalLevel: 'básico',
      notes: 'No confundir con la pasarela turística.'
    }
  },
  {
    id: 'ent-feb-5',
    date: d(2, 24, 19, 0),
    title: 'Entrenamiento de bloque',
    type: 'entrenamiento',
    time: '19:00',
    duration: '2h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Sesión libre de boulder con coaching técnico y propuestas de problemas.',
      physicalLevel: 'medio',
      technicalLevel: 'básico'
    }
  },
  {
    id: 'esp-feb-1',
    date: d(2, 26, 10, 0),
    title: 'Cueva del Tesoro Iniciación',
    type: 'espeleologia',
    time: '10:00',
    duration: '3h',
    location: 'Rincón de la Victoria, Málaga',
    spots: 8,
    difficulty: 'Horizontal',
    technicalInfo: {
      description: 'Visita espeleológica a una de las tres cuevas de origen marino del mundo. Formaciones únicas.',
      requirements: ['Sin claustrofobia', 'Ropa que se pueda ensuciar'],
      equipment: ['Casco con frontal', 'Mono espeleología'],
      physicalLevel: 'bajo',
      technicalLevel: 'iniciación',
      notes: 'Material proporcionado. Apto para todos los públicos.'
    }
  },
  {
    id: 'fer-feb-7',
    date: d(2, 28, 8, 0),
    title: 'Vía Ferrata Triple de Loja',
    type: 'ferrata',
    time: '08:00',
    duration: '6h',
    location: 'Loja, Granada',
    spots: 6,
    difficulty: 'K4',
    technicalInfo: {
      description: 'Tres ferratas consecutivas en el Infierno de Loja. Paisaje kárstico impresionante.',
      requirements: ['Experiencia previa', 'Buena forma física'],
      equipment: ['Casco', 'Arnés', 'Disipador', 'Guantes'],
      physicalLevel: 'alto',
      technicalLevel: 'intermedio'
    }
  },
  
  // March 2026
  {
    id: 'fer-mar-1',
    date: d(3, 1, 8, 30),
    title: 'Vía Ferrata Zafarraya',
    type: 'ferrata',
    time: '08:30',
    duration: '4h',
    location: 'Zafarraya, Granada',
    spots: 10,
    difficulty: 'K3',
    technicalInfo: {
      description: 'Ferrata con vistas al Boquete de Zafarraya y la costa tropical. Tramos muy aéreos.',
      requirements: ['Forma física media'],
      equipment: ['Casco', 'Arnés', 'Disipador'],
      physicalLevel: 'medio',
      technicalLevel: 'básico'
    }
  },
  {
    id: 'ent-mar-1',
    date: d(3, 3, 19, 0),
    title: 'Fuerza de dedos avanzado',
    type: 'entrenamiento',
    time: '19:00',
    duration: '1.5h',
    location: 'Sala Vértigo',
    technicalInfo: {
      description: 'Protocolos avanzados de hangboard: repeaters, max hangs y ejercicios con lastre.',
      requirements: ['Experiencia mínima 1 año escalando', 'Sin lesiones de dedos'],
      equipment: ['Hangboard', 'Poleas', 'Lastre'],
      physicalLevel: 'muy alto',
      technicalLevel: 'avanzado'
    }
  },
  {
    id: 'esc-mar-1',
    date: d(3, 7, 8, 0),
    title: 'Escalada en El Torcal',
    type: 'escalada',
    time: '08:00',
    duration: '6h',
    location: 'El Torcal, Antequera',
    spots: 6,
    difficulty: '5a-6b',
    technicalInfo: {
      description: 'Jornada de escalada deportiva en el paisaje kárstico del Torcal. Vías de todos los niveles.',
      requirements: ['Nivel mínimo 5a', 'Conocer aseguramiento'],
      equipment: ['Cuerda', 'Cintas express', 'Casco', 'Pies de gato'],
      physicalLevel: 'medio',
      technicalLevel: 'básico',
      notes: 'Material de escalada incluido.'
    }
  },
  {
    id: 'bar-mar-1',
    date: d(3, 8, 9, 0),
    title: 'Barranco Almanchares',
    type: 'barranco',
    time: '09:00',
    duration: '5h',
    location: 'Canillas de Albaida, Málaga',
    spots: 8,
    difficulty: 'V2/A3/II',
    technicalInfo: {
      description: 'Barranco con pozas y saltos en un entorno subtropical. Muy lúdico y refrescante.',
      requirements: ['Saber nadar', 'Forma física media'],
      equipment: ['Neopreno', 'Casco', 'Arnés'],
      physicalLevel: 'medio',
      technicalLevel: 'básico'
    }
  }
];

export const getActivitiesForDate = (date: Date): CalendarActivity[] => {
  return calendarActivities.filter(activity => 
    activity.date.getFullYear() === date.getFullYear() &&
    activity.date.getMonth() === date.getMonth() &&
    activity.date.getDate() === date.getDate()
  );
};

export const getActivitiesForWeek = (startDate: Date): CalendarActivity[] => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  return calendarActivities.filter(activity => 
    activity.date >= startDate && activity.date < endDate
  ).sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getActivitiesForMonth = (year: number, month: number): CalendarActivity[] => {
  return calendarActivities.filter(activity => 
    activity.date.getFullYear() === year && activity.date.getMonth() === month
  ).sort((a, b) => a.date.getTime() - b.date.getTime());
};
