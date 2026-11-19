import { ShieldCheck, ListOrdered } from 'lucide-react';
import { instructionLines } from '@/lib/outingInstructions';

const HEADING = 'flex items-center gap-2 font-heading font-bold text-foreground';

/**
 * Normas de participación. `className` permite colocarla como tarjeta dentro
 * de la rejilla de la ficha; sin ella conserva el formato de bloque simple.
 */
export function OutingRules({ rules, className }: { rules?: string | null; className?: string }) {
  const norms = instructionLines(rules);
  if (!norms.length) return null;
  return (
    <section className={className ?? 'min-w-0'}>
      <h2 className={HEADING}><ShieldCheck className="h-4 w-4 text-primary" />Normas</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{norms.map((text, i) => <li key={i} className="break-words">{text}</li>)}</ul>
    </section>
  );
}

/** Pasos a seguir, en el orden indicado. `className` permite darle el ancho completo de la ficha. */
export function OutingSteps({ steps, className }: { steps?: string | null; className?: string }) {
  const sequence = instructionLines(steps);
  if (!sequence.length) return null;
  return (
    <section className={className ?? 'min-w-0'}>
      <h2 className={HEADING}><ListOrdered className="h-4 w-4 text-primary" />Pasos a seguir</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">{sequence.map((text, i) => <li key={i} className="break-words">{text}</li>)}</ol>
    </section>
  );
}

/** Normas y pasos juntos, en dos columnas: se usa en fichas públicas y selectores. */
export function OutingInstructions({ rules, steps }: { rules?: string | null; steps?: string | null }) {
  const norms = instructionLines(rules);
  const sequence = instructionLines(steps);
  if (!norms.length && !sequence.length) return null;
  return (
    <div className="grid gap-5 border-t border-border pt-5 text-sm sm:grid-cols-2">
      <OutingRules rules={rules} />
      <OutingSteps steps={steps} />
    </div>
  );
}
