import { AgendaAventuras } from "@/components/home/AgendaAventuras";

/** Agenda visual de salidas reales en la portada. */
export function HomeCalendarSection() {
  return (
    <section id="calendario" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-lg font-bold uppercase text-primary">
            Próximas salidas
          </p>
          <h2 className="font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            Agenda de Aventuras
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Únete a un grupo abierto (máx. 6 personas) o solicita tu actividad privada en cualquier
            fecha libre.
          </p>
        </header>
        <AgendaAventuras />
      </div>
    </section>
  );
}
