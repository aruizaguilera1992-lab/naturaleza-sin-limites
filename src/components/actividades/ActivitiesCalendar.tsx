import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MessageCircle, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActivityCatalogImage } from "@/data/activityProfiles";
import { useActivityEvents, type ActivityEvent } from "@/hooks/useActivityEvents";

type View = "dia" | "semana" | "mes";

const categoryDot: Record<string, string> = {
  barranquismo: "bg-cyan-500",
  escalada: "bg-emerald-500",
  "vias-ferratas": "bg-purple-500",
};

const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sameDay = (a: Date, b: Date) => toIso(a) === toIso(b);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfWeek = (d: Date) => {
  const s = startOfDay(d);
  const wd = s.getDay() === 0 ? 6 : s.getDay() - 1;
  s.setDate(s.getDate() - wd);
  return s;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const formatTime = (date: Date) => date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
const fichaUrl = (e: ActivityEvent) => `/actividades/${e.category}/${e.slug}`;
const isPastDay = (d: Date) => startOfDay(d) < startOfDay(new Date());

const defaultView = (): View => {
  if (typeof window === "undefined") return "mes";
  if (window.innerWidth < 640) return "dia";
  if (window.innerWidth < 1024) return "semana";
  return "mes";
};

const requestDate = (date: Date) => {
  window.dispatchEvent(new CustomEvent("nsl:prefill-date", { detail: toIso(date) }));
  const form = document.getElementById("contacto");
  if (form) form.scrollIntoView({ behavior: "smooth" });
  else window.location.href = `/#contacto`;
};

/** Tarjeta mínima: color de disciplina, hora y título. Al pulsar abre la ficha técnica. */
function EventChip({ event, size = "sm" }: { event: ActivityEvent; size?: "sm" | "lg" }) {
  const image = getActivityCatalogImage(event.category, event.slug);
  if (size === "lg") {
    return (
      <Link
        to={fichaUrl(event)}
        className="group relative flex h-40 overflow-hidden rounded-xl border border-border transition-all duration-300 hover:border-primary active:scale-95 sm:h-48"
      >
        {image && <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 mt-auto w-full p-4">
          <span className={cn("mb-2 inline-block h-1.5 w-8 rounded-full", categoryDot[event.category] ?? "bg-primary")} />
          <h4 className="font-heading text-lg font-black uppercase leading-tight text-foreground">{event.title}</h4>
          <p className="mt-1 flex gap-3 text-sm font-semibold text-foreground/90">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(event.startDate)}</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.isFull ? "Completa" : `${event.freeSeats} plazas`}</span>
          </p>
          <span className="mt-2 inline-block text-xs font-bold uppercase tracking-wide text-primary">Ver ficha técnica →</span>
        </div>
      </Link>
    );
  }
  return (
    <Link
      to={fichaUrl(event)}
      onClick={(e) => e.stopPropagation()}
      title={`${event.title} · ${formatTime(event.startDate)}`}
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-md bg-muted px-1.5 py-1 text-left transition-all duration-300 hover:bg-primary/20 active:scale-95",
        event.isFull && "opacity-60",
      )}
    >
      <span className={cn("h-full min-h-[1.5rem] w-1 shrink-0 rounded-full", categoryDot[event.category] ?? "bg-primary")} />
      <span className="min-w-0">
        <span className="block text-[10px] font-bold text-muted-foreground">{formatTime(event.startDate)}</span>
        <span className="block truncate text-[11px] font-bold leading-tight text-foreground">{event.title}</span>
      </span>
    </Link>
  );
}

function RequestCta({ date, compact = false }: { date: Date; compact?: boolean }) {
  if (isPastDay(date)) return null;
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => requestDate(date)}
        aria-label={`Solicitar actividad el ${date.toLocaleDateString("es-ES")}`}
        className="mt-auto flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-1 text-[10px] font-bold uppercase text-muted-foreground opacity-70 transition-all duration-300 hover:border-primary hover:text-primary hover:opacity-100 active:scale-95 group-hover:opacity-100"
      >
        <Plus className="h-3 w-3" /> <span className="hidden lg:inline">Solicitar</span>
      </button>
    );
  }
  const label = date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const wa = `https://wa.me/34685609542?text=${encodeURIComponent(
    `¡Hola Antonio! Me gustaría solicitar una actividad para el ${label}.`,
  )}`;
  return (
    <div className="rounded-xl border border-dashed border-primary/50 bg-card p-6 text-center">
      <CalendarDays className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-3 font-heading font-bold text-foreground">Sin salidas este día</p>
      <p className="mt-1 text-sm text-muted-foreground">Organizamos una actividad para tu grupo en esta fecha.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={() => requestDate(date)} className="transition-all duration-300 active:scale-95">Solicitar actividad</Button>
        <Button asChild variant="outline" className="gap-2 transition-all duration-300 active:scale-95">
          <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
        </Button>
      </div>
    </div>
  );
}

