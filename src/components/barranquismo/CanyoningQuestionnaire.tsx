import { Mountain, Clock, Sparkles, MapPin } from 'lucide-react';
import { AdventureQuestionnaire } from '@/components/shared/AdventureQuestionnaire';
import type { NivelExperiencia, DuracionPreferida, Caracteristica, Provincia } from '@/data/barrancos';

interface QuestionnaireAnswers {
  nivel: NivelExperiencia | null;
  duracion: DuracionPreferida | null;
  caracteristica: Caracteristica | null;
  provincia: Provincia | null;
}

interface CanyoningQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onReset: () => void;
}

const questions = [
  {
    id: 'nivel',
    icon: Mountain,
    title: '¿Cuál es tu nivel de experiencia?',
    options: [
      { value: 'principiante', label: 'Primera aventura', description: 'Primera vez o poca experiencia' },
      { value: 'intermedio', label: 'Con experiencia', description: 'Ya he hecho varios barrancos' },
      { value: 'avanzado', label: 'Nivel avanzado', description: 'Domino las técnicas habituales' },
      { value: 'experto', label: 'Nivel experto', description: 'Busco máxima dificultad' },
    ],
  },
  {
    id: 'duracion',
    icon: Clock,
    title: '¿Cuánto quieres que dure?',
    options: [
      { value: 'medio-dia', label: 'Medio día', description: '2–4 horas' },
      { value: 'dia-completo', label: 'Día completo', description: '4–8 horas' },
      { value: 'jornada-larga', label: 'Jornada larga', description: 'Más de 8 horas' },
    ],
  },
  {
    id: 'caracteristica',
    icon: Sparkles,
    title: '¿Qué te apetece vivir?',
    options: [
      { value: 'rapeles', label: 'Rapeles', description: 'Verticalidad y cuerda' },
      { value: 'saltos', label: 'Saltos', description: 'Siempre opcionales' },
      { value: 'toboganes', label: 'Toboganes', description: 'Deslizamientos naturales' },
      { value: 'nado', label: 'Agua y pozas', description: 'Tramos de nado' },
      { value: 'todo', label: 'Un poco de todo' },
    ],
  },
  {
    id: 'provincia',
    icon: MapPin,
    title: '¿Dónde quieres la aventura?',
    options: [
      { value: 'Málaga', label: 'Málaga', description: 'Costa y Serranía de Ronda' },
      { value: 'Granada', label: 'Granada', description: 'Alpujarra y Sierra Nevada' },
      { value: 'Cádiz', label: 'Cádiz', description: 'Sierra de Grazalema' },
      { value: 'cualquiera', label: 'Sorpréndeme', description: 'Cualquier zona' },
    ],
  },
];

export function CanyoningQuestionnaire({ onComplete, onReset }: CanyoningQuestionnaireProps) {
  return (
    <AdventureQuestionnaire<QuestionnaireAnswers>
      activityLabel="Barranquismo"
      questions={questions}
      initialAnswers={{ nivel: null, duracion: null, caracteristica: null, provincia: null }}
      onComplete={onComplete}
      onReset={onReset}
    />
  );
}
