import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mountain, Clock, Compass, MapPin, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    title: '¿Cuál es tu nivel de escalada?',
    subtitle: 'Selecciona el que mejor te represente',
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
    title: '¿Qué tipo de escalada prefieres?',
    subtitle: 'Según el estilo de equipamiento',
    icon: Compass,
    options: [
      { value: 'deportiva', label: 'Deportiva', description: 'Vías con chapas fijas' },
      { value: 'clasica', label: 'Clásica', description: 'Fisureros y friends' },
      { value: 'mixta', label: 'Mixta', description: 'Ambos estilos' },
      { value: 'cualquiera', label: 'Sin preferencia', description: 'Me adapto a todo' },
    ],
  },
  {
    id: 'duracion',
    title: '¿Qué duración buscas?',
    subtitle: 'El tiempo que quieres dedicar',
    icon: Clock,
    options: [
      { value: 'media', label: 'Media jornada', description: '3-4 horas' },
      { value: 'completa', label: 'Jornada completa', description: '6-8 horas' },
      { value: 'curso', label: 'Curso varios días', description: 'Formación intensiva' },
    ],
  },
  {
    id: 'provincia',
    title: '¿Zona preferida?',
    subtitle: 'Dónde te gustaría escalar',
    icon: MapPin,
    options: [
      { value: 'Málaga', label: 'Málaga', description: 'El Chorro, Ardales' },
      { value: 'Granada', label: 'Granada', description: 'Cahorros, Sierra de Huétor' },
      { value: 'Córdoba', label: 'Córdoba', description: 'Los Vados' },
      { value: 'Cádiz', label: 'Cádiz', description: 'Grazalema, Zaframagón' },
      { value: 'cualquiera', label: 'Cualquiera', description: 'Toda Andalucía' },
    ],
  },
];

export function ClimbingQuestionnaire({ onComplete, onReset }: ClimbingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    nivel: '',
    tipo: '',
    duracion: '',
    provincia: '',
  });

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({ nivel: '', tipo: '', duracion: '', provincia: '' });
    onReset();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Pregunta {currentStep + 1} de {questions.length}</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          {/* Question Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <currentQuestion.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground">
                {currentQuestion.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {currentQuestion.subtitle}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                  answers[currentQuestion.id as keyof QuestionnaireAnswers] === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </motion.button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={handleReset}
              className="gap-2 text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Empezar de nuevo
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
