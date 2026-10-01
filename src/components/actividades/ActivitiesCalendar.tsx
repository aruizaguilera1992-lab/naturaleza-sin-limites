import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventCard } from "@/components/calendario/EventCard";
import { useActivityEvents, type ActivityEvent } from "@/hooks/useActivityEvents";

const categoryStyles: Record<string, { bar: string; text: string; overlay: string }> = {
  barranquismo: { bar: "bg-cyan-500", text: "text-cyan-500", overlay: "from-cyan-950/95" },
  escalada: { bar: "bg-emerald-500", text: "text-emerald-500", overlay: "from-emerald-950/95" },
  "vias-ferratas": { bar: "bg-purple-500", text: "text-purple-500", overlay: "from-purple-950/95" },
};

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

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const euros = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const formatTime = (date: Date) => date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

/** Día sin salida abierta: invita a pedir una salida privada en esa fecha. */
function FreeDayCard({ date }: { date: Date }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return <p className="text-muted-foreground text-center py-8">Esta fecha ya ha pasado.</p>;
  }
  const label = date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const wa = `https://wa.me/34685609542?text=${encodeURIComponent(
    `¡Hola Antonio! He visto que el ${label} está libre en el calendario y me gustaría consultar una salida privada.`,
  )}`;
  const requestDate = () => {
    window.dispatchEvent(new CustomEvent("nsl:prefill-date", { detail: toIso(date) }));
    const form = document.getElementById("contacto");
    if (form) form.scrollIntoView({ behavior: "smooth" });
    else window.location.href = `/#contacto`;
  };
  return (
    <div className="rounded-xl border border-primary/40 bg-card p-6 text-center">
      <CalendarDays className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-3 font-heading font-semibold text-foreground">Fecha disponible para tu grupo</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Este día no hay salida abierta. Podemos organizar una salida privada para ti.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={requestDate} className="transition-all duration-300 active:scale-95">
          Solicitar salida en esta fecha
        </Button>
        <Button asChild variant="outline" className="gap-2 transition-all duration-300 active:scale-95">
          <a href={wa} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Preguntar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

interface DayCellProps {
  day: number;
  month: number;
  year: number;
  events: ActivityEvent[];
  selected: boolean;
  isToday: boolean;
  isPast: boolean;
  onSelect: (date: Date) => void;
}

/** Celda de día tipo tablón: al pasar el ratón muestra el plan con acción directa. */
function CalendarDayCell({ day, month, year, events, selected, isToday, isPast, onSelect }: DayCellProps) {
  const [hovered, setHovered] = useState(false);
  const date = new Date(year, month, day);
  const featured = events[0];
  const extras = events.length - 1;
  const featuredStyle = featured ? categoryStyles[featured.category] : null;
  const full = featured ? featured.isFull : false;

  const handleClick = () => onSelect(date);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${day} de ${MONTHS[month]} de ${year}: ${events.length > 0 ? `${events.length} salidas` : "día libre"}`}
      aria-pressed={selected}
      aria-current={isToday ? "date" : undefined}
      onClick={handleClick}
      onKeyDown={handleKey}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative flex h-16 cursor-pointer flex-col overflow-hidden rounded-lg border p-1.5 text-left outline-none sm:h-24 sm:p-2 lg:h-32",
        "transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary bg-primary/10 ring-2 ring-primary"
          : isToday
            ? "border-primary/40 bg-muted"
            : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40",
        isPast && "opacity-50",
      )}
    >
      <span
        className={cn(
          "text-xs font-semibold sm:text-sm",
          selected || isToday ? "text-primary" : "text-muted-foreground",
        )}
      >
        {day}
      </span>

      {/* Sello en móvil: puntos de categoría (el detalle aparece al tocar) */}
      {events.length > 0 && (
        <div className="mt-auto flex gap-0.5 sm:hidden">
          {events.slice(0, 3).map((event) => (
            <span
              key={event.id}
              className={cn("h-1.5 w-1.5 rounded-full", categoryDot[event.category] ?? "bg-primary")}
            />
          ))}
        </div>
      )}

      {/* Etiqueta del plan en la celda (escritorio y tablet) */}
      {featured && (
        <div className="mt-auto hidden min-w-0 sm:block">
          <div className={cn("mb-1 h-1 w-6 rounded-full", featuredStyle?.bar ?? "bg-primary")} />
          <p className="truncate text-[10px] font-bold uppercase leading-tight tracking-tight lg:text-[11px]">
            <span className={cn(featuredStyle?.text ?? "text-primary")}>{featured.profile?.categoryLabel}</span>
            {" · "}
            <span className="text-foreground">{featured.title}</span>
          </p>
          {extras > 0 && <p className="text-[9px] font-semibold text-muted-foreground">+{extras} más</p>}
        </div>
      )}

      {/* Detalle flotante al pasar el ratón o enfocar (escritorio) */}
      {hovered && featured && (
        <div
          className={cn(
            "absolute inset-0 z-20 hidden flex-col sm:flex",
          )}
        >
          {featured.profile?.image && (
            <img
              src={featured.profile.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div
            className={cn(
              "relative flex h-full flex-col justify-end gap-1 bg-gradient-to-t p-2",
              featuredStyle?.overlay ?? "from-primary/95",
              "via-background/85 to-background/30",
            )}
          >
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", featuredStyle?.text ?? "text-primary")}>
              {featured.profile?.categoryLabel}
            </p>
            <p className="line-clamp-2 text-xs font-bold leading-tight text-foreground">{featured.title}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-foreground/90">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" /> {formatTime(featured.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {featured.isFull ? "Sin plazas" : `${featured.freeSeats}/${featured.capacity_total} libres`}
              </span>
              {featured.pricePerPerson > 0 && (
                <span className="font-bold text-primary">{euros(featured.pricePerPerson)}</span>
              )}
            </p>
            {full ? (
              <span className="mt-auto rounded bg-muted px-2 py-1.5 text-center text-[10px] font-bold uppercase text-muted-foreground">
                Completa
              </span>
            ) : (
              <Link
                to={`/reservar/${featured.category}/${featured.slug}?evento=${featured.id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-auto block rounded bg-primary px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-primary-foreground transition-all duration-300 hover:bg-primary/90 active:scale-95"
              >
                Reservar mi plaza
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pista en días libres (escritorio) */}
      {hovered && !featured && !isPast && (
        <div className="pointer-events-none absolute inset-0 z-10 hidden items-end justify-center bg-background/80 p-2 sm:flex">
          <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-primary">
            Libre · salida privada
          </span>
        </div>
      )}
    </motion.div>
  );
}

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

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            {MONTHS[currentMonth]} <span className="text-primary">{currentYear}</span>
          </h2>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Mes anterior">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Mes siguiente">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-2 sm:p-4">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "py-2 text-center text-[10px] font-bold uppercase tracking-widest sm:text-xs",
                  i >= 5 ? "text-primary" : "text-muted-foreground",
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((day, index) =>
              day === null ? (
                <div key={`empty-${index}`} className="h-16 sm:h-24 lg:h-32" />
              ) : (
                <CalendarDayCell
                  key={day}
                  day={day}
                  month={currentMonth}
                  year={currentYear}
                  events={getEventsForDay(day)}
                  selected={
                    selectedDate?.getDate() === day &&
                    selectedDate?.getMonth() === currentMonth &&
                    selectedDate?.getFullYear() === currentYear
                  }
                  isToday={
                    new Date().getDate() === day &&
                    new Date().getMonth() === currentMonth &&
                    new Date().getFullYear() === currentYear
                  }
                  isPast={new Date(currentYear, currentMonth, day) < new Date(new Date().setHours(0, 0, 0, 0))}
                  onSelect={setSelectedDate}
                />
              ),
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:gap-5 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500" /> Barranquismo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Escalada
          </span>
          <span className="flex items-center gap-1.5">
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
              <FreeDayCard date={selectedDate} />
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
