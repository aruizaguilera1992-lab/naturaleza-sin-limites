import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventCard } from "@/components/calendario/EventCard";
import { useActivityEvents } from "@/hooks/useActivityEvents";

const categoryDot: Record<string, string> = {
  barranquismo: "bg-cyan-500",
  escalada: "bg-emerald-500",
  "vias-ferratas": "bg-purple-500",
};

const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function ActivitiesCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { events, loading, error } = useActivityEvents();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [daysInMonth, adjustedFirstDay]);

  const getEventsForDay = (day: number) =>
    events.filter(
      (event) =>
        event.startDate.getDate() === day &&
        event.startDate.getMonth() === currentMonth &&
        event.startDate.getFullYear() === currentYear,
    );

  const selectedEvents = selectedDate
    ? events.filter(
        (event) =>
          event.startDate.getDate() === selectedDate.getDate() &&
          event.startDate.getMonth() === selectedDate.getMonth() &&
          event.startDate.getFullYear() === selectedDate.getFullYear(),
      )
    : [];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Mes anterior">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Mes siguiente">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;

              const dayEvents = getEventsForDay(day);
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentMonth &&
                selectedDate?.getFullYear() === currentYear;
              const today = new Date();
              const isToday =
                today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

              return (
                <motion.button
                  key={day}
                  aria-label={`${day} de ${MONTHS[currentMonth]} de ${currentYear}: ${dayEvents.length} salidas`}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                  className={cn(
                    "aspect-square p-1 rounded-lg flex flex-col items-center justify-start relative transition-colors",
                    isSelected && "bg-primary/10 ring-2 ring-primary",
                    isToday && !isSelected && "bg-muted",
                    !isSelected && !isToday && "hover:bg-muted/50",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span
                    className={cn("text-xs sm:text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={cn("h-1.5 w-1.5 rounded-full", categoryDot[event.category] ?? "bg-primary")}
                          title={event.title}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4 flex flex-wrap gap-3 sm:gap-4 justify-center text-xs sm:text-sm text-muted-foreground border-t border-border pt-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500" /> Barranquismo
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Escalada
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" /> Vías ferratas
          </span>
        </div>
      </motion.div>

      <div className="mt-6">
        {loading && <p className="text-muted-foreground text-center py-4">Cargando salidas…</p>}
        {error && <p className="text-destructive text-center py-4">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-foreground">Todavía no hay salidas publicadas.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Elige cualquier experiencia del catálogo y proponnos tu fecha.
            </p>
          </div>
        )}

        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">
              {selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {selectedEvents.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  - {selectedEvents.length} salida{selectedEvents.length > 1 ? "s" : ""} programada
                  {selectedEvents.length > 1 ? "s" : ""}
                </span>
              )}
            </h3>

            {selectedEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay salidas programadas para este día</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {selectedEvents.map((event) => (
                  <EventCard key={event.id} event={event} showDate={false} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {events.length > 0 && (
          <div className="mt-6 text-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/calendario">Ver todas las salidas</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
