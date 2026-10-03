import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cable,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Footprints,
  Gauge,
  Mountain,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useActivityEvents, type ActivityEvent } from "@/hooks/useActivityEvents";
import { getActivityCatalogImage } from "@/data/activityProfiles";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

type FilterKey = "todos" | "barranquismo" | "espeleologia" | "vias-ferratas" | "senderismo";

const FILTERS: { key: FilterKey; label: string; icon: LucideIcon }[] = [
  { key: "todos", label: "Todos", icon: CalendarDays },
  { key: "barranquismo", label: "Barranquismo", icon: Waves },
  { key: "espeleologia", label: "Espeleología", icon: Mountain },
  { key: "vias-ferratas", label: "Vía ferrata", icon: Cable },
  { key: "senderismo", label: "Senderismo", icon: Footprints },
];

const CATEGORY_ICON: Record<string, LucideIcon> = {
  barranquismo: Waves,
  escalada: Mountain,
  "vias-ferratas": Cable,
  espeleologia: Mountain,
};

const lastMinuteThreshold = 2;

function AgendaCard({ event }: { event: ActivityEvent }) {
  const image = getActivityCatalogImage(event.category, event.slug) ?? event.profile?.image;
  const Icon = CATEGORY_ICON[event.category] ?? CalendarDays;
  const fewSeats = !event.isFull && event.freeSeats <= lastMinuteThreshold;
  const month = MONTHS[event.startDate.getMonth()];
  const day = event.startDate.getDate();
  const price = event.pricePerPerson;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl">
      <div className="relative h-44 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={event.profile?.imageAlt ?? event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Bloque de fecha */}
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl border border-white/20 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {month.slice(0, 3)}
          </span>
          <span className="font-heading text-2xl font-bold leading-none text-white">{day}</span>
        </div>

        {fewSeats && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-lg">
            <Flame className="h-3 w-3" aria-hidden="true" />
            Últimas plazas
          </span>
        )}
        {event.isFull && (
          <span className="absolute right-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Completa
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {event.profile?.categoryLabel ?? event.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
          {event.title}
        </h3>

        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border/50 bg-secondary/40 px-1 py-2">
            <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Gauge className="h-3 w-3" aria-hidden="true" /> Nivel
            </dt>
            <dd className="mt-0.5 truncate text-xs font-semibold text-foreground">
              {event.profile?.technicalLevel ?? "—"}
            </dd>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/40 px-1 py-2">
            <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" /> Duración
            </dt>
            <dd className="mt-0.5 truncate text-xs font-semibold text-foreground">
              {event.profile?.totalDuration ?? "—"}
            </dd>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/40 px-1 py-2">
            <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Users className="h-3 w-3" aria-hidden="true" /> Plazas
            </dt>
            <dd className="mt-0.5 text-xs font-semibold text-foreground">
              {event.isFull ? "0" : event.freeSeats} libres
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <p className="font-heading text-xl font-bold text-primary">
            {price ? `${price} €` : "Consultar"}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/ persona</span>
          </p>
          {event.isFull ? (
            <span className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground">
              Sin plazas
            </span>
          ) : (
            <Link
              to={`/reservar/${event.category}/${event.slug}?evento=${event.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-95"
            >
              Reservar plaza
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Agenda visual de salidas programadas: tarjetas con filtros y navegación mensual. */
export function AgendaAventuras() {
  const { events, loading, error } = useActivityEvents();
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [filter, setFilter] = useState<FilterKey>("todos");

  const visibleMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset]);

  const monthEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.startDate.getFullYear() === visibleMonth.year &&
          e.startDate.getMonth() === visibleMonth.month,
      ),
    [events, visibleMonth],
  );

  const filtered = useMemo(
    () => (filter === "todos" ? monthEvents : monthEvents.filter((e) => e.category === filter)),
    [monthEvents, filter],
  );

  const monthLabel = `${MONTHS[visibleMonth.month]} ${visibleMonth.year}`;

  const requestDateWhatsApp = `https://wa.me/34685609542?text=${encodeURIComponent(
    "Hola, no encuentro en la agenda la fecha o actividad que busco y me gustaría solicitar una salida en otra fecha.",
  )}`;

  return (
    <div>
      {/* Filtros por tipo de actividad */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 ${
              filter === key
                ? "border-primary bg-primary text-primary-foreground shadow-lg"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Navegación por meses */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
          disabled={monthOffset === 0}
          aria-label="Mes anterior"
          className="rounded-full border border-border bg-card p-2 text-foreground transition-all duration-300 hover:border-primary/60 disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="min-w-40 text-center font-heading text-xl font-bold capitalize text-foreground">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => setMonthOffset((v) => v + 1)}
          aria-label="Mes siguiente"
          className="rounded-full border border-border bg-card p-2 text-foreground transition-all duration-300 hover:border-primary/60 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Cargando salidas…</p>
      ) : error ? (
        <p className="py-12 text-center text-muted-foreground">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden="true" />
          <p className="font-heading text-lg font-semibold text-foreground">
            No hay salidas programadas en {monthLabel}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Prueba con otro mes o solicita una salida privada en la fecha que te venga bien.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <AgendaCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Aviso: solicitar una fecha concreta si no hay una salida que encaje */}
      <div className="mt-10 rounded-2xl border border-primary/30 bg-gradient-to-r from-secondary/80 via-card to-secondary/60 px-6 py-8 text-center">
        <CalendarPlus
          className="mx-auto mb-3 h-8 w-8 text-primary"
          aria-hidden="true"
        />
        <p className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          ¿No encuentras lo que buscas?
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Solicita una fecha: organizamos tu salida privada el día que mejor te venga, con grupo
          reducido y a tu ritmo.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={requestDateWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95 sm:text-base"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Solicitar una fecha
          </a>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-heading text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/60 active:scale-95 sm:text-base"
          >
            Escribir por formulario
          </Link>
        </div>
      </div>
    </div>
  );
}
