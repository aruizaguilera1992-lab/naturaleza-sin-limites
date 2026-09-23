import { ActivitiesCalendar } from "@/components/actividades/ActivitiesCalendar";
import { Link } from "react-router-dom";

export function VSCalendarSection() {
  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="vs-calendar-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="vs-calendar-title" className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Calendario de <span className="text-gradient">salidas</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Consulta las salidas publicadas y sus plazas disponibles. Los horarios de entrenamiento se acuerdan al
            contratar tu plan.
          </p>
          <Link to="/contacto" className="inline-block mt-3 text-primary underline underline-offset-4">
            Consultar horarios de entrenamiento
          </Link>
        </div>
        <ActivitiesCalendar />
      </div>
    </section>
  );
}
