import { CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/hooks/useActivityEvents";

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

const formatTime = (date: Date) =>
  date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

interface ActivityEventPickerProps {
  events: ActivityEvent[];
  loading?: boolean;
  selectedId: string | null;
  onSelect: (eventId: string | null) => void;
  allowCustomDate?: boolean;
}

/** Selector de fechas REALES. Si no hay salidas cargadas, no se inventa ninguna. */
export function ActivityEventPicker({
  events,
  loading,
  selectedId,
  onSelect,
  allowCustomDate = true,
}: ActivityEventPickerProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando fechas disponibles…</p>;
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ahora mismo no hay salidas programadas para esta actividad. Indícanos la fecha que
        prefieres y la organizamos contigo.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {events.map((event) => {
          const selected = selectedId === event.id;
          return (
            <button
              key={event.id}
              type="button"
              disabled={event.isFull}
              onClick={() => onSelect(event.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all duration-300 active:scale-95",
                selected ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/50",
                event.isFull && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                {formatDate(event.startDate)} · {formatTime(event.startDate)}
              </span>
              <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" aria-hidden="true" />
                {event.isFull ? "Sin plazas" : `${event.freeSeats} plazas libres`} · {event.zone}
              </span>
            </button>
          );
        })}
      </div>

      {allowCustomDate && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "w-full rounded-lg border p-3 text-left text-sm transition-all duration-300 active:scale-95",
            selectedId === null ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/50",
          )}
        >
          No me encaja ninguna fecha: proponer otra
        </button>
      )}
    </div>
  );
}
