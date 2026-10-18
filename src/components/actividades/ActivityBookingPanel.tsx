import { Link } from 'react-router-dom';
import { CalendarDays, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActivityEvents } from '@/hooks/useActivityEvents';
import { cn } from '@/lib/utils';

const euros = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

interface Props {
  category: string;
  slug: string;
  price: string;
  priceValue?: number;
  whatsappUrl: string;
}

/**
 * Panel lateral de reserva (escritorio): precio real, próximas salidas con plazas
 * reales y CTA. Nunca inventa disponibilidad: sin salidas, propone solicitar fecha.
 */
export function ActivityBookingPanel({ category, slug, price, priceValue, whatsappUrl }: Props) {
  const { events, loading } = useActivityEvents({ category, slug });
  const bookingUrl = `/reservar/${category}/${slug}`;
  const open = events.filter((e) => !e.isFull).slice(0, 3);

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <p className="text-sm text-muted-foreground">Precio por persona</p>
      <p className="mt-1 text-3xl font-extrabold text-primary">{priceValue ? price : 'Precio a consultar'}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
        <Users className="h-4 w-4 text-primary" /> Grupos de máximo 6 personas
      </p>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" /> Próximas salidas
        </p>
        {loading ? (
          <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />)}</div>
        ) : open.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            Ahora mismo no hay salidas programadas. Solicita tu fecha y la organizamos contigo.
          </p>
        ) : (
          <ul className="space-y-2">
            {open.map((e) => (
              <li key={e.id}>
                <Link
                  to={`${bookingUrl}?evento=${e.id}`}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-md border p-3 text-sm transition-all duration-300 hover:border-primary active:scale-95',
                    e.freeSeats <= 2 ? 'border-primary' : 'border-border',
                  )}
                  aria-label={`Reservar salida del ${e.startDate.toLocaleDateString('es-ES')}`}
                >
                  <span className="font-semibold capitalize text-foreground">
                    {e.startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {e.pricePerPerson ? <span className="font-bold text-primary">{euros(e.pricePerPerson)}</span> : null}
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{e.freeSeats} libres</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {priceValue ? (
          <Button variant="hero" size="lg" className="min-h-12 w-full text-base" asChild>
            <Link to={bookingUrl}>{open.length > 0 ? 'Reservar plaza' : 'Solicitar otra fecha'}</Link>
          </Button>
        ) : (
          <Button variant="hero" size="lg" className="min-h-12 w-full text-base" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-5 w-5" />Consultar</a>
          </Button>
        )}
        {open.length > 0 && (
          <Button variant="outline" size="lg" className="min-h-12 w-full" asChild>
            <Link to={bookingUrl}>Solicitar otra fecha</Link>
          </Button>
        )}
        <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Las solicitudes sin salida programada no generan cobro: primero confirmamos disponibilidad, precio y anticipo.
        </p>
      </div>
    </div>
  );
}
