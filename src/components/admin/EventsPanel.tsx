import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw } from "lucide-react";
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
  meeting_point_public: string | null;
  meeting_point_private: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity_total: number;
  seats_reserved: number;
  price_cents: number | null;
  status: string;
  notes: string | null;
}

const STATUSES = ["borrador", "publicada", "completa", "cancelada"] as const;

const sellableActivities = activityProfiles
  .filter((profile) => isSellable(profile) && profile.category !== "espeleologia")
  .map((profile) => ({
    key: `${profile.category}|${profile.slug}`,
    label: `${profile.categoryLabel} · ${profile.name} (${profile.zone})`,
    category: profile.category,
    slug: profile.slug,
    name: profile.name,
  }));

const emptyForm = {
  activityKey: "",
  startsAt: "",
  capacity: 6,
  meetingPublic: "",
  meetingPrivate: "",
  latitude: "",
  longitude: "",
  notes: "",
};

export function EventsPanel() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_events")
      .select(
        "id, category, slug, title, starts_at, meeting_point_public, meeting_point_private, latitude, longitude, capacity_total, seats_reserved, price_cents, status, notes",
      )
      .order("starts_at", { ascending: true })
      .limit(200);
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

  const create = async () => {
    if (!selectedActivity) return setMessage("Elige una actividad del catálogo.");
    if (!form.startsAt) return setMessage("Indica la fecha y hora de salida.");
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("activity_events").insert({
      category: selectedActivity.category,
      slug: selectedActivity.slug,
      title: selectedActivity.name,
      starts_at: new Date(form.startsAt).toISOString(),
      capacity_total: Math.min(20, Math.max(1, form.capacity)),
      meeting_point_public: form.meetingPublic.trim() || null,
      meeting_point_private: form.meetingPrivate.trim() || null,
      latitude: form.latitude.trim() ? Number(form.latitude) : null,
      longitude: form.longitude.trim() ? Number(form.longitude) : null,
      notes: form.notes.trim() || null,
      status: "borrador",
    });

    setSaving(false);
    if (error) {
      setMessage("No se ha podido crear la salida.");
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    setMessage("Salida creada como borrador. Publícala cuando esté confirmada.");
    void load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("activity_events").update({ status }).eq("id", id);
    if (error) setMessage("No se ha podido actualizar el estado.");
    void load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> Nueva salida
        </Button>
        <Button size="sm" variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-1 h-4 w-4" /> Actualizar
        </Button>
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
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              className="mt-1 text-foreground"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={create} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear salida
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Cargando salidas…</p>
      ) : events.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay salidas programadas.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.starts_at).toLocaleString("es-ES")} · {event.category} ·{" "}
                  {event.seats_reserved}/{event.capacity_total} plazas ocupadas
                </p>
                {event.meeting_point_public && (
                  <p className="text-xs text-muted-foreground">Zona: {event.meeting_point_public}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={event.status === "publicada" ? "default" : "secondary"}>
                  {event.status}
                </Badge>
                <Select value={event.status} onValueChange={(v) => updateStatus(event.id, v)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
