import { Mountain, Clock, Compass, MapPin } from 'lucide-react';
import { AdventureQuestionnaire } from '@/components/shared/AdventureQuestionnaire';

interface QuestionnaireAnswers {
  nivel: string;
  tipo: string;
  duracion: string;
  provincia: string;
}

interface ClimbingQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onReset: () => void;
}

const questions = [
  {
    id: 'nivel',
    title: '¿Cuál es tu nivel?',
    icon: Mountain,
    options: [
      { value: 'principiante', label: 'Principiante', description: 'Nunca he escalado' },
      { value: 'iniciacion', label: 'Iniciación', description: '5a - 6a' },
      { value: 'intermedio', label: 'Intermedio', description: '6a+ - 6c+' },
      { value: 'avanzado', label: 'Avanzado', description: '7a+' },
      { value: 'experto', label: 'Experto', description: '7c+ o más' },
    ],
  },
  {
    id: 'tipo',
    title: '¿Cómo quieres escalar?',
    icon: Compass,
    options: [
      { value: 'deportiva', label: 'Escalada deportiva', description: 'Vías equipadas' },
      { value: 'clasica', label: 'Escalada clásica', description: 'Protecciones móviles' },
      { value: 'mixta', label: 'Combinada', description: 'Ambos estilos' },
      { value: 'cualquiera', label: 'Sorpréndeme', description: 'Sin preferencia' },
    ],
  },
  {
    id: 'duracion',
    title: '¿Cuánto quieres que dure?',
    icon: Clock,
    options: [
      { value: 'media', label: 'Media jornada', description: '3-4 horas' },
      { value: 'completa', label: 'Jornada completa', description: '6-8 horas' },
      { value: 'curso', label: 'Varios días', description: 'Formación intensiva' },
    ],
  },
  {
    id: 'provincia',
    title: '¿Dónde quieres escalar?',
    icon: MapPin,
    options: [
      { value: 'Málaga', label: 'Málaga', description: 'El Chorro, Ardales' },
      { value: 'Granada', label: 'Granada', description: 'Cahorros, Sierra de Huétor' },
      { value: 'Córdoba', label: 'Córdoba', description: 'Los Vados' },
      { value: 'Cádiz', label: 'Cádiz', description: 'Grazalema, Zaframagón' },
      { value: 'cualquiera', label: 'Sorpréndeme', description: 'Cualquier zona' },
    ],
  },
];

export function ClimbingQuestionnaire({ onComplete, onReset }: ClimbingQuestionnaireProps) {
  return (
    <AdventureQuestionnaire<QuestionnaireAnswers>
      activityLabel="Escalada"
      questions={questions}
      initialAnswers={{ nivel: '', tipo: '', duracion: '', provincia: '' }}
      onComplete={onComplete}
      onReset={onReset}
      autoAdvance
    />
  );
}
