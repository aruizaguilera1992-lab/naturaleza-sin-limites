import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventsPanel } from "@/components/admin/EventsPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { getStripeEnvironment } from "@/lib/stripe";
import {
  Loader2,
  Mountain,
  LogOut,
  RefreshCw,
  Save,
  CreditCard,
  Copy,
  Mail,
  CheckCircle2,
  Home,
  CalendarCheck,
  CalendarDays,
  Inbox,
  Bell,
  Settings,
  MessageCircle,
  Menu,
  Search,
  ChevronRight,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import { BusinessSettingsPanel } from "@/components/admin/BusinessSettingsPanel";
import { PlanOrdersPanel } from "@/components/admin/PlanOrdersPanel";

type AdminTab = "overview" | "bookings" | "contacts" | "notifications" | "events" | "settings" | "plans";


type NotesFieldProps = {
  id: string;
  value: string | null;
  onSave: (notes: string) => Promise<void>;
};

function NotesField({ id, value, onSave }: NotesFieldProps) {
  const [notes, setNotes] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = notes !== (value ?? "");

  return (
    <div className="mt-4 border-t border-border pt-3">
      <label htmlFor={`notes-${id}`} className="text-sm text-muted-foreground">
        Notas internas
      </label>
      <Textarea
        id={`notes-${id}`}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Seguimiento, llamadas, acuerdos..."
        className="mt-2 min-h-[70px] text-sm text-foreground"
      />
      <div className="mt-2 flex justify-end">
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            await onSave(notes);
            setSaving(false);
          }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar nota
        </Button>
      </div>
    </div>
  );
}



type PaymentRequest = {
  id: string;
  booking_id: string | null;
  contact_id: string | null;
  token: string;
  amount_cents: number;
  currency: string;
  concept: string;
  status: string;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  kind?: string;
};

type Booking = {
  id: string;
  activity: string;
  preferred_date: string | null;
  number_of_people: string | null;
  experience_level: string | null;
  contact: string;
  name: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  paid_amount_cents: number | null;
  paid_at: string | null;
  payment_reference: string | null;
  event_id: string | null;
};

type Contact = {
  id: string;
  nombre: string;
  contacto: string;
  interes: string;
  personas: string | null;
  mensaje: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  paid_amount_cents: number | null;
  paid_at: string | null;
  payment_reference: string | null;
};

const STATUSES = ["nueva", "contactada", "pendiente_pago", "confirmada", "cancelada"] as const;

const formatAmount = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

type PaymentPanelProps = {
  target: "booking" | "contact";
  id: string;
  defaultConcept: string;
  payments: PaymentRequest[];
  onCreated: () => void;
};

