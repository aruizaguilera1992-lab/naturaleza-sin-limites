import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Copy, List, Loader2, Pencil, Plus, RefreshCw, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { activityProfiles, isSellable } from "@/data/activityProfiles";

interface EventRow {
  id: string;
  category: string;
  slug: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  meeting_point_public: string | null;
  meeting_point_private: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity_total: number;
  seats_reserved: number;
  price_cents: number | null;
  status: string;
  event_type: string;
  guide_name: string | null;
  notes: string | null;
}

const EVENT_FIELDS =
  "id, category, slug, title, starts_at, ends_at, meeting_point_public, meeting_point_private, latitude, longitude, capacity_total, seats_reserved, price_cents, status, event_type, guide_name, notes";

const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  completa: "Completa",
  cancelada: "Cancelada",
  completada: "Realizada",
};

const STATUS_STYLES: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  publicada: "bg-primary text-primary-foreground",
  completa: "bg-amber-500/20 text-amber-400",
  cancelada: "bg-destructive/20 text-destructive",
  completada: "bg-emerald-500/20 text-emerald-400",
};

const STATUSES = Object.keys(STATUS_LABELS);

const DEFAULT_GUIDE = "Antonio Ruiz Aguilera";

const sellableActivities = activityProfiles
  .filter((profile) => isSellable(profile) && profile.category !== "espeleologia")
  .map((profile) => ({
    key: `${profile.category}|${profile.slug}`,
    label: `${profile.categoryLabel} · ${profile.name} (${profile.zone})`,
    category: profile.category,
    slug: profile.slug,
    name: profile.name,
    price: profile.price,
    priceValue: profile.priceValue,
    duration: profile.totalDuration,
    image: profile.image,
    categoryLabel: profile.categoryLabel,
  }));

const categories = [...new Set(sellableActivities.map((a) => a.category))];

const emptyForm = {
  activityKey: "",
  startsAt: "",
  endsAt: "",
  extraDates: "",
  capacity: 6,
  eventType: "open_group",
  status: "borrador",
  guideName: DEFAULT_GUIDE,
  priceEuros: "",
  meetingPublic: "",
  meetingPrivate: "",
  latitude: "",
  longitude: "",
  notes: "",
};

