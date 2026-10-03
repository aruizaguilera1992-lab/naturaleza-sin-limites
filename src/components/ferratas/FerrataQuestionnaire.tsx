import { Mountain, Eye, Clock, Sparkles } from 'lucide-react';
import { AdventureQuestionnaire } from '@/components/shared/AdventureQuestionnaire';
import type { NivelExperiencia, ToleranciaVertigo, DuracionPreferida, ElementoPreferido } from '@/data/ferratas';

interface QuestionnaireAnswers {
  nivel: NivelExperiencia | null;
  vertigo: ToleranciaVertigo | null;
  duracion: DuracionPreferida | null;
  elemento: ElementoPreferido | null;
}

interface FerrataQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onReset: () => void;
}

const questions = [
  {
    id: 'nivel',
    icon: Mountain,
    title: '¿Cuál es tu nivel de experiencia?',
    options: [
      { value: 'ninguna', label: 'Primera aventura', description: 'Nunca he hecho una ferrata' },
      { value: 'iniciacion', label: 'Iniciación', description: 'He hecho 1–2 ferratas' },
      { value: 'intermedio', label: 'Con experiencia', description: 'Estoy cómodo en altura' },
      { value: 'avanzado', label: 'Nivel avanzado', description: 'Domino las técnicas' },
    ],
  },
  {
    id: 'vertigo',
    icon: Eye,
    title: '¿Cómo llevas el vértigo?',
    options: [
      { value: 'sin-problemas', label: 'Disfruto la altura' },
      { value: 'tolerable', label: 'La llevo bien', description: 'Con algo de respeto' },
      { value: 'me-cuesta', label: 'Me impone', description: 'Quiero probar con calma' },
      { value: 'evitar', label: 'Prefiero poca altura' },
    ],
  },
  {
    id: 'duracion',
    icon: Clock,
    title: '¿Cuánto quieres que dure?',
    options: [
      { value: 'corta', label: 'Corta', description: '2–3 horas' },
      { value: 'media', label: 'Media', description: '3–5 horas' },
      { value: 'larga', label: 'Larga', description: '5–8 horas' },
      { value: 'jornada-completa', label: 'Jornada completa', description: 'Con senderismo' },
    ],
  },
  {
    id: 'elemento',
    icon: Sparkles,
    title: '¿Qué te apetece encontrar?',
    options: [
      { value: 'puentes', label: 'Puentes tibetanos' },
      { value: 'tirolinas', label: 'Tirolinas' },
      { value: 'desplomes', label: 'Desplomes', description: 'Tramos de fuerza' },
      { value: 'vistas', label: 'Grandes vistas' },
      { value: 'todo', label: 'Un poco de todo' },
    ],
  },
];

export function FerrataQuestionnaire({ onComplete, onReset }: FerrataQuestionnaireProps) {
  return (
    <AdventureQuestionnaire<QuestionnaireAnswers>
      activityLabel="Vía ferrata"
      questions={questions}
      initialAnswers={{ nivel: null, vertigo: null, duracion: null, elemento: null }}
      onComplete={onComplete}
      onReset={onReset}
    />
  );
}
