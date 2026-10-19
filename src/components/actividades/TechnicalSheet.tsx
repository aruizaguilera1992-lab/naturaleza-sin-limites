import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const GROUPS: { id: string; label: string; keys: string[] }[] = [
  { id: 'esencial', label: 'Lo esencial', keys: ['Tipo de actividad', 'Duración total', 'Duración efectiva', 'Temporada'] },
  { id: 'nivel', label: 'Nivel', keys: ['Nivel técnico', 'Nivel físico', 'Elementos técnicos'] },
  { id: 'logistica', label: 'Grupo y logística', keys: ['Grupo mínimo/máximo', 'Ratio guía-participantes', 'Aproximación y retorno', 'Zona de encuentro'] },
];

interface Props { rows: [string, string][]; sourceUrl?: string }

export function TechnicalSheet({ rows, sourceUrl }: Props) {
  const groups = GROUPS.map((g) => ({ ...g, rows: rows.filter(([l]) => g.keys.includes(l)) })).filter((g) => g.rows.length);
  const known = GROUPS.flatMap((g) => g.keys);
  const rest = rows.filter(([l]) => !known.includes(l));
  if (rest.length) groups.push({ id: 'otros', label: 'Otros', keys: [], rows: rest });
  const [active, setActive] = useState(groups[0]?.id);
  const [open, setOpen] = useState<string | null>(null);
  const current = groups.find((g) => g.id === active) ?? groups[0];
  if (!current) return null;

  return (
    <section aria-labelledby="ficha-tecnica">
      <h2 id="ficha-tecnica" className="mb-4 font-heading text-2xl font-bold">Ficha técnica</h2>
      <div role="tablist" aria-label="Bloques de la ficha técnica" className="mb-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button key={g.id} role="tab" type="button" aria-selected={g.id === current.id} aria-controls={`ft-${g.id}`}
            onClick={() => { setActive(g.id); setOpen(null); }}
            className={cn('min-h-11 rounded-full border px-4 text-sm font-semibold transition-all duration-300 active:scale-95',
              g.id === current.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground')}>
            {g.label} <span className="ml-1 opacity-70">{g.rows.length}</span>
          </button>
        ))}
      </div>
      <dl id={`ft-${current.id}`} role="tabpanel" className="grid gap-3 sm:grid-cols-2">
        {current.rows.map(([label, value]) => {
          const isOpen = open === label;
          const long = value.length > 60;
          return (
            <div key={label} className={cn('rounded-lg border bg-card transition-all duration-300', isOpen ? 'border-primary sm:col-span-2' : 'border-border')}>
              <button type="button" aria-expanded={long ? isOpen : undefined} disabled={!long}
                onClick={() => setOpen(isOpen ? null : label)}
                className="flex w-full items-start justify-between gap-3 p-4 text-left disabled:cursor-default">
                <span className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</dt>
                  <dd className={cn('mt-1 text-sm text-foreground [overflow-wrap:anywhere]', !isOpen && 'line-clamp-2')}>{value}</dd>
                </span>
                {long && <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300', isOpen && 'rotate-180')} />}
              </button>
            </div>
          );
        })}
      </dl>
      {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline">Fuente técnica <ExternalLink className="h-4 w-4" /></a>}
    </section>
  );
}
