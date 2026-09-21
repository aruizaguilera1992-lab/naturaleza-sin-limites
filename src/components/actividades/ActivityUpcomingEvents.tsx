import { EventCard } from "@/components/calendario/EventCard";
import { useActivityEvents } from "@/hooks/useActivityEvents";

interface Props {
  category: string;
  slug: string;
}

/** Próximas salidas reales de esta actividad. Si no hay, no se inventa ninguna. */
export function ActivityUpcomingEvents({ category, slug }: Props) {
  const { events, loading } = useActivityEvents({ category, slug });

  if (loading || events.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">Próximas salidas</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.slice(0, 6).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
