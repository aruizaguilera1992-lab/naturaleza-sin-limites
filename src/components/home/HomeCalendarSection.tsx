import { AgendaAventuras } from "@/components/home/AgendaAventuras";

/** Agenda visual de salidas reales en la portada. */
export function HomeCalendarSection() {
  return (
    <section id="calendario" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Próximas salidas
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Agenda de Aventuras
          </h2>
          <p className="mt-3 text-muted-foreground">
            Únete a un grupo abierto (máx. 6 personas) o solicita tu actividad privada en cualquier
            fecha libre.
          </p>
        </header>
        <AgendaAventuras />
      </div>
    </section>
  );
}
