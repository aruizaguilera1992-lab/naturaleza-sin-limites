import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ActivityEvent } from "@/hooks/useActivityEvents";
import { OutingInstructions } from "@/components/shared/OutingInstructions";

const List = ({ title, items }: { title: string; items?: string[] }) =>
  items && items.length ? (
    <section>
      <h4 className="mb-1 font-heading text-sm font-bold text-foreground">{title}</h4>
      <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </section>
  ) : null;

export function EventTechSheet({ event, bookingUrl }: { event: ActivityEvent; bookingUrl: string }) {
  const [open, setOpen] = useState(false);
  const p = event.profile;
  const rows: [string, string | undefined][] = p
    ? [
        ["Fecha", event.startDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
        ["Punto de encuentro", event.zone],
        ["Plazas libres", `${event.freeSeats} de ${event.capacity_total}`],
        ["Precio", event.pricePerPerson ? `${event.pricePerPerson} € / persona` : p.price],
        ["Duración total", p.totalDuration],
        ["Actividad efectiva", p.effectiveDuration],
        ["Nivel técnico", p.technicalLevel],
        ["Experiencia", p.experienceLevel],
        ["Condición física", p.physicalLevel],
        ["Edad mínima", p.minimumAge],
        ["Temporada", p.season],
        ["Grupo", p.group],
        ["Ratio guía", p.guideRatio],
        ["Aproximación y retorno", p.approachReturn],
        ["Experiencia previa", p.previousExperience],
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="transition-all duration-300 active:scale-95">Ver ficha y reservar</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{event.title}</DialogTitle>
          {p && <DialogDescription>{p.categoryLabel} · {p.shortDescription}</DialogDescription>}
        </DialogHeader>
        {p ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm sm:grid-cols-2">
              {rows.filter(([, v]) => v && v.trim()).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-primary">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <List title="Elementos técnicos" items={p.technicalElements} />
            <List title="Itinerario" items={p.itinerary} />
            <List title="Incluye" items={p.included} />
            <List title="Qué llevar" items={p.bring} />
            <List title="Requisitos de seguridad" items={p.safetyRequirements} />
            <List title="Seguros y permisos" items={p.insurancePermits} />
            {p.weatherPolicy && <p className="text-sm text-muted-foreground"><strong className="text-foreground">Meteorología: </strong>{p.weatherPolicy}</p>}
            {p.cancellationPolicy && <p className="text-sm text-muted-foreground"><strong className="text-foreground">Cancelación: </strong>{p.cancellationPolicy}</p>}
            <OutingInstructions rules={event.rules} steps={event.steps} />
          </div>
        ) : null}
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background pt-3">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cerrar</Button>
          <Button asChild size="sm" className="transition-all duration-300 active:scale-95">
            <Link to={bookingUrl}>Reservar plaza</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
