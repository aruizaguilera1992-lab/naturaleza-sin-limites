import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, RotateCcw, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AdventureQuestion {
  id: string;
  title: string;
  icon: LucideIcon;
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

interface AdventureQuestionnaireProps<Answers extends Record<string, string | null>> {
  activityLabel: string;
  questions: AdventureQuestion[];
  initialAnswers: Answers;
  onComplete: (answers: Answers) => void;
  onReset: () => void;
  autoAdvance?: boolean;
}

export function AdventureQuestionnaire<Answers extends Record<string, string | null>>({
  activityLabel,
  questions,
  initialAnswers,
  onComplete,
  onReset,
  autoAdvance = false,
}: AdventureQuestionnaireProps<Answers>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const currentQuestion = questions[currentStep];

  if (!currentQuestion) return null;

  const answerKey = currentQuestion.id as keyof Answers;
  const selectedValue = answers[answerKey];
  const isLastQuestion = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const nextAnswers = { ...answers, [currentQuestion.id]: value } as Answers;
    setAnswers(nextAnswers);

    if (!autoAdvance) return;

    window.setTimeout(() => {
      if (isLastQuestion) onComplete(nextAnswers);
      else setCurrentStep((step) => step + 1);
    }, 220);
  };

  const handleNext = () => {
    if (!selectedValue) return;
    if (isLastQuestion) onComplete(answers);
    else setCurrentStep((step) => step + 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers(initialAnswers);
    onReset();
  };

  const QuestionIcon = currentQuestion.icon;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-7 sm:mb-9">
        <div className="mb-3 flex items-end justify-between gap-4">
          <span className="font-heading text-xs font-bold uppercase text-primary sm:text-sm">
            {activityLabel}
          </span>
          <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
            {currentStep + 1} / {questions.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className="mb-7 flex flex-col items-center text-center sm:mb-9">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-14 sm:w-14">
              <QuestionIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            </div>
            <h3 className="max-w-lg font-heading text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
              {currentQuestion.title}
            </h3>
          </div>

          <div className="space-y-3" role="radiogroup" aria-label={currentQuestion.title}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedValue === option.value;

              return (
                <motion.div key={option.value} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleAnswer(option.value)}
                    className={`group h-auto min-h-[4.5rem] w-full justify-start rounded-lg border-2 px-4 py-3 text-left normal-case tracking-normal sm:min-h-20 sm:px-5 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground shadow-glow'
                        : 'border-border bg-card text-foreground hover:border-primary/70 hover:bg-muted/50'
                    }`}
                  >
                    <span className={`mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground group-hover:text-primary'
                    }`}>
                      {isSelected ? <Check className="h-5 w-5" aria-hidden="true" /> : <ChevronRight className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-base font-bold leading-tight sm:text-lg">{option.label}</span>
                      {option.description && (
                        <span className="mt-1 block font-sans text-sm font-normal leading-snug text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3 sm:mt-9">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              disabled={currentStep === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Atrás
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" onClick={handleReset} aria-label="Empezar de nuevo" title="Empezar de nuevo">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
              {!autoAdvance && (
                <Button type="button" variant="hero" onClick={handleNext} disabled={!selectedValue} className="gap-1.5">
                  {isLastQuestion ? 'Ver resultados' : 'Siguiente'}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}