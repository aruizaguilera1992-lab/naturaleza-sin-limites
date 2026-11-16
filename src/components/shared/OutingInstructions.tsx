import { ShieldCheck, ListOrdered } from 'lucide-react';
import { instructionLines } from '@/lib/outingInstructions';

export function OutingInstructions({ rules, steps }: { rules?: string | null; steps?: string | null }) {
  const norms = instructionLines(rules);
  const sequence = instructionLines(steps);
  if (!norms.length && !sequence.length) return null;
  return (
    <div className="grid gap-5 border-t border-border pt-5 text-sm sm:grid-cols-2">
      {norms.length > 0 && <section className="min-w-0">
        <h2 className="flex items-center gap-2 font-heading font-bold text-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Normas</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">{norms.map((text, i) => <li key={i} className="break-words">{text}</li>)}</ul>
      </section>}
      {sequence.length > 0 && <section className="min-w-0">
        <h2 className="flex items-center gap-2 font-heading font-bold text-foreground"><ListOrdered className="h-4 w-4 text-primary" />Pasos a seguir</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">{sequence.map((text, i) => <li key={i} className="break-words">{text}</li>)}</ol>
      </section>}
    </div>
  );
}