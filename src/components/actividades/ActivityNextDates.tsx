import { Link } from 'react-router-dom';
import { CalendarDays, Users } from 'lucide-react';
import { useActivityEvents } from '@/hooks/useActivityEvents';
import { cn } from '@/lib/utils';

const euros = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

interface Props { category: string; slug: string }

/** Próximas salidas reales en mini-tarjetas. No inventa fechas: si no hay, lo dice. */
export function ActivityNextDates({ category, slug }: Props) {
  const { events, loading } = useActivityEvents({ category, slug });

  return (
    <section aria-labelledby="proximas-salidas">
      <h2 id="proximas-salidas" className="mb-4 font-heading text-2xl font-bold">Próximas salidas</h2>
      {loading ? (
        <div className="h-28 animate-pulse rounded-md bg-card" />
      ) : events.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">Aún no hay salidas programadas. Reserva tu fecha o consulta disponibilidad.</p>
      ) : (
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {events.slice(0, 6).map((e) => {
            const last = !e.isFull && e.freeSeats <= 2;
            const inner = (
              <>
                {(last || e.isFull) && (
                  <span className={cn('absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase', e.isFull ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground')}>
                    {e.isFull ? 'Completa' : 'Últimas plazas'}
                  </span>
                )}
                <p className="flex items-center gap-2 text-sm font-semibold capitalize text-foreground"><CalendarDays className="h-4 w-4 text-primary" />{e.startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="text-2xl font-extrabold text-primary">{e.pricePerPerson ? euros(e.pricePerPerson) : '—'}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{e.isFull ? 'Sin plazas' : `${e.freeSeats} libres`}</p>
                </div>
              </>
            );
            const cls = cn('relative min-w-[200px] snap-start rounded-md border bg-card p-4 transition-all duration-300', last ? 'border-primary' : 'border-border', !e.isFull && 'hover:border-primary active:scale-95');
            return e.isFull ? (
              <div key={e.id} className={cn(cls, 'opacity-60')}>{inner}</div>
            ) : (
              <Link key={e.id} to={`/reservar/${e.category}/${e.slug}?evento=${e.id}`} className={cls} aria-label={`Reservar salida del ${e.startDate.toLocaleDateString('es-ES')}`}>{inner}</Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
