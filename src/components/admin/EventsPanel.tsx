import { useAdminCatalog, usePhotoUrls, CATALOG_BUCKET } from "@/lib/adminCatalog";
import { openGroupKeyFor, type CatalogOutingStart } from "@/lib/catalogOuting";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Copy, List, Loader2, Pencil, Plus, RefreshCw, Users, X } from "lucide-react";
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
import { DeleteRecordButton } from "@/components/admin/DeleteControls";
import { EventTechSheet } from "@/components/calendario/EventTechSheet";
import { getActivityProfile, type ActivityProfile } from "@/data/activityProfiles";
import { Eye } from "lucide-react";
import { ActivityFieldsEditor } from "@/components/admin/shared/ActivityFieldsEditor";
import { catalogKeyForEvent, fieldsFromCatalog, fieldsFromSnapshot, saveFieldsToCatalog, snapshotFromFields, type ActivityFields } from "@/lib/activityFields";
import type { CatalogOverride } from "@/lib/catalogSync";
import type { Json } from "@/integrations/supabase/types";

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
  rules: string | null;
  steps: string | null;
  catalog_snapshot: CatalogOverride | null;
}

const EVENT_FIELDS =
  "id, category, slug, title, starts_at, ends_at, meeting_point_public, meeting_point_private, latitude, longitude, capacity_total, seats_reserved, price_cents, status, event_type, guide_name, notes, rules, steps, catalog_snapshot";

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

interface Attendee {
  id: string;
  participants: number;
  state: string;
  name: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  paid_amount_cents: number | null;
}

const ATTENDEE_STATE: Record<string, string> = {
  bloqueada: "Pendiente de pago",
  confirmada: "Confirmada",
};

const DEFAULT_GUIDE = "Antonio Ruiz Aguilera";

const sellableActivities = activityProfiles
  .filter((profile) => isSellable(profile))
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
  rules: "",
  steps: "",
};

