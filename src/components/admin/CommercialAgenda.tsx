import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { agendaCounts, buildAgenda, formatAgendaDate, type AgendaBucket, type AgendaContact, type AgendaFilter } from "@/lib/commercialAgenda";

type Props<T extends AgendaContact> = {
  contacts: T[];
  stageLabels: Record<string, string>;
  onOpen: (id: string) => void;
};

const BUCKETS: { id: AgendaBucket; label: string }[] = [
  { id: "vencido", label: "Vencidos" },
  { id: "hoy", label: "Hoy" },
  { id: "proximo7", label: "Próximos 7 días" },
  { id: "sin_seguimiento", label: "Sin seguimiento" },
];
const FILTERS: { id: AgendaFilter; label: string }[] = [{ id: "todos", label: "Todos" }, ...BUCKETS];
const BUCKET_LABEL = Object.fromEntries(BUCKETS.map((b) => [b.id, b.label])) as Record<AgendaBucket, string>;

/** Vista diaria de seguimiento comercial; solo lee los contactos ya cargados. */
export function CommercialAgenda<T extends AgendaContact>({ contacts, stageLabels, onOpen }: Props<T>) {
  const [filter, setFilter] = useState<AgendaFilter>("todos");
  const [q, setQ] = useState("");
  const counts = useMemo(() => agendaCounts(contacts), [contacts]);
  const items = useMemo(() => buildAgenda(contacts, filter, q), [contacts, filter, q]);

  return (
    <section aria-labelledby="agenda-title" className="space-y-5">
      <div>
        <h2 id="agenda-title" className="font-heading text-2xl text-foreground">Agenda comercial</h2>
        <p className="text-sm text-muted-foreground">Qué requiere atención y cuál es el siguiente paso.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {BUCKETS.map((b) => {
          const active = filter === b.id;
          const n = counts[b.id];
          return (
            <button key={b.id} type="button" aria-pressed={active} onClick={() => setFilter(active ? "todos" : b.id)}
              className={`rounded-lg border bg-card px-4 py-3 text-left transition-all duration-300 active:scale-95 ${active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary"}`}>
              <span className="block text-xs uppercase tracking-wide text-muted-foreground">{b.label}</span>
              <span className={`font-heading text-2xl ${n && b.id === "vencido" ? "text-destructive" : n && b.id === "hoy" ? "text-primary" : "text-foreground"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="group" aria-label="Filtrar agenda" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? "default" : "outline"} aria-pressed={filter === f.id}
              className="shrink-0" onClick={() => setFilter(f.id)}>{f.label}</Button>
          ))}
        </div>
        <label className="relative sm:ml-auto sm:w-72">
          <span className="sr-only">Buscar en la agenda</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, interés, email o teléfono" className="pl-9" />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-heading text-foreground">{q ? "Ningún contacto coincide con la búsqueda" : "Nada pendiente en este filtro"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Prueba con otro filtro o búsqueda.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {items.map(({ contact: c, bucket }) => {
            const when = bucket === "sin_seguimiento" ? null : formatAgendaDate(c.next_action_at);
            return (
              <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{c.nombre}</p>
                    <Badge variant={bucket === "vencido" ? "destructive" : bucket === "hoy" ? "default" : "outline"}>{BUCKET_LABEL[bucket]}</Badge>
                    {c.priority && <Badge variant={c.priority === "alta" ? "destructive" : "secondary"}>Prioridad {c.priority}</Badge>}
                    <Badge variant="outline">{stageLabels[c.pipeline_stage ?? "nuevo"] ?? "Nuevo"}</Badge>
                  </div>
                  {c.interes && <p className="truncate text-sm text-muted-foreground">{c.interes}</p>}
                  <p className="mt-1 text-sm text-foreground">
                    {bucket === "sin_seguimiento" || !c.next_action?.trim() ? <span className="text-muted-foreground">Sin próxima acción</span> : c.next_action}
                    {when && <span className="text-muted-foreground"> · {when}</span>}
                  </p>
                </div>
                <Button size="sm" className="min-h-11 shrink-0" onClick={() => onOpen(c.id)} aria-label={`Abrir seguimiento de ${c.nombre}`}>
                  Abrir seguimiento
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
