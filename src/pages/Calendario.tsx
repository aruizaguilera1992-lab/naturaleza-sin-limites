import { Seo } from "@/components/Seo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TrustBar } from "@/components/TrustBar";
import { EventMap } from "@/components/calendario/EventMap";
import { AgendaAventuras } from "@/components/home/AgendaAventuras";
import { useActivityEvents } from "@/hooks/useActivityEvents";

export default function Calendario() {
  const { events } = useActivityEvents();

  const nextWithLocation = events.find(
    (event) => event.latitude != null && event.longitude != null,
  );

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Agenda de Aventuras | Naturaleza Sin Límites"
        description="Próximas salidas guiadas de barranquismo, escalada y vías ferratas en Málaga y Andalucía, con plazas reales y grupos reducidos."
        path="/calendario"
      />
      <Navbar />

      <main className="pt-44 pb-16 md:pt-32 lg:pt-40">
        <div className="container mx-auto max-w-6xl px-4">
          <header className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              Próximas salidas
            </p>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Agenda de Aventuras
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Estas son nuestras próximas salidas con plazas reales. Grupos reducidos de máximo
              6 personas y reserva con señal del 30%.
            </p>
          </header>

          <TrustBar variant="compact" />

          <div className="mt-10 space-y-12">
            <AgendaAventuras />

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