function PaymentPanel({ target, id, defaultConcept, payments, onCreated }: PaymentPanelProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState(defaultConcept);
  const [creating, setCreating] = useState(false);

  const create = async (withEmail: boolean) => {
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value < 0.5) {
      toast({ title: "Importe no válido", description: "Introduce un importe mínimo de 0,50 €", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("create-payment-link", {
      body: {
        target,
        id,
        amountCents: Math.round(value * 100),
        concept: concept.trim() || defaultConcept,
        environment: getStripeEnvironment(),
        sendEmail: withEmail,
        baseUrl: window.location.origin,
      },
    });
    setCreating(false);
    if (error || !data?.url) {
      toast({ title: "No se pudo generar el cobro", description: error?.message, variant: "destructive" });
      return;
    }
    await navigator.clipboard.writeText(data.url).catch(() => undefined);

    const emailStatus: string | undefined = data.email?.status;
    if (withEmail && emailStatus !== "enviado") {
      toast({
        title: "Enlace creado, pero el email NO se ha enviado",
        description:
          data.email?.error ??
          "Revisa la configuración de correo. Puedes reintentarlo desde Notificaciones.",
        variant: "destructive",
      });
    } else {
      toast({
        title: withEmail ? "Enlace enviado por email" : "Enlace creado y copiado",
        description: data.url,
      });
    }
    setAmount("");
    onCreated();
  };

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CreditCard className="h-3.5 w-3.5" /> Cobros
      </p>

      {payments.length > 0 && (
        <div className="mt-2 space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground">
                {p.status === "pagado" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {formatAmount(p.amount_cents, p.currency)} · {p.concept}
              </span>
              <span className="flex items-center gap-2">
                <Badge variant={p.status === "pagado" ? "default" : "outline"}>{p.status === "pagado" ? "Pagado" : p.status === "pendiente" ? "Sin pagar" : p.status}</Badge>
                {p.status !== "pagado" && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/pago/${p.token}`);
                        toast({ title: "Enlace copiado" });
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copiar enlace
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={() => {
                        const text = `¡Hola! Para confirmar tu plaza (${p.concept}) puedes pagar ${formatAmount(
                          p.amount_cents,
                          p.currency,
                        )} de forma segura aquí:\n${window.location.origin}/pago/${p.token}\n\nGracias, Naturaleza Sin Límites`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Mensaje para WhatsApp copiado" });
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Copiar para WhatsApp
                    </Button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          aria-label="Importe en euros"
          placeholder="Importe €"
          className="h-11 w-28 text-foreground"
        />
        <Input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          aria-label="Concepto del cobro"
          placeholder="Concepto"
          className="h-11 min-w-[180px] flex-1 text-foreground"
        />
        <Button variant="outline" className="min-h-11 gap-2" disabled={creating} onClick={() => create(false)}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Generar enlace
        </Button>
        <Button className="min-h-11 gap-2" disabled={creating} onClick={() => create(true)}>
          <Mail className="h-4 w-4" /> Enviar por email
        </Button>
      </div>
    </div>
  );
}

type NotificationRow = {
  id: string;
  kind: string;
  recipient: string | null;
  subject: string | null;
  status: string;
  error: string | null;
  attempts: number;
  created_at: string;
};


const statusVariant = (status: string) => {
  switch (status) {
    case "confirmada":
      return "default";
    case "cancelada":
      return "destructive";
    case "contactada":
      return "secondary";
    default:
      return "outline";
  }
};

const STATUS_LABELS: Record<string, string> = {
  nueva: "Nueva",
  contactada: "Contactada",
  pendiente_pago: "Pendiente de pago",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};
const statusLabel = (s: string) =>
  STATUS_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "nueva"
      ? "border-primary/60 bg-primary/15 text-primary"
      : status === "pendiente_pago"
        ? "border-accent bg-accent/20 text-foreground"
        : status === "confirmada"
          ? "border-transparent bg-primary text-primary-foreground"
          : status === "cancelada"
            ? "border-destructive/60 bg-destructive/15 text-foreground line-through decoration-1"
            : "border-border bg-muted text-foreground";
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {statusLabel(status)}
    </span>
  );
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Preferred date is free text; show a readable Spanish date only when it is an ISO date. */
const formatPreferred = (value: string | null) => {
  if (!value) return "Sin fecha";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });


export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<unknown>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [eventsById, setEventsById] = useState<
    Record<string, { id: string; title: string; starts_at: string }>
  >({});

  const loadData = useCallback(async () => {
    const [b, c, p, n] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_requests").select("*").order("created_at", { ascending: false }),
      supabase
        .from("notification_log")
        .select("id, kind, recipient, subject, status, error, attempts, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setLoadError(!!(b.error || c.error || p.error || n.error));
    if (b.data) setBookings(b.data as Booking[]);
    if (c.data) setContacts(c.data as Contact[]);
    if (p.data) setPayments(p.data as PaymentRequest[]);
    if (n.data) setNotifications(n.data as NotificationRow[]);
    const ids = [...new Set((b.data ?? []).map((r) => r.event_id).filter(Boolean))] as string[];
    if (ids.length) {
      const { data: ev } = await supabase
        .from("activity_events")
        .select("id, title, starts_at")
        .in("id", ids);
      setEventsById(Object.fromEntries((ev ?? []).map((e) => [e.id, e])));
    }
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const retryNotification = async (id: string) => {
    setRetrying(id);
    const { data, error } = await supabase.functions.invoke("retry-notification", {
      body: { id },
    });
    setRetrying(null);
    if (data?.status === "ya_enviado") {
      toast({ title: "Ya estaba enviada", description: "No se duplica el aviso." });
    } else if (data?.status === "reclamado_por_otro") {
      toast({
        title: "Envío en curso",
        description: "Otro proceso está enviando este aviso. Inténtalo en unos minutos.",
      });
    } else if (error || data?.status !== "enviado") {
      toast({
        title: "El reenvío no se ha completado",
        description: data?.error ?? error?.message ?? "Revisa la configuración de correo.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Notificación reenviada" });
    }
    await loadData();
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (!data.session) {
        setLoading(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin");
      const admin = !!roles && roles.length > 0;
      setIsAdmin(admin);
      if (admin) await loadData();
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        if (active) init();
      }, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadData]);

  const updateStatus = async (
    table: "bookings" | "contact_submissions",
    id: string,
    status: string,
  ) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    if (table === "bookings") {
      setBookings((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } else {
      setContacts((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
    toast({ title: "Estado actualizado" });
  };

  const updateNotes = async (
    table: "bookings" | "contact_submissions",
    id: string,
    admin_notes: string,
  ) => {
    const value = admin_notes.trim() ? admin_notes : null;
    const { error } = await supabase.from(table).update({ admin_notes: value }).eq("id", id);
    if (error) {
      toast({ title: "No se pudo guardar la nota", description: error.message, variant: "destructive" });
      return;
    }
    if (table === "bookings") {
      setBookings((prev) => prev.map((r) => (r.id === id ? { ...r, admin_notes: value } : r)));
    } else {
      setContacts((prev) => prev.map((r) => (r.id === id ? { ...r, admin_notes: value } : r)));
    }
    toast({ title: "Nota guardada" });
  };


  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background" role="status" aria-label="Cargando panel">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center rounded-xl border border-border bg-card p-8">
          <Mountain className="h-8 w-8 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Panel de gestión</h1>
          <p className="text-muted-foreground mb-6">Inicia sesión para acceder a las solicitudes.</p>
          <Button asChild className="w-full">
            <Link to="/login?next=/admin">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-heading font-bold mb-2">Sin permisos</h1>
          <p className="text-muted-foreground mb-6">
            Tu cuenta no tiene rol de administrador. Pide que te asignen acceso.
          </p>
          <Button variant="outline" onClick={() => supabase.auth.signOut()} className="gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  const pendingNotifications = notifications.filter((n) => n.status !== "enviado").length;
  const newBookings = bookings.filter((b) => b.status === "nueva").length;
  const pendingPayBookings = bookings.filter((b) => b.status === "pendiente_pago").length;
  const newContacts = contacts.filter((c) => c.status === "nueva").length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const paidThisMonth = payments
    .filter((p) => p.status === "pagado" && p.paid_at && new Date(p.paid_at) >= monthStart)
    .reduce((sum, p) => sum + p.amount_cents, 0);
  const pendingLinks = payments.filter((p) => p.status === "pendiente").length;

  const NAV: { id: AdminTab; label: string; subtitle: string; icon: typeof Home; count?: number }[] = [
    { id: "overview", label: "Resumen", subtitle: "Lo pendiente de hoy, de un vistazo.", icon: Home },
    { id: "bookings", label: "Reservas", subtitle: "Solicitudes y reservas de actividades.", icon: CalendarCheck, count: newBookings },
    { id: "contacts", label: "Contactos", subtitle: "Mensajes recibidos desde la web.", icon: Inbox, count: newContacts },
    { id: "events", label: "Calendario", subtitle: "Salidas programadas y plazas.", icon: CalendarDays },
    { id: "plans", label: "Planes", subtitle: "Suscripciones de Vértigo Sapiens.", icon: Repeat },
    { id: "notifications", label: "Notificaciones", subtitle: "Correos enviados y fallidos.", icon: Bell, count: pendingNotifications },
    { id: "settings", label: "Ajustes legales", subtitle: "Datos legales del negocio.", icon: Settings },
  ];
  const current = NAV.find((n) => n.id === tab)!;
  const go = (t: AdminTab, filter = "all") => {
    setTab(t);
    setSearch("");
    setStatusFilter(filter);
    setSelectedId(null);
    setMenuOpen(false);
  };

  const navList = (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-1">
      {NAV.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => go(n.id)}
          aria-current={tab === n.id ? "page" : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            tab === n.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <n.icon className="h-4 w-4" aria-hidden="true" />
          <span className="flex-1 text-left">{n.label}</span>
          {!!n.count && (
            <span
              className={`rounded-full px-2 text-xs font-semibold ${
                tab === n.id ? "bg-background text-foreground" : "bg-primary/20 text-primary"
              }`}
              aria-label={`${n.count} pendientes`}
            >
              {n.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  const q = search.trim().toLowerCase();
  const filteredBookings = bookings.filter(
    (b) =>
      (statusFilter === "all" || b.status === statusFilter) &&
      (!q ||
        [b.name, b.contact, b.activity].some((v) => (v ?? "").toLowerCase().includes(q))),
  );
  const filteredContacts = contacts.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      (!q || [c.nombre, c.contacto, c.interes].some((v) => (v ?? "").toLowerCase().includes(q))),
  );
  const selectedBooking = bookings.find((b) => b.id === selectedId) ?? null;
  const selectedContact = contacts.find((c) => c.id === selectedId) ?? null;

  const bookingDate = (b: Booking) =>
    b.event_id && eventsById[b.event_id]
      ? formatDateTime(eventsById[b.event_id].starts_at)
      : formatPreferred(b.preferred_date);

  const toolbar = (total: number, shown: number, placeholder: string) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="admin-search" className="text-sm text-muted-foreground">
          Buscar
        </Label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="admin-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="h-11 pl-9 text-foreground"
          />
        </div>
      </div>
      <div className="sm:w-56">
        <Label htmlFor="admin-status" className="text-sm text-muted-foreground">
          Estado
        </Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="admin-status" className="mt-1.5 h-11 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground sm:pb-3" aria-live="polite">
        {shown === total ? `${total} en total` : `${shown} de ${total}`}
      </p>
    </div>
  );

  const emptyState = (title: string, hint?: string) => (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-heading font-semibold text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      {(search || statusFilter !== "all") && (
        <Button
          variant="outline"
          className="mt-4 min-h-11"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  const StatusSelect = ({ table, id, value }: { table: "bookings" | "contact_submissions"; id: string; value: string }) => (
    <div>
      <Label htmlFor={`status-${id}`} className="text-sm text-muted-foreground">
        Cambiar estado
      </Label>
      <Select value={value} onValueChange={(v) => updateStatus(table, id, v)}>
        <SelectTrigger id={`status-${id}`} className="mt-1.5 h-11 text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {statusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) =>
    value === null || value === undefined || value === "" ? null : (
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm text-foreground break-words">{value}</dd>
      </div>
    );

  const rowClass =
    "cursor-pointer border-b border-border transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted";

  return (
    <div className="min-h-dvh bg-background md:flex">
      <Helmet>
        <title>Panel de gestión | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <aside className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-5 py-6 font-heading font-bold text-foreground">
          <Mountain className="h-5 w-5 text-primary" aria-hidden="true" /> Gestión NSL
        </div>
        <div className="flex-1 overflow-y-auto px-3">{navList}</div>
        <div className="border-t border-border p-3">
          <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="min-h-11 w-full justify-start gap-2">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Salir
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-2 md:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Abrir menú del panel">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card p-4">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="flex items-center gap-2 font-heading">
                <Mountain className="h-5 w-5 text-primary" aria-hidden="true" /> Gestión NSL
              </SheetTitle>
            </SheetHeader>
            {navList}
            <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="mt-6 min-h-11 w-full justify-start gap-2">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Salir
            </Button>
          </SheetContent>
        </Sheet>
        <span className="font-heading font-semibold text-foreground">{current.label}</span>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={refresh} aria-label="Actualizar datos" disabled={refreshing}>
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{current.label}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={refreshing} className="hidden min-h-11 gap-2 md:inline-flex">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" /> Actualizar
          </Button>
        </div>

        {loadError && (
          <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" /> No se pudieron cargar algunos datos.
            </span>
            <Button size="sm" variant="outline" onClick={refresh} className="min-h-11">Reintentar</Button>
          </div>
        )}

        <div className="max-w-6xl space-y-4">
          {tab === "overview" && (
            <>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Reservas nuevas", value: newBookings, go: "bookings" as AdminTab, filter: "nueva" },
                  { label: "Pendientes de pago", value: pendingPayBookings, go: "bookings" as AdminTab, filter: "pendiente_pago" },
                  { label: "Contactos nuevos", value: newContacts, go: "contacts" as AdminTab, filter: "nueva" },
                  { label: "Avisos con fallo", value: pendingNotifications, go: "notifications" as AdminTab },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => go(s.go, s.filter ?? "all")}
                    className="rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5"
                  >
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className={`mt-1 font-heading text-3xl font-bold ${s.value ? "text-primary" : "text-foreground"}`}>{s.value}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                  <p className="text-sm text-muted-foreground">Cobrado este mes</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-foreground">{formatAmount(paidThisMonth, "eur")}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                  <p className="text-sm text-muted-foreground">Enlaces de pago sin pagar</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-foreground">{pendingLinks}</p>
                </div>
              </div>
              <section className="rounded-xl border border-border bg-card" aria-labelledby="todo-title">
                <h2 id="todo-title" className="border-b border-border px-4 py-3 font-heading font-semibold text-foreground md:px-5">
                  Por atender
                </h2>
                {bookings.filter((b) => b.status === "nueva" || b.status === "pendiente_pago").length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nada pendiente. Todo al día.</p>
                ) : (
                  <ul>
                    {bookings
                      .filter((b) => b.status === "nueva" || b.status === "pendiente_pago")
                      .slice(0, 6)
                      .map((b) => (
                        <li key={b.id} className="border-b border-border last:border-0">
                          <button
                            type="button"
                            onClick={() => {
                              go("bookings");
                              setSelectedId(b.id);
                            }}
                            className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted md:px-5"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-foreground">{b.activity}</span>
                              <span className="block truncate text-sm text-muted-foreground">
                                {b.name || b.contact} · {bookingDate(b)}
                              </span>
                            </span>
                            <StatusBadge status={b.status} />
                            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            </>
          )}
          {tab === "settings" && <BusinessSettingsPanel />}
          {tab === "events" && <EventsPanel />}
          {tab === "plans" && <PlanOrdersPanel />}

          {tab === "bookings" && (
            <>
              {toolbar(bookings.length, filteredBookings.length, "Cliente, email o actividad")}
              {filteredBookings.length === 0 ? (
                emptyState(
                  bookings.length === 0 ? "Todavía no hay reservas" : "Ninguna reserva coincide",
                  bookings.length === 0 ? "Aparecerán aquí cuando alguien reserve o solicite fecha." : "Prueba con otra búsqueda o estado.",
                )
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-medium">Actividad</th>
                          <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
                          <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                          <th scope="col" className="px-4 py-3 font-medium text-center">Pers.</th>
                          <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b) => (
                          <tr
                            key={b.id}
                            tabIndex={0}
                            onClick={() => setSelectedId(b.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedId(b.id);
                              }
                            }}
                            aria-label={`Abrir reserva de ${b.name || b.contact}: ${b.activity}`}
                            className={rowClass}
                          >
                            <td className="max-w-[260px] truncate px-4 py-3 font-medium text-foreground">{b.activity}</td>
                            <td className="max-w-[220px] px-4 py-3">
                              <span className="block truncate text-foreground">{b.name || b.contact}</span>
                              {b.name && <span className="block truncate text-xs text-muted-foreground">{b.contact}</span>}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-foreground">{bookingDate(b)}</td>
                            <td className="px-4 py-3 text-center text-foreground">{b.number_of_people || "—"}</td>
                            <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="space-y-2 md:hidden">
                    {filteredBookings.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(b.id)}
                          className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="flex items-start justify-between gap-2">
                            <span className="font-medium text-foreground">{b.activity}</span>
                            <StatusBadge status={b.status} />
                          </span>
                          <span className="mt-1 block truncate text-sm text-muted-foreground">{b.name || b.contact}</span>
                          <span className="mt-1 block text-sm text-foreground">
                            {bookingDate(b)}
                            {b.number_of_people ? ` · ${b.number_of_people} pers.` : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {tab === "contacts" && (
            <>
              {toolbar(contacts.length, filteredContacts.length, "Nombre, email o interés")}
              {filteredContacts.length === 0 ? (
                emptyState(
                  contacts.length === 0 ? "Todavía no hay mensajes" : "Ningún contacto coincide",
                  contacts.length === 0 ? undefined : "Prueba con otra búsqueda o estado.",
                )
              ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  {filteredContacts.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">{c.nombre}</span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {c.interes} · {formatDate(c.created_at)}
                          </span>
                        </span>
                        <StatusBadge status={c.status} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "notifications" &&
            (notifications.length === 0 ? (
              emptyState("Todavía no se ha enviado ninguna notificación")
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {notifications.map((n) => (
                  <li key={n.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{n.subject ?? n.kind}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatDate(n.created_at)} · {n.recipient ?? "sin destinatario"}
                        {n.attempts > 1 ? ` · ${n.attempts} intentos` : ""}
                      </p>
                      {n.error && <p className="mt-1 text-sm text-destructive">{n.error}</p>}
                    </div>
                    <Badge variant={n.status === "enviado" ? "secondary" : "destructive"}>
                      {n.status === "enviado" ? "Enviado" : "Con fallo"}
                    </Badge>
                    {n.status !== "enviado" && (
                      <Button
                        variant="outline"
                        className="min-h-11 gap-2"
                        disabled={retrying === n.id}
                        onClick={() => retryNotification(n.id)}
                      >
                        {retrying === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        Reintentar
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </main>

      <Sheet open={!!(selectedBooking || selectedContact) && (tab === "bookings" || tab === "contacts")} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto bg-card sm:max-w-lg">
          {tab === "bookings" && selectedBooking && (() => {
            const b = selectedBooking;
            const ev = b.event_id ? eventsById[b.event_id] : undefined;
            return (
              <>
                <SheetHeader className="pr-8 text-left">
                  <SheetTitle className="font-heading text-xl text-foreground">{b.activity}</SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span>Recibida el {formatDate(b.created_at)}</span>
                  </SheetDescription>
                </SheetHeader>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  <Field label="Cliente" value={b.name} />
                  <Field label="Contacto" value={b.contact} />
                  <Field label="Fecha" value={bookingDate(b)} />
                  <Field label="Participantes" value={b.number_of_people} />
                  <Field label="Nivel" value={b.experience_level} />
                  <Field label="Pagado" value={b.paid_amount_cents ? formatAmount(b.paid_amount_cents) : null} />
                </dl>
                {b.event_id && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                      {ev ? `${ev.title} · ${formatDateTime(ev.starts_at)}` : "Salida programada"}
                    </span>
                    <Button size="sm" variant="outline" className="min-h-11" onClick={() => { setSelectedId(null); setTab("events"); }}>
                      Ver salida
                    </Button>
                  </div>
                )}
                {!b.event_id &&
                  payments.some((p) => p.booking_id === b.id && p.kind === "senal" && p.status === "pendiente") && (
                    <p role="note" className="mt-4 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                      Señal antigua sin salida concreta: no se puede pagar online. Revisa la disponibilidad y, si procede, envía un enlace de pago manual abajo.
                    </p>
                  )}
                {b.message && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Comentarios</p>
                    <p className="mt-1 whitespace-pre-line rounded-lg bg-background/60 p-3 text-sm text-foreground">{b.message}</p>
                  </div>
                )}
                <div className="mt-6"><StatusSelect table="bookings" id={b.id} value={b.status} /></div>
                <NotesField key={b.id} id={b.id} value={b.admin_notes} onSave={(n) => updateNotes("bookings", b.id, n)} />
                <PaymentPanel
                  key={`pay-${b.id}`}
                  target="booking"
                  id={b.id}
                  defaultConcept={`Reserva ${b.activity}`}
                  payments={payments.filter((p) => p.booking_id === b.id)}
                  onCreated={loadData}
                />
              </>
            );
          })()}
          {tab === "contacts" && selectedContact && (() => {
            const c = selectedContact;
            return (
              <>
                <SheetHeader className="pr-8 text-left">
                  <SheetTitle className="font-heading text-xl text-foreground">{c.nombre}</SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span>Recibido el {formatDate(c.created_at)}</span>
                  </SheetDescription>
                </SheetHeader>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  <Field label="Contacto" value={c.contacto} />
                  <Field label="Interés" value={c.interes} />
                  <Field label="Personas" value={c.personas} />
                  <Field label="Pagado" value={c.paid_amount_cents ? formatAmount(c.paid_amount_cents) : null} />
                </dl>
                {c.mensaje && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Mensaje</p>
                    <p className="mt-1 whitespace-pre-line rounded-lg bg-background/60 p-3 text-sm text-foreground">{c.mensaje}</p>
                  </div>
                )}
                <div className="mt-6"><StatusSelect table="contact_submissions" id={c.id} value={c.status} /></div>
                <NotesField key={c.id} id={c.id} value={c.admin_notes} onSave={(n) => updateNotes("contact_submissions", c.id, n)} />
                <PaymentPanel
                  key={`pay-${c.id}`}
                  target="contact"
                  id={c.id}
                  defaultConcept={`Reserva ${c.interes}`}
                  payments={payments.filter((p) => p.contact_id === c.id)}
                  onCreated={loadData}
                />
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>

  );
}
