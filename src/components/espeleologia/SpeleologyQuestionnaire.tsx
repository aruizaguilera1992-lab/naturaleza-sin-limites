import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Clock, Mountain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionnaireProps {
  onComplete: (answers: FilterAnswers) => void;
}

export interface FilterAnswers {
  nivel: string;
  tipo: string;
  duracion: string;
  provincia: string;
}

interface Question {
  id: keyof FilterAnswers;
  question: string;
  icon: React.ElementType;
  options: { value: string; label: string; description?: string; warning?: boolean }[];
}

const questions: Question[] = [
  {
    id: 'nivel',
    question: '¿Tienes experiencia en espeleología?',
    icon: Mountain,
    options: [
      { value: 'ninguna', label: 'Ninguna', description: 'Es mi primera vez bajo tierra' },
      { value: 'iniciacion', label: 'Iniciación', description: 'He visitado 1-3 cuevas horizontales' },
      { value: 'intermedio', label: 'Intermedio', description: 'Tengo curso de iniciación' },
      { value: 'avanzado', label: 'Avanzado', description: 'Domino técnicas verticales' },
      { value: 'experto', label: 'Experto', description: 'Federado o con titulación' },
    ],
  },
  {
    id: 'tipo',
    question: '¿Qué tipo de cavidad prefieres?',
    icon: Mountain,
    options: [
      { value: 'horizontal', label: 'Cueva horizontal', description: 'Caminar, sin cuerdas' },
      { value: 'vertical', label: 'Sima vertical', description: 'Requiere técnicas de cuerda', warning: true },
      { value: 'mixta', label: 'Cavidad mixta', description: 'Horizontal + algún rapel', warning: true },
      { value: 'cualquiera', label: 'La que me recomiendes', description: 'Según mi nivel' },
    ],
  },
  {
    id: 'duracion',
    question: '¿Cuánto tiempo tienes disponible?',
    icon: Clock,
    options: [
      { value: 'media', label: 'Media jornada', description: '2-4 horas' },
      { value: 'completa', label: 'Jornada completa', description: '5-8 horas' },
      { value: 'larga', label: 'Jornada larga', description: '+8 horas' },
      { value: 'curso', label: 'Curso de 2 días', description: 'Formación completa' },
    ],
  },
  {
    id: 'provincia',
    question: '¿Zona preferida?',
    icon: MapPin,
    options: [
      { value: 'malaga', label: 'Málaga', description: 'Nerja, Ardales, El Torcal' },
      { value: 'granada', label: 'Granada', description: 'Sierra de Huétor, Harana' },
      { value: 'almeria', label: 'Almería', description: 'Karst de Sorbas' },
      { value: 'cualquiera', label: 'Cualquiera', description: 'Toda Andalucía' },
    ],
  },
];

export function SpeleologyQuestionnaire({ onComplete }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<FilterAnswers>>({});
  const [showCourseWarning, setShowCourseWarning] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Check if user selects vertical/mixta without course level
    if (currentQuestion.id === 'tipo' && (value === 'vertical' || value === 'mixta')) {
      const nivel = answers.nivel;
      if (nivel === 'ninguna' || nivel === 'iniciacion') {
        setShowCourseWarning(true);
        return;
      }
    }

    setShowCourseWarning(false);
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      onComplete(newAnswers as FilterAnswers);
    }
  };

  const handleContinueWithHorizontal = () => {
    const newAnswers = { ...answers, tipo: 'horizontal' };
    setAnswers(newAnswers);
    setShowCourseWarning(false);
    setTimeout(() => setCurrentStep(currentStep + 1), 300);
  };

  const handleBack = () => {
    if (showCourseWarning) {
      setShowCourseWarning(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const scrollToCourse = () => {
    const courseSection = document.getElementById('curso-iniciacion');
    if (courseSection) {
      courseSection.scrollIntoView({ behavior: 'smooth' });
    }
    setShowCourseWarning(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Paso {currentStep + 1} de {questions.length}</span>
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

      <AnimatePresence mode="wait">
        {showCourseWarning ? (
          <motion.div
            key="warning"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-2xl mb-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Curso de Iniciación requerido
              </h3>
              <p className="text-muted-foreground mb-6">
                Para acceder a simas verticales o cavidades mixtas necesitas el <strong className="text-primary">Curso de Iniciación a la Espeleología</strong>. 
                Te mostraremos primero cuevas horizontales, o puedes inscribirte al curso.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleContinueWithHorizontal}
                  className="border-primary/50"
                >
                  Ver cuevas horizontales
                </Button>
                <Button onClick={scrollToCourse} className="bg-primary hover:bg-primary/90">
                  Ver Curso de Iniciación
                </Button>
              </div>
            </div>
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <currentQuestion.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all
                    ${answers[currentQuestion.id] === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{option.label}</span>
                        {option.warning && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      {option.description && (
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Back button */}
            {currentStep > 0 && (
              <div className="mt-8 text-center">
                <Button variant="ghost" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Pregunta anterior
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
