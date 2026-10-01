import { ActivitiesCalendar } from "@/components/actividades/ActivitiesCalendar";

/** Calendario de salidas reales en la portada. */
export function HomeCalendarSection() {
  return (
    <section id="calendario" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Próximas salidas y fechas disponibles
          </h2>
          <p className="mt-3 text-muted-foreground">
            Únete a un grupo abierto (máx. 6 personas) o solicita tu actividad privada en cualquier
            fecha libre.
          </p>
        </header>
        <ActivitiesCalendar />
      </div>
    </section>
  );
}
