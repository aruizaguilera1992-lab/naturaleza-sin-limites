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

/** Celda de día tipo tablón visual: foto a sangre, sello de categoría y llamada a la acción grande. */
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
        "group relative flex h-32 cursor-pointer flex-col overflow-hidden rounded-xl text-left outline-none sm:h-44 lg:h-52",
        "transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary active:scale-95",
        featured
          ? cn("border-2", selected ? "border-primary ring-2 ring-primary" : isToday ? "border-primary/60" : "border-transparent hover:border-primary")
          : cn(
              "border border-dashed p-2",
              selected
                ? "border-primary bg-primary/10 ring-2 ring-primary"
                : isToday
                  ? "border-primary/50 bg-muted"
                  : "border-border/60 bg-card hover:border-primary/50",
            ),
        isPast && "opacity-40 grayscale",
      )}
    >
      {/* Foto de fondo a sangre en días con salida */}
      {featured?.profile?.image && (
        <img
          src={featured.profile.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {featured && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t",
            featuredStyle?.overlay ?? "from-primary/95",
            "via-background/50 to-background/40",
          )}
        />
      )}

      {/* Número del día */}
      <span
        className={cn(
          "relative z-10 px-2 pt-1.5 text-lg font-black drop-shadow-md sm:text-xl",
          featured ? "text-white" : selected || isToday ? "text-primary" : "text-muted-foreground",
        )}
      >
        {day}
      </span>

      {/* Sello en móvil: puntos de categoría (el detalle aparece al tocar) */}
      {events.length > 0 && (
        <div className="relative z-10 mt-auto flex gap-1 pb-2 pl-2 sm:hidden">
          {events.slice(0, 3).map((event) => (
            <span
              key={event.id}
              className={cn("h-1.5 w-4 rounded-full", categoryDot[event.category] ?? "bg-primary")}
            />
          ))}
        </div>
      )}

      {/* Etiqueta del plan sobre la foto (tablet y escritorio) */}
      {featured && (
        <div className="relative z-10 mt-auto hidden min-w-0 flex-col gap-1 px-2 pb-2 sm:flex">
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight text-primary-foreground",
                featuredStyle?.bar ?? "bg-primary",
              )}
            >
              {featured.profile?.categoryLabel}
            </span>
            <span className="rounded bg-background/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-foreground backdrop-blur-sm">
              Niv. {featured.profile?.technicalLevel}
            </span>
          </div>
          <h3 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-white drop-shadow-lg lg:text-base">
            {featured.title}
          </h3>
          {extras > 0 && <p className="text-[10px] font-bold text-white/90">+{extras} más</p>}
        </div>
      )}

      {/* Llamada a la acción con precio: aparece al pasar el ratón (escritorio) */}
      {featured && (
        <div
          className={cn(
            "absolute inset-0 z-20 hidden flex-col justify-end gap-1.5 bg-gradient-to-t from-background via-background/80 to-transparent p-3 transition-opacity duration-200 sm:flex",
            hovered ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <p className={cn("text-[10px] font-black uppercase tracking-widest", featuredStyle?.text ?? "text-primary")}>
            {featured.profile?.categoryLabel} · {featured.profile?.zone}
          </p>
          <p className="text-base font-black uppercase leading-tight text-foreground lg:text-lg">{featured.title}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-foreground/90">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {formatTime(featured.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {featured.isFull ? "Sin plazas" : `${featured.freeSeats} plazas`}
            </span>
          </p>
          <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {featured.profile?.shortDescription}
          </p>
          {full ? (
            <span className="mt-1 rounded-lg bg-muted px-3 py-2.5 text-center text-sm font-black uppercase tracking-wide text-muted-foreground">
              Completa
            </span>
          ) : (
            <Link
              to={`/reservar/${featured.category}/${featured.slug}?evento=${featured.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 block rounded-lg bg-primary px-3 py-3 text-center text-base font-black uppercase tracking-wide text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 active:scale-95 lg:text-lg"
            >
              Reservar
              {featured.pricePerPerson > 0 && featured.pricePerPerson < 1000
                ? ` · ${euros(featured.pricePerPerson)}`
                : ""}
            </Link>
          )}
        </div>
      )}

      {/* Pista en días libres (escritorio) */}
      {!featured && !isPast && (
        <div className="relative z-10 mt-auto hidden pb-2 px-2 sm:block">
          <p className="text-[10px] font-bold uppercase italic leading-tight tracking-tight text-muted-foreground">
            Día disponible
          </p>
          <p className="mt-0.5 rounded border border-dashed border-border/80 py-1 text-center text-[9px] font-bold uppercase text-primary/80 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            Solicitar privada
          </p>
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
