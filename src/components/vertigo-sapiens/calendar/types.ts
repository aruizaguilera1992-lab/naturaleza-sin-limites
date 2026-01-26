export type CalendarActivityType = 'ferrata' | 'barranco' | 'escalada' | 'espeleologia' | 'entrenamiento';

export interface CalendarActivity {
  id: string;
  date: Date;
  title: string;
  type: CalendarActivityType;
  time: string;
  duration: string;
  location: string;
  spots?: number;
  difficulty?: string;
  technicalInfo?: {
    description: string;
    requirements?: string[];
    equipment?: string[];
    physicalLevel?: 'bajo' | 'medio' | 'alto' | 'muy alto';
    technicalLevel?: 'iniciación' | 'básico' | 'intermedio' | 'avanzado';
    notes?: string;
  };
}

export type CalendarViewMode = 'day' | 'week' | 'month';

export const activityTypeConfig: Record<CalendarActivityType, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  ferrata: {
    label: 'Vía Ferrata',
    color: 'text-primary',
    bgColor: 'bg-primary',
    icon: '🧗'
  },
  barranco: {
    label: 'Barranquismo',
    color: 'text-accent',
    bgColor: 'bg-accent',
    icon: '🌊'
  },
  escalada: {
    label: 'Escalada',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    icon: '🪨'
  },
  espeleologia: {
    label: 'Espeleología',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    icon: '🦇'
  },
  entrenamiento: {
    label: 'Entrenamiento',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    icon: '💪'
  }
};