export function ActivitiesCalendar() {
  const [view, setView] = useState<View>(defaultView);
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const { events, loading, error } = useActivityEvents();

  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 640) setView((v) => (v === "mes" ? "dia" : v)); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const e of events) {
      const k = toIso(e.startDate);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    map.forEach((list) => list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
    return map;
  }, [events]);
  const dayEvents = (d: Date) => eventsByDay.get(toIso(d)) ?? [];

  const move = (dir: 1 | -1) => {
    if (view === "dia") setCursor(addDays(cursor, dir));
    else if (view === "semana") setCursor(addDays(cursor, 7 * dir));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
  };

  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const end = addDays(startOfWeek(last), 6);
    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    return days;
  }, [cursor]);

  const title =
    view === "dia"
      ? cursor.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
      : view === "semana"
        ? `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()].slice(0, 3)} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()].slice(0, 3)}`
        : MONTHS[cursor.getMonth()];

  const today = new Date();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3 sm:p-5">
          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground first-letter:uppercase sm:text-3xl">
              {title} <span className="text-primary">{cursor.getFullYear()}</span>
            </h2>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Salidas con plazas reales · Málaga</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Vista del calendario" className="flex rounded-lg border border-border p-0.5">
              {(["dia", "semana", "mes"] as View[]).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-300 active:scale-95",
                    view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    v === "mes" && "hidden sm:block",
                  )}
                >
                  {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Anterior"><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(startOfDay(new Date()))}>Hoy</Button>
            <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Siguiente"><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </div>

        <div className="p-2 sm:p-4">
          {loading && <p className="py-4 text-center text-muted-foreground">Cargando salidas…</p>}
          {error && <p className="py-4 text-center text-destructive">{error}</p>}

          {view === "dia" && (
            <div>
              {dayEvents(cursor).length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dayEvents(cursor).map((e) => <EventChip key={e.id} event={e} size="lg" />)}
                </div>
              ) : isPastDay(cursor) ? (
                <p className="py-8 text-center text-muted-foreground">Esta fecha ya ha pasado.</p>
              ) : (
                <RequestCta date={cursor} />
              )}
            </div>
          )}

          {view === "semana" && (
            <div className="grid gap-2 md:grid-cols-7">
              {weekDays.map((d) => {
                const list = dayEvents(d);
                const isToday = sameDay(d, today);
                return (
                  <div
                    key={toIso(d)}
                    className={cn(
                      "group flex flex-col gap-1.5 rounded-xl border p-2 md:min-h-[14rem]",
                      isToday ? "border-primary/60 bg-primary/5" : "border-border/60",
                      isPastDay(d) && "opacity-40",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => { setCursor(d); setView("dia"); }}
                      className="flex items-baseline gap-2 text-left md:flex-col md:gap-0"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{WEEKDAYS[(d.getDay() + 6) % 7]}</span>
                      <span className={cn("text-xl font-black", isToday ? "text-primary" : "text-foreground")}>{d.getDate()}</span>
                    </button>
                    {list.map((e) => <EventChip key={e.id} event={e} />)}
                    {list.length === 0 && <RequestCta date={d} compact />}
                  </div>
                );
              })}
            </div>
          )}

          {view === "mes" && (
            <>
              <div className="mb-1 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day, i) => (
                  <div key={day} className={cn("py-2 text-center text-[10px] font-bold uppercase tracking-widest sm:text-xs", i >= 5 ? "text-primary" : "text-muted-foreground")}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((d) => {
                  const list = dayEvents(d);
                  const outside = d.getMonth() !== cursor.getMonth();
                  const isToday = sameDay(d, today);
                  return (
                    <div
                      key={toIso(d)}
                      className={cn(
                        "group flex h-28 flex-col gap-1 overflow-hidden rounded-lg border p-1.5 lg:h-32",
                        isToday ? "border-primary/60 bg-primary/5" : "border-border/50",
                        list.length === 0 && "border-dashed",
                        (outside || isPastDay(d)) && "opacity-40",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => { setCursor(d); setView("dia"); }}
                        aria-label={`Ver ${d.toLocaleDateString("es-ES")}`}
                        className={cn("self-start text-sm font-black", isToday ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                      >
                        {d.getDate()}
                      </button>
                      {list.slice(0, 2).map((e) => <EventChip key={e.id} event={e} />)}
                      {list.length > 2 && (
                        <button type="button" onClick={() => { setCursor(d); setView("dia"); }} className="text-left text-[10px] font-bold text-primary">
                          +{list.length - 2} más
                        </button>
                      )}
                      {list.length === 0 && !outside && <RequestCta date={d} compact />}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500" /> Barranquismo</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Escalada</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> Vías ferratas</span>
          </div>
          <p className="font-bold uppercase tracking-wide">Grupos máx. 6 personas · Reserva con señal 30%</p>
        </div>
      </motion.div>

      {events.length > 0 && (
        <div className="mt-6 text-center">
          <Button asChild variant="outline" size="sm"><Link to="/calendario">Ver todas las salidas</Link></Button>
        </div>
      )}
    </div>
  );
}
