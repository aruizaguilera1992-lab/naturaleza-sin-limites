import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Mountain, Eye, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
    subtitle: 'Esto nos ayudará a recomendarte ferratas adecuadas',
    options: [
      { value: 'ninguna', label: 'Ninguna', description: 'Es mi primera vez en una vía ferrata' },
      { value: 'iniciacion', label: 'Iniciación', description: 'He hecho 1-2 ferratas' },
      { value: 'intermedio', label: 'Intermedio', description: 'Varias ferratas, cómodo en altura' },
      { value: 'avanzado', label: 'Avanzado', description: 'Domino técnicas, alta exposición' },
    ],
  },
  {
    id: 'vertigo',
    icon: Eye,
    title: '¿Cómo llevas el vértigo?',
    subtitle: 'Las ferratas tienen exposición al vacío, es importante saberlo',
    options: [
      { value: 'sin-problemas', label: 'Sin problemas', description: 'Me encanta la altura' },
      { value: 'tolerable', label: 'Tolerable', description: 'Un poco de respeto, pero puedo' },
      { value: 'me-cuesta', label: 'Me cuesta', description: 'Quiero intentarlo aunque me dé miedo' },
      { value: 'evitar', label: 'Prefiero evitar', description: 'Busco poca exposición' },
    ],
  },
  {
    id: 'duracion',
    icon: Clock,
    title: '¿Qué duración buscas?',
    subtitle: 'Incluye aproximación y tiempo en la ferrata',
    options: [
      { value: 'corta', label: 'Corta (2-3h)', description: 'Experiencia rápida pero intensa' },
      { value: 'media', label: 'Media (3-5h)', description: 'Recorrido completo' },
      { value: 'larga', label: 'Larga (5-8h)', description: 'Aventura de día completo' },
      { value: 'jornada-completa', label: 'Jornada completa', description: 'Con trekking incluido' },
    ],
  },
  {
    id: 'elemento',
    icon: Sparkles,
    title: '¿Qué te gustaría encontrar?',
    subtitle: 'Cada ferrata tiene elementos especiales',
    options: [
      { value: 'puentes', label: 'Puentes tibetanos', description: 'Puentes colgantes sobre el vacío' },
      { value: 'tirolinas', label: 'Tirolinas', description: 'Descensos aéreos en cable' },
      { value: 'desplomes', label: 'Desplomes y techos', description: 'Tramos técnicos con fuerza' },
      { value: 'vistas', label: 'Vistas panorámicas', description: 'Paisajes espectaculares' },
      { value: 'todo', label: 'Todo un poco', description: 'Experiencia completa' },
    ],
  },
];

export function FerrataQuestionnaire({ onComplete, onReset }: FerrataQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    nivel: null,
    vertigo: null,
    duracion: null,
    elemento: null,
  });

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion.id as keyof QuestionnaireAnswers] !== null;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({
      nivel: null,
      vertigo: null,
      duracion: null,
      elemento: null,
    });
    onReset();
  };

  const Icon = currentQuestion.icon;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Pregunta {currentStep + 1} de {questions.length}</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Empezar de nuevo
          </button>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-adventure-green"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground">
                {currentQuestion.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.subtitle}
              </p>
            </div>
          </div>

          <RadioGroup
            value={answers[currentQuestion.id as keyof QuestionnaireAnswers] || ''}
            onValueChange={handleAnswer}
            className="space-y-3 mt-6"
          >
            {currentQuestion.options.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Label
                  htmlFor={option.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[currentQuestion.id as keyof QuestionnaireAnswers] === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div>
                    <span className="font-medium text-foreground">{option.label}</span>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2"
            >
              {isLastQuestion ? 'Ver resultados' : 'Siguiente'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
