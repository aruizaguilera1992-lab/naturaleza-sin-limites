import { Baby, Gauge, Mountain, Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const FITNESS: Record<string, number> = { básica: 1, basica: 1, media: 2, alta: 3 };

function Meter({ value }: { value: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[1, 2, 3].map((n) => <span key={n} className={cn('h-1.5 w-4 rounded-full', n <= value ? 'bg-primary' : 'bg-muted-foreground/25')} />)}
    </div>
  );
}

/** Fila de indicadores visuales (nivel, edad, forma física, experiencia) con el mínimo texto. */
export function LevelVisualStrip({ level, minAge, fitness, experience, className }: {
  level: number; minAge: number; fitness: string; experience: boolean; className?: string;
}) {
  const fit = FITNESS[fitness.toLowerCase()] ?? 1;
  const tiles = [
    { icon: Mountain, label: 'Nivel', value: <Meter value={Math.min(3, Math.max(1, level))} />, sr: `Nivel ${level} de 3` },
    { icon: Baby, label: 'Edad', value: <span className="font-heading text-lg font-extrabold text-foreground">+{minAge}</span>, sr: `Desde ${minAge} años` },
    { icon: Gauge, label: 'Físico', value: <Meter value={fit} />, sr: `Condición física ${fitness}` },
    { icon: experience ? Award : Sparkles, label: experience ? 'Con experiencia' : 'Sin experiencia', value: null, sr: experience ? 'Requiere experiencia previa' : 'No requiere experiencia previa' },
  ];
  return (
    <ul className={cn('grid grid-cols-4 gap-2', className)}>
      {tiles.map(({ icon: Icon, label, value, sr }) => (
        <li key={label} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/40 px-1 py-2 text-center">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          {value}
          <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground" aria-hidden="true">{label}</span>
          <span className="sr-only">{sr}</span>
        </li>
      ))}
    </ul>
  );
}
