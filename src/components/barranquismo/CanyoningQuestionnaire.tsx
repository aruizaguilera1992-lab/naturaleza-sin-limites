import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Mountain, Clock, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
    subtitle: 'Esto nos ayudará a recomendarte barrancos adecuados a tu técnica',
    options: [
      { value: 'principiante', label: 'Principiante', description: 'Primera vez o pocas experiencias' },
      { value: 'intermedio', label: 'Intermedio', description: 'Varios barrancos, manejo básico de cuerda' },
      { value: 'avanzado', label: 'Avanzado', description: 'Experiencia sólida, técnicas avanzadas' },
      { value: 'experto', label: 'Experto', description: 'Barranquista experimentado, cualquier dificultad' },
    ],
  },
  {
    id: 'duracion',
    icon: Clock,
    title: '¿Cuánto tiempo tienes disponible?',
    subtitle: 'Incluye aproximación, descenso y retorno',
    options: [
      { value: 'medio-dia', label: 'Medio día', description: '2-4 horas de actividad' },
      { value: 'dia-completo', label: 'Día completo', description: '4-8 horas de actividad' },
      { value: 'jornada-larga', label: 'Jornada larga', description: 'Más de 8 horas' },
    ],
  },
  {
    id: 'caracteristica',
    icon: Sparkles,
    title: '¿Qué te gustaría encontrar en el descenso?',
    subtitle: 'Cada barranco tiene su propia personalidad',
    options: [
      { value: 'rapeles', label: 'Rapeles', description: 'Descensos verticales con cuerda' },
      { value: 'saltos', label: 'Saltos', description: 'Saltos a pozas (siempre opcionales)' },
      { value: 'toboganes', label: 'Toboganes', description: 'Deslizamientos naturales' },
      { value: 'nado', label: 'Nado', description: 'Tramos acuáticos y pozas' },
      { value: 'todo', label: 'De todo un poco', description: 'Experiencia completa' },
    ],
  },
  {
    id: 'provincia',
    icon: MapPin,
    title: '¿Zona preferida?',
    subtitle: 'Andalucía tiene barrancos espectaculares en toda su geografía',
    options: [
      { value: 'Málaga', label: 'Málaga', description: 'Costa y Serranía de Ronda' },
      { value: 'Granada', label: 'Granada', description: 'Alpujarra y Sierra Nevada' },
      { value: 'Cádiz', label: 'Cádiz', description: 'Sierra de Grazalema' },
      { value: 'cualquiera', label: 'Cualquiera', description: 'Estoy abierto a desplazarme' },
    ],
  },
];

export function CanyoningQuestionnaire({ onComplete, onReset }: CanyoningQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    nivel: null,
    duracion: null,
    caracteristica: null,
    provincia: null,
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
      duracion: null,
      caracteristica: null,
      provincia: null,
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