type FormState = typeof emptyForm;

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function EventsPanel() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<"lista" | "mes">("lista");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_events")
      .select(EVENT_FIELDS)
      .order("starts_at", { ascending: true })
      .limit(300);
    if (error) setMessage("No se han podido cargar las salidas.");
    setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedActivity = useMemo(
    () => sellableActivities.find((a) => a.key === form.activityKey),
    [form.activityKey],
  );

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (statusFilter === "todos" || e.status === statusFilter) &&
          (categoryFilter === "todas" || e.category === categoryFilter),
      ),
    [events, statusFilter, categoryFilter],
  );

  const monthGroups = useMemo(() => {
    const groups = new Map<string, EventRow[]>();
    filtered.forEach((event) => {
      const d = new Date(event.starts_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      groups.set(key, [...(groups.get(key) ?? []), event]);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const buildPayload = (startsAt: string) => {
    const activity = selectedActivity!;
    const price = form.priceEuros.trim() ? Math.round(Number(form.priceEuros) * 100) : null;
    return {
      category: activity.category,
      slug: activity.slug,
      title: activity.name,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      capacity_total: Math.min(20, Math.max(1, form.capacity)),
      event_type: form.eventType,
      status: form.status,
      guide_name: form.guideName.trim() || null,
      price_cents: Number.isFinite(price as number) ? price : null,
      meeting_point_public: form.meetingPublic.trim() || null,
      meeting_point_private: form.meetingPrivate.trim() || null,
      latitude: form.latitude.trim() ? Number(form.latitude) : null,
      longitude: form.longitude.trim() ? Number(form.longitude) : null,
      notes: form.notes.trim() || null,
    };
  };

  const validate = (event?: EventRow) => {
    if (!selectedActivity) return "Elige una actividad del catálogo vendible.";
    if (!form.startsAt) return "Indica la fecha y hora de salida.";
    if (form.capacity < 1) return "La capacidad debe ser mayor que cero.";
    if (event && form.capacity < event.seats_reserved) {
      return `No puedes bajar de ${event.seats_reserved} plazas: ya están reservadas.`;
    }
    if (form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      return "La hora de fin debe ser posterior al inicio.";
    }
    if ((form.latitude.trim() === "") !== (form.longitude.trim() === "")) {
      return "Indica latitud y longitud juntas, o deja ambas vacías.";
    }
    if (form.status === "publicada" && !form.meetingPublic.trim()) {
      return "Para publicar necesitas indicar la zona pública de encuentro.";
    }
    return null;
  };

  const save = async () => {
    const editing = events.find((e) => e.id === editingId);
    const error = validate(editing);
    if (error) return setMessage(error);

    setSaving(true);
    setMessage(null);

    if (editingId) {
      const { error: updateError } = await supabase
        .from("activity_events")
        .update(buildPayload(form.startsAt))
        .eq("id", editingId);
      setSaving(false);
      if (updateError) return setMessage("No se ha podido guardar la salida.");
      setMessage("Salida actualizada.");
    } else {
      const dates = [
        form.startsAt,
        ...form.extraDates
          .split(/[\n,]/)
          .map((d) => d.trim())
          .filter(Boolean),
      ];
      const { error: insertError } = await supabase
        .from("activity_events")
        .insert(dates.map((d) => buildPayload(d)));
      setSaving(false);
      if (insertError) return setMessage("No se ha podido crear la salida.");
      setMessage(
        dates.length > 1 ? `${dates.length} salidas creadas.` : "Salida creada correctamente.",
      );
    }

    resetForm();
    void load();
  };

  const startEdit = (event: EventRow) => {
    setEditingId(event.id);
    setShowForm(true);
    setForm({
      activityKey: `${event.category}|${event.slug}`,
      startsAt: toLocalInput(event.starts_at),
      endsAt: toLocalInput(event.ends_at),
      extraDates: "",
      capacity: event.capacity_total,
      eventType: event.event_type,
      status: event.status,
      guideName: event.guide_name ?? "",
      priceEuros: event.price_cents != null ? String(event.price_cents / 100) : "",
      meetingPublic: event.meeting_point_public ?? "",
      meetingPrivate: event.meeting_point_private ?? "",
      latitude: event.latitude != null ? String(event.latitude) : "",
      longitude: event.longitude != null ? String(event.longitude) : "",
      notes: event.notes ?? "",
    });
  };

  const duplicate = (event: EventRow) => {
    startEdit(event);
    setEditingId(null);
    setForm((prev) => ({ ...prev, status: "borrador", startsAt: "", endsAt: "" }));
    setMessage("Copia lista: elige la nueva fecha y guarda.");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("activity_events").update({ status }).eq("id", id);
    setMessage(error ? "No se ha podido actualizar el estado." : "Estado actualizado.");
    void load();
  };

  const renderEvent = (event: EventRow) => {
    const activity = sellableActivities.find((a) => a.key === `${event.category}|${event.slug}`);
    const free = Math.max(event.capacity_total - event.seats_reserved, 0);
    return (
      <div
        key={event.id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          {activity?.image && (
            <img
              src={activity.image}
              alt=""
              className="hidden h-12 w-12 rounded-lg object-cover sm:block"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(event.starts_at).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {activity?.categoryLabel ?? event.category} ·{" "}
              {event.event_type === "private" ? "Privada" : "Grupo abierto"}
            </p>
            <p className="text-xs text-muted-foreground">
              {event.seats_reserved}/{event.capacity_total} reservadas · {free} libres ·{" "}
              {event.price_cents != null
                ? `${(event.price_cents / 100).toFixed(0)} € (override)`
                : (activity?.price ?? "precio de catálogo")}{" "}
              · {activity?.duration ?? ""}
            </p>
            {event.meeting_point_public && (
              <p className="text-xs text-muted-foreground">Zona: {event.meeting_point_public}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={STATUS_STYLES[event.status] ?? ""}>
            {STATUS_LABELS[event.status] ?? event.status}
          </Badge>
          <Select value={event.status} onValueChange={(v) => updateStatus(event.id, v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => startEdit(event)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => duplicate(event)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? "Cerrar" : "Nueva salida"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-1 h-4 w-4" /> Actualizar
        </Button>
        <Button
          size="sm"
          variant={view === "lista" ? "default" : "outline"}
          onClick={() => setView("lista")}
        >
          <List className="mr-1 h-4 w-4" /> Lista
        </Button>
        <Button
          size="sm"
          variant={view === "mes" ? "default" : "outline"}
          onClick={() => setView("mes")}
        >
          <CalendarDays className="mr-1 h-4 w-4" /> Por mes
        </Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las actividades</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>

      {showForm && (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Actividad del catálogo</Label>
            <Select
              value={form.activityKey}
              onValueChange={(value) => setForm({ ...form, activityKey: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Elige una actividad" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {sellableActivities.map((activity) => (
                  <SelectItem key={activity.key} value={activity.key}>
                    {activity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedActivity && (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/60 p-2">
                <img
                  src={selectedActivity.image}
                  alt=""
                  className="h-12 w-12 rounded-md object-cover"
                />
                <p className="text-xs text-muted-foreground">
                  {selectedActivity.name} · {selectedActivity.price} ·{" "}
                  {selectedActivity.duration}
                </p>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="startsAt">Fecha y hora de salida</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              className="mt-1 text-foreground"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endsAt">Fin (opcional)</Label>
            <Input
              id="endsAt"
              type="datetime-local"
              className="mt-1 text-foreground"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="capacity">Plazas totales</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={20}
              className="mt-1 text-foreground"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) || 6 })}
            />
          </div>
          <div>
            <Label>Tipo de salida</Label>
            <Select
              value={form.eventType}
              onValueChange={(value) => setForm({ ...form, eventType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open_group">Grupo abierto</SelectItem>
                <SelectItem value="private">Privada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="guide">Guía</Label>
            <Input
              id="guide"
              className="mt-1 text-foreground"
              value={form.guideName}
              onChange={(e) => setForm({ ...form, guideName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="price">Precio override (€/persona, opcional)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              className="mt-1 text-foreground"
              value={form.priceEuros}
              onChange={(e) => setForm({ ...form, priceEuros: e.target.value })}
              placeholder="Vacío = precio del catálogo"
            />
          </div>
          <div>
            <Label htmlFor="meetingPublic">Zona pública (visible en la web)</Label>
            <Input
              id="meetingPublic"
              className="mt-1 text-foreground"
              value={form.meetingPublic}
              onChange={(e) => setForm({ ...form, meetingPublic: e.target.value })}
              placeholder="Ej. El Chorro, Álora"
            />
          </div>
          <div>
            <Label htmlFor="meetingPrivate">Punto de encuentro exacto (privado)</Label>
            <Input
              id="meetingPrivate"
              className="mt-1 text-foreground"
              value={form.meetingPrivate}
              onChange={(e) => setForm({ ...form, meetingPrivate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="latitude">Latitud aproximada (opcional)</Label>
            <Input
              id="latitude"
              className="mt-1 text-foreground"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitud aproximada (opcional)</Label>
            <Input
              id="longitude"
              className="mt-1 text-foreground"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
          {!editingId && (
            <div className="sm:col-span-2">
              <Label htmlFor="extraDates">Fechas adicionales (una por línea)</Label>
              <Textarea
                id="extraDates"
                className="mt-1 text-foreground"
                value={form.extraDates}
                onChange={(e) => setForm({ ...form, extraDates: e.target.value })}
                placeholder="2026-10-04T09:00&#10;2026-10-18T09:00"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              className="mt-1 text-foreground"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar cambios" : "Crear salida"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Cargando salidas…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No hay salidas con estos filtros.</p>
      ) : view === "lista" ? (
        <div className="space-y-3">{filtered.map(renderEvent)}</div>
      ) : (
        <div className="space-y-6">
          {monthGroups.map(([key, monthEvents]) => (
            <div key={key} className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {new Date(`${key}-01T00:00:00`).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>
              {monthEvents.map(renderEvent)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
