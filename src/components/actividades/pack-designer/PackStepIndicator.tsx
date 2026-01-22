import { cn } from '@/lib/utils';

interface PackStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function PackStepIndicator({ currentStep, totalSteps, labels }: PackStepIndicatorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              index + 1 <= currentStep 
                ? "bg-primary" 
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">PASO {currentStep} DE {totalSteps}</span>
        <br />
        {labels[currentStep - 1]}
      </div>
    </div>
  );
}
