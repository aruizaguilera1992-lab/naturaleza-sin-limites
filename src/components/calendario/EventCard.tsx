import { Link } from "react-router-dom";
import { Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "@/hooks/useActivityEvents";

const euros = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

const formatTime = (date: Date) =>
  date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

interface EventCardProps {
  event: ActivityEvent;
  showDate?: boolean;
}

export function EventCard({ event, showDate = true }: EventCardProps) {
  const profile = event.profile;
  const bookingUrl = `/reservar/${event.category}/${event.slug}?evento=${event.id}`;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {showDate && (
            <p className="text-xs uppercase tracking-wide text-primary">{formatDate(event.startDate)}</p>
          )}
          <h3 className="font-heading text-lg font-bold text-foreground">{event.title}</h3>
          {profile && (
            <p className="text-xs text-muted-foreground">{profile.categoryLabel}</p>
          )}
        </div>
        {event.pricePerPerson ? (
          <Badge className="bg-primary text-primary-foreground">
            {euros(event.pricePerPerson)} / persona
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" /> {formatTime(event.startDate)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {event.zone}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" aria-hidden="true" />
          {event.isFull
            ? "Sin plazas"
            : `${event.freeSeats} de ${event.capacity_total} plazas libres`}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button asChild size="sm" variant="outline" className="transition-all duration-300 active:scale-95">
          <Link to={`/actividades/${event.category}/${event.slug}`}>Ver experiencia</Link>
        </Button>
        {event.isFull ? (
          <Button size="sm" disabled>
            Completa
          </Button>
        ) : (
          <Button asChild size="sm" className="transition-all duration-300 active:scale-95">
            <Link to={bookingUrl}>Reservar plaza</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
