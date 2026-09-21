import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TrustBar } from "@/components/TrustBar";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/calendario/EventCard";
import { EventMap } from "@/components/calendario/EventMap";
import { useActivityEvents, type ActivityEvent } from "@/hooks/useActivityEvents";

type ViewMode = "lista" | "mes";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

export default function Calendario() {
  const { events, loading, error } = useActivityEvents();
  const [view, setView] = useState<ViewMode>("lista");

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: ActivityEvent[] }>();
    events.forEach((event) => {
      const key = monthKey(event.startDate);
      const label = `${MONTHS[event.startDate.getMonth()]} ${event.startDate.getFullYear()}`;
      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key)!.items.push(event);
    });
    return [...map.values()];
  }, [events]);

  const nextWithLocation = events.find(
    (event) => event.latitude != null && event.longitude != null,
  );

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Calendario de salidas | Naturaleza Sin Límites"
        description="Próximas salidas guiadas de barranquismo, escalada y vías ferratas en Málaga y Andalucía, con plazas reales y grupos reducidos."
        path="/calendario"
      />
      <Navbar />

      <main className="pt-44 pb-16 md:pt-32 lg:pt-40">
        <div className="container mx-auto max-w-5xl px-4">
          <header className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Calendario de salidas
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Estas son nuestras próximas salidas con plazas reales. Grupos reducidos de máximo
              6 personas y reserva con señal del 30%.
            </p>
          </header>

          <TrustBar variant="compact" />

          <div className="mt-8 flex gap-2">
            <Button
              size="sm"
              variant={view === "lista" ? "default" : "outline"}
              onClick={() => setView("lista")}
            >
              Próximas salidas
            </Button>
            <Button
              size="sm"
              variant={view === "mes" ? "default" : "outline"}
              onClick={() => setView("mes")}
            >
              Por mes
            </Button>
          </div>

          <div className="mt-6 space-y-8">
            {loading && <p className="text-muted-foreground">Cargando salidas…</p>}
            {error && <p className="text-destructive">{error}</p>}

            {!loading && !error && events.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-foreground">
                  Todavía no hay salidas publicadas en el calendario.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Puedes reservar cualquier experiencia del catálogo proponiendo tu fecha y la
                  organizamos contigo.
                </p>
                <Button asChild className="mt-4">
                  <a href="/actividades">Ver experiencias</a>
                </Button>
              </div>
            )}

            {view === "lista" && events.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {view === "mes" &&
              grouped.map((group) => (
                <section key={group.label}>
                  <h2 className="mb-3 font-heading text-xl font-bold text-foreground">
                    {group.label}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.items.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              ))}

            {nextWithLocation && (
              <section>
                <h2 className="mb-3 font-heading text-xl font-bold text-foreground">
                  Dónde nos movemos
                </h2>
                <EventMap
                  latitude={nextWithLocation.latitude}
                  longitude={nextWithLocation.longitude}
                  zone={nextWithLocation.zone}
                />
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