type FormState = typeof emptyForm;

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function EventsPanel({ catalogStart }: { catalogStart?: CatalogOutingStart | null } = {}) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<"lista" | "mes">("lista");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [advanced, setAdvanced] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Record<string, Attendee[]>>({});
  const [fromCatalog, setFromCatalog] = useState<{ name: string; matched: boolean } | null>(null);
  // Ficha de la actividad con los mismos campos que Catálogo y Grupo privado.
  const [fields, setFields] = useState<ActivityFields | null>(null);
  const [fieldsKey, setFieldsKey] = useState(0);
  const loadFields = (f: ActivityFields | null) => { setFields(f); setFieldsKey((k) => k + 1); };

  // Salida configurada desde Catálogo: se rellena con lo ya documentado; el admin revisa antes de guardar.
  useEffect(() => {
    if (!catalogStart || catalogStart.mode !== "abierto") return;
    const { item } = catalogStart;
    const key = openGroupKeyFor(item, sellableActivities.map((a) => a.key));
    setEditingId(null);
    setForm({
      ...emptyForm,
      activityKey: key ?? "",
      priceEuros: item.pricePerPersonEuros != null ? String(item.pricePerPersonEuros) : "",
      meetingPublic: [item.zone, item.province].filter(Boolean).join(", "),
      rules: item.rules || item.requirements.map((r) => `• ${r}`).join("\n"),
      steps: item.steps ?? "",
      notes: [`Desde catálogo: ${item.name}`, item.summary].filter(Boolean).join("\n"),
    });
    setFromCatalog({ name: item.name, matched: !!key });
    loadFields(key ? fieldsFromCatalog(item) : null);
    setAdvanced(true);
    setShowForm(true);
  }, [catalogStart]);

  const toggleAttendees = async (eventId: string) => {
    if (openId === eventId) {
      setOpenId(null);
      return;
    }
    setOpenId(eventId);
    const { data, error } = await supabase
      .from("activity_event_bookings")
      .select(
        "id, participants, state, booking:bookings(name, contact, email, phone, paid_amount_cents)",
      )
      .eq("event_id", eventId)
      .neq("state", "liberada")
      .order("created_at", { ascending: true });
    if (error) {
      setMessage("No se han podido cargar los inscritos.");
      setAttendees((prev) => ({ ...prev, [eventId]: [] }));
      return;
    }
    const rows: Attendee[] = (data ?? []).map((r) => {
      const b = (Array.isArray(r.booking) ? r.booking[0] : r.booking) as Partial<Attendee> | null;
      return {
        id: r.id,
        participants: r.participants,
        state: r.state,
        name: b?.name ?? null,
        contact: b?.contact ?? null,
        email: b?.email ?? null,
        phone: b?.phone ?? null,
        paid_amount_cents: b?.paid_amount_cents ?? null,
      };
    });
    setAttendees((prev) => ({ ...prev, [eventId]: rows }));
  };

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

  // Lista de grupo abierto sincronizada con Catálogo: nombre, precio, duración y foto editados allí.
  const { items: catalogItems } = useAdminCatalog();
  const activities = useMemo(() => {
    const keys = sellableActivities.map((a) => a.key);
    const byKey = new Map(catalogItems.map((it) => [openGroupKeyFor(it, keys), it] as const));
    return sellableActivities.map((a) => {
      const it = byKey.get(a.key);
      if (!it) return { ...a, photo: null as string | null, catalogCents: null as number | null };
      const price = it.pricePerPersonEuros != null ? `${it.pricePerPersonEuros} €` : a.price;
      return { ...a, name: it.name, price, duration: it.duration || a.duration, photo: it.photos[0] ?? null,
        catalogCents: it.edited && it.pricePerPersonEuros != null ? Math.round(it.pricePerPersonEuros * 100) : null,
        label: `${a.categoryLabel} · ${it.name} (${it.zone || it.province})${it.edited ? " · editada" : ""}` };
    });
  }, [catalogItems]);
  const catalogItemFor = useCallback((activityKey: string) => {
    const keys = sellableActivities.map((a) => a.key);
    return catalogItems.find((it) => openGroupKeyFor(it, keys) === activityKey) ?? null;
  }, [catalogItems]);
  const selectedActivity = useMemo(
    () => activities.find((a) => a.key === form.activityKey),
    [activities, form.activityKey],
  );
  const photoUrls = usePhotoUrls(selectedActivity?.photo ? [selectedActivity.photo] : []);

  const filtered = useMemo(
    () => events.filter((e) => statusFilter === "todos" || e.status === statusFilter),
    [events, statusFilter],
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
    setFromCatalog(null);
    loadFields(null);
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const buildPayload = (startsAt: string) => {
    const activity = selectedActivity;
    if (!activity) throw new Error("Elige una actividad del catálogo vendible.");
    const price = form.priceEuros.trim() ? Math.round(Number(form.priceEuros) * 100) : (selectedActivity?.catalogCents ?? null);
    return {
      category: activity.category,
      slug: activity.slug,
      title: fields?.name.trim() || activity.name,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      capacity_total: form.capacity,
      event_type: form.eventType,
      status: form.status,
      guide_name: form.guideName.trim() || null,
      price_cents: Number.isFinite(price as number) ? price : null,
      meeting_point_public: form.meetingPublic.trim() || null,
      meeting_point_private: form.meetingPrivate.trim() || null,
      latitude: form.latitude.trim() ? Number(form.latitude) : null,
      longitude: form.longitude.trim() ? Number(form.longitude) : null,
      notes: form.notes.trim() || null,
      rules: form.rules.trim() || null,
      steps: form.steps.trim() || null,
      catalog_snapshot: (fields
        ? snapshotFromFields(catalogKeyForEvent(activity.category, activity.slug), fields, { zone: catalogItemFor(activity.key)?.zone, province: catalogItemFor(activity.key)?.province })
        : null) as unknown as Json,
    };
  };

  /** Salida tal como la vería un cliente en la web, con los cambios aún sin guardar. */
  const previewEvent = useMemo(() => {
    if (!selectedActivity || !form.startsAt) return null;
    const profile: ActivityProfile | undefined = getActivityProfile(selectedActivity.category, selectedActivity.slug);
    if (!profile) return null;
    const payload = buildPayload(form.startsAt);
    const reserved = events.find((e) => e.id === editingId)?.seats_reserved ?? 0;
    const freeSeats = Math.max(payload.capacity_total - reserved, 0);
    return {
      ...payload,
      catalog_snapshot: payload.catalog_snapshot as unknown as CatalogOverride | null,
      id: editingId ?? "vista-previa",
      seats_reserved: reserved,
      profile,
      startDate: new Date(payload.starts_at),
      freeSeats,
      isFull: freeSeats <= 0,
      pricePerPerson: payload.price_cents ? payload.price_cents / 100 : profile.priceValue,
      zone: payload.meeting_point_public?.trim() || profile.zone,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, selectedActivity, editingId, events]);

  // Foto propia de la vista previa (aún sin guardar): el admin firma la URL en el navegador.
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  useEffect(() => {
    const path = fields?.imagePath;
    setPreviewImageUrl(null);
    if (!path) return;
    let live = true;
    supabase.storage.from(CATALOG_BUCKET).createSignedUrl(path, 3600)
      .then(({ data }) => { if (live) setPreviewImageUrl(data?.signedUrl ?? null); });
    return () => { live = false; };
  }, [fields?.imagePath]);

  const validate = (event?: EventRow) => {
    if (!selectedActivity) return "Elige una actividad del catálogo vendible.";
    if (!form.startsAt) return "Indica la fecha y hora de salida.";
    if (!Number.isInteger(form.capacity) || form.capacity < 1 || form.capacity > 6) {
      return "La capacidad debe ser un número entero entre 1 y 6.";
    }
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
    if (error) {
      if (error.startsWith("Para publicar")) setAdvanced(true);
      return setMessage(error);
    }

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

    if (fields && selectedActivity) {
      const err = await saveFieldsToCatalog(catalogKeyForEvent(selectedActivity.category, selectedActivity.slug), fields);
      if (err) setMessage(`Salida guardada, pero no se pudo actualizar el Catálogo: ${err}`);
    }
    resetForm();
    void load();
  };

  const startEdit = (event: EventRow) => {
    setEditingId(event.id);
    setShowForm(true);
    setAdvanced(
      Boolean(
        event.ends_at ||
          event.event_type === "private" ||
          event.price_cents != null ||
          event.meeting_point_public ||
          event.meeting_point_private ||
          event.latitude != null ||
          event.notes,
      ),
    );
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
      rules: event.rules ?? "",
      steps: event.steps ?? "",
    });
    const item = catalogItemFor(`${event.category}|${event.slug}`);
    loadFields(item ? fieldsFromSnapshot(event.catalog_snapshot, fieldsFromCatalog(item), event.rules, event.steps) : null);
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
    const activity = activities.find((a) => a.key === `${event.category}|${event.slug}`);
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
          <Button
            size="sm"
            variant={openId === event.id ? "default" : "outline"}
            onClick={() => void toggleAttendees(event.id)}
            aria-label="Ver inscritos"
          >
            <Users className="mr-1 h-4 w-4" /> Inscritos
          </Button>
          <Button size="sm" variant="outline" onClick={() => startEdit(event)} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => duplicate(event)} aria-label="Duplicar">
            <Copy className="h-4 w-4" />
          </Button>
          <DeleteRecordButton
            target="event"
            id={event.id}
            onDeleted={() => void load()}
            className=""
            label="Eliminar"
          />
        </div>
        {openId === event.id && (
          <div className="w-full border-t border-border pt-3">
            {attendees[event.id] === undefined ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : attendees[event.id].length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay inscritos.</p>
            ) : (
              <ul className="space-y-2">
                {attendees[event.id].map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{a.name || "Sin nombre"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[a.phone, a.email, !a.phone && !a.email ? a.contact : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {a.participants} {a.participants === 1 ? "plaza" : "plazas"}
                      </span>
                      <Badge variant="outline">{ATTENDEE_STATE[a.state] ?? a.state}</Badge>
                      {a.paid_amount_cents ? (
                        <Badge>Señal {(a.paid_amount_cents / 100).toFixed(2)} €</Badge>
                      ) : (
                        <Badge variant="secondary">Sin pago</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
            else {
              setAdvanced(false);
              setShowForm(true);
            }
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
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>

      {showForm && (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          {fromCatalog && (
            <p role="status" className={`sm:col-span-2 rounded-lg border p-3 text-sm ${fromCatalog.matched ? "border-primary/40 bg-primary/10 text-foreground" : "border-destructive/50 bg-destructive/10 text-foreground"}`}>
              {fromCatalog.matched
                ? `Datos de «${fromCatalog.name}» cargados desde el catálogo. Revisa fecha, plazas y punto de encuentro antes de publicar.`
                : `«${fromCatalog.name}» no tiene un producto reservable idéntico para grupo abierto. Elige la actividad manualmente o créala como grupo privado.`}
            </p>
          )}
          <div className="sm:col-span-2">
            <Label>Actividad del catálogo</Label>
            <Select
              value={form.activityKey}
              onValueChange={(value) => {
                const item = catalogItemFor(value);
                const f = item ? fieldsFromCatalog(item) : null;
                setForm({ ...form, activityKey: value, priceEuros: f?.pricePerPersonEuros != null ? String(f.pricePerPersonEuros) : "", rules: f?.rules ?? form.rules, steps: f?.steps ?? form.steps });
                loadFields(f);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Elige una actividad" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {activities.map((activity) => (
                  <SelectItem key={activity.key} value={activity.key}>
                    {activity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedActivity && (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/60 p-2">
                <img
                  src={(selectedActivity.photo && photoUrls[selectedActivity.photo]) || selectedActivity.image}
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
            <Label htmlFor="capacity">Plazas totales</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={6}
              step={1}
              className="mt-1 text-foreground"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
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
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              aria-expanded={advanced}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 active:scale-95"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${advanced ? "rotate-180" : ""}`}
              />
              {advanced ? "Ocultar opciones avanzadas" : "Opciones avanzadas"}
            </button>
          </div>
          {advanced && (
            <>
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
                <Label htmlFor="guide">Guía</Label>
                <Input
                  id="guide"
                  className="mt-1 text-foreground"
                  value={form.guideName}
                  onChange={(e) => setForm({ ...form, guideName: e.target.value })}
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
            </>
          )}
          <div className="flex gap-2 sm:col-span-2">
            {fields ? (
              <div className="w-full space-y-2 border-t border-border pt-4">
                <ActivityFieldsEditor key={fieldsKey} id="event" value={fields} onChange={(f) => {
                  setFields(f);
                  setForm((prev) => ({ ...prev, priceEuros: f.pricePerPersonEuros != null ? String(f.pricePerPersonEuros) : "", rules: f.rules, steps: f.steps }));
                }} />
                <p className="text-xs text-muted-foreground">Al guardar, estos datos (salvo el precio) se guardan también en el Catálogo para las salidas nuevas. Las salidas ya creadas conservan los suyos.</p>
              </div>
            ) : (
              <fieldset className="w-full space-y-3 border-t border-border pt-4">
                <legend className="font-heading font-semibold text-foreground">Normas y pasos a seguir</legend>
                <div><Label htmlFor="event-rules">Normas (una por línea)</Label><Textarea id="event-rules" rows={4} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /></div>
                <div><Label htmlFor="event-steps">Pasos a seguir (uno por línea)</Label><Textarea id="event-steps" rows={4} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} /></div>
              </fieldset>
            )}
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar cambios" : "Crear salida"}
            </Button>
            {previewEvent ? (
              <EventTechSheet
                event={previewEvent}
                bookingUrl="#"
                imageUrlOverride={previewImageUrl}
                trigger={
                  <Button type="button" variant="secondary">
                    <Eye className="mr-2 h-4 w-4" /> Vista previa en la web
                  </Button>
                }
              />
            ) : (
              <Button type="button" variant="secondary" disabled title="Elige actividad y fecha">
                <Eye className="mr-2 h-4 w-4" /> Vista previa en la web
              </Button>
            )}
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
