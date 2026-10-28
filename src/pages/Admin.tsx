import React, { useEffect, useState, useCallback } from "react";
import { depositConfirmationOption, paymentLinkBody, type DepositConfirmationOption } from "@/lib/depositConfirmation";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventsPanel } from "@/components/admin/EventsPanel";
import { BookingEditForm } from "@/components/admin/BookingEditForm";
import { ContactCrmPanel, type CrmContact } from "@/components/admin/ContactCrmPanel";
import { ContactFollowUp } from "@/components/admin/ContactTimeline";
import { NewContactDialog } from "@/components/admin/NewContactDialog";
import { followUpBucket } from "@/lib/crmFollowUp";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import {
  ACTIVITY_TZ,
  buildSlots,
  clampDiscountPercent,
  computeFinance,
  findCoincidences,
  slotForBooking,
  suggestedDepositCents,
  type Coincidence,
} from "@/lib/adminBooking";
import { DEPOSIT_RATE } from "@/lib/deposit";
import { BusinessSettingsPanel } from "@/components/admin/BusinessSettingsPanel";
import { PlanOrdersPanel } from "@/components/admin/PlanOrdersPanel";
import { AccessLayout } from "@/components/auth/AccessLayout";
import { DeleteRecordButton, ResetAllButton } from "@/components/admin/DeleteControls";

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

function DiscountField({
  id,
  value,
  totalCents,
  onSave,
}: {
  id: string;
  value: number | null | undefined;
  totalCents: number | null;
  onSave: (percent: string) => Promise<void>;
}) {
  const current = value ? String(value) : "";
  const [text, setText] = useState(current);
  const [saving, setSaving] = useState(false);
  const dirty = text.trim() !== current;
  const percent = clampDiscountPercent(text.trim());
  const previewCents = percent > 0 && totalCents !== null ? Math.round((totalCents * percent) / 100) : 0;

  return (
    <div className="mt-4 border-t border-border pt-3">
      <Label htmlFor={`discount-${id}`} className="text-sm text-muted-foreground">
        Descuento (%)
      </Label>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            id={`discount-${id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputMode="numeric"
            placeholder="0"
            className="h-11 w-24 pr-7 text-foreground"
          />
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            %
          </span>
        </div>
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            await onSave(text);
            setSaving(false);
          }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </Button>
      </div>
      {percent > 0 && (
        <p className="mt-1 text-sm text-foreground">
          {percent} %{previewCents > 0 && <> = − {formatAmount(previewCents)}</>}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">Se aplica sobre el total y recalcula la señal y el saldo. Pon 0 para quitarlo.</p>
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
  total_cents?: number | null;
  last_error?: string | null;
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
  email?: string | null;
  phone?: string | null;
  discount_cents?: number | null;
  discount_percent?: number | null;
  updated_at?: string;
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
  email?: string | null;
  phone?: string | null;
  next_action?: string | null;
  next_action_at?: string | null;
};

const STATUSES = ["nueva", "contactada", "pendiente_pago", "incidencia_plazas", "confirmada", "cancelada"] as const;

const formatAmount = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

type PaymentPanelProps = {
  target: "booking" | "contact";
  id: string;
  defaultConcept: string;
  /** Pre-filled amount in euros; the admin can edit it before generating the link. */
  defaultAmount?: string;
  amountHint?: string;
  payments: PaymentRequest[];
  /** Called after a link is created; `message` describes what was done for the confirmation dialog. */
  onCreated: (message?: { title: string; description: string }) => void;
  /** Explicit "confirm activity + deposit" option (manual bookings only). */
  depositConfirmation?: DepositConfirmationOption;
  /** Deposit (cents) from the economic summary; when confirming the activity the charge is exactly this amount. */
  lockedDepositCents?: number | null;
};

function PaymentPanel({ target, id, defaultConcept, defaultAmount, amountHint, payments, onCreated, depositConfirmation, lockedDepositCents }: PaymentPanelProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(defaultAmount ?? "");
  const [concept, setConcept] = useState(defaultConcept);
  const [creating, setCreating] = useState(false);
  const [confirmDeposit, setConfirmDeposit] = useState(Boolean(depositConfirmation?.available && depositConfirmation.preselected));
  const explicitDeposit = target === "booking" && Boolean(depositConfirmation?.available) && confirmDeposit;
  const locked = explicitDeposit && typeof lockedDepositCents === "number" && lockedDepositCents >= 50;
  const shownAmount = locked ? (lockedDepositCents! / 100).toFixed(2).replace(".", ",") : amount;
  const [done, setDone] = useState<string | null>(null);

  const create = async (withEmail: boolean) => {
    const value = locked ? lockedDepositCents! / 100 : Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value < 0.5) {
      toast({ title: "Importe no válido", description: "Introduce un importe mínimo de 0,50 €", variant: "destructive" });
      return;
    }
    setCreating(true);
    let environment: "sandbox" | "live";
    try { environment = getStripeEnvironment(); } catch (e) {
      setCreating(false);
      toast({ title: "Pagos no configurados", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.functions.invoke("create-payment-link", {
      body: paymentLinkBody({
        target,
        id,
        amountCents: Math.round(value * 100),
        concept: concept.trim() || defaultConcept,
        environment,
        sendEmail: withEmail,
        baseUrl: window.location.origin,
        confirmDeposit: explicitDeposit,
      }),
    });
    setCreating(false);
    if (error || !data?.url) {
      let description = error?.message;
      try { const ctx = await (error as { context?: Response })?.context?.json?.(); if (ctx?.error) description = ctx.error; } catch { /* keep generic */ }
      toast({ title: "No se pudo generar el cobro", description, variant: "destructive" });
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
      setAmount("");
      onCreated();
      return;
    }
    const euros = formatAmount(Math.round(value * 100));
    const title = withEmail ? (explicitDeposit ? "Reserva confirmada" : "Enlace enviado por email") : "Enlace de pago creado";
    const description = withEmail
      ? explicitDeposit
        ? `El cliente ha recibido el correo de confirmación con el enlace para pagar la señal de ${euros}. La reserva ha pasado a «Pendiente de pago».`
        : `El cliente ha recibido por email el enlace para pagar ${euros}.`
      : `Enlace de ${euros} copiado al portapapeles.`;
    setDone(`Hecho: ${description}`);
    setAmount("");
    onCreated({ title, description });
  };

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CreditCard className="h-3.5 w-3.5" /> Cobros
      </p>
      {done && (
        <p role="status" className="mt-2 flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {done}
        </p>
      )}

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
              {p.status === "pagado" && p.last_error?.startsWith("plazas:") && (
                <p role="alert" className="w-full rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-foreground">
                  <strong>Pago recibido sin plaza confirmada.</strong> Revisa la disponibilidad y resuelve la incidencia antes de confirmar la actividad al cliente.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {locked ? (
        <p className="mt-2 text-xs text-muted-foreground">Se cobra la señal del resumen económico. Desmarca «Confirmar actividad» para otro importe.</p>
      ) : (
        amountHint && <p className="mt-2 text-xs text-muted-foreground">{amountHint}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input
          value={shownAmount}
          onChange={(e) => setAmount(e.target.value)}
          readOnly={locked}
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
        <Button variant="outline" className="min-h-11 gap-2" disabled={creating || explicitDeposit} onClick={() => create(false)}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Generar enlace
        </Button>
        <Button className="min-h-11 gap-2" disabled={creating} onClick={() => create(true)}>
          <Mail className="h-4 w-4" /> {explicitDeposit ? "Confirmar actividad y enviar señal" : "Enviar por email"}
        </Button>
      </div>
      {target === "booking" && depositConfirmation && (
        depositConfirmation.available ? (
          <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={confirmDeposit}
              onChange={(e) => setConfirmDeposit(e.target.checked)}
            />
            <span>
              <span className="font-medium">Confirmar actividad y enviar señal</span>
              <span className="block text-xs text-muted-foreground">El email dirá que la actividad y la fecha están confirmadas y que este importe es la señal. Desmárcalo para saldos u otros cobros.</span>
            </span>
          </label>
        ) : (
          depositConfirmation.reason && <p className="mt-2 text-xs text-muted-foreground">Confirmación de actividad no disponible: {depositConfirmation.reason}</p>
        )
      )}
    </div>
  );
}

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  guide_name: string | null;
  price_cents: number | null;
};

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
  incidencia_plazas: "Incidencia de plazas",
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
          : status === "incidencia_plazas"
            ? "border-destructive bg-destructive/15 text-foreground"
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
    timeZone: ACTIVITY_TZ,
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
  const [crmTick, setCrmTick] = useState(0);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<{ title: string; description: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [eventsById, setEventsById] = useState<
    Record<string, EventRow>
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
    if (b.data) {
      // Older paid bookings may still say confirmed despite an unresolved seat error.
      const incidentIds = new Set((p.data ?? []).filter(row => row.status === "pagado" && row.last_error?.startsWith("plazas:")).map(row => row.booking_id));
      setBookings((b.data as Booking[]).map(row => row.status === "confirmada" && incidentIds.has(row.id)
        ? { ...row, status: "incidencia_plazas" } : row));
    }
    if (c.data) setContacts(c.data as Contact[]);
    if (p.data) setPayments(p.data as PaymentRequest[]);
    if (n.data) setNotifications(n.data as NotificationRow[]);
    const ids = [...new Set((b.data ?? []).map((r) => r.event_id).filter(Boolean))] as string[];
    const cols = "id, title, starts_at, ends_at, status, guide_name, price_cents";
    const since = new Date(Date.now() - 2 * 86400000).toISOString();
    const [linked, upcoming] = await Promise.all([
      ids.length ? supabase.from("activity_events").select(cols).in("id", ids) : Promise.resolve({ data: [] as EventRow[] }),
      supabase.from("activity_events").select(cols).gte("starts_at", since),
    ]);
    setEventsById(
      Object.fromEntries([...(linked.data ?? []), ...(upcoming.data ?? [])].map((e) => [e.id, e as EventRow])),
    );
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
      try {
        const { data: verified, error: verifyError } = await supabase.auth.getUser();
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        if (verifyError || !verified.user || data.session?.user.id !== verified.user.id) {
          setSession(null); setIsAdmin(false); return;
        }
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", verified.user.id)
          .eq("role", "admin");
        if (!active) return;
        const admin = !roleError && !!roles && roles.length > 0;
        setSession(data.session);
        setIsAdmin(admin);
        if (admin) await loadData();
      } catch {
        if (active) { setSession(null); setIsAdmin(false); }
      } finally { if (active) setLoading(false); }
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

  const updateDiscount = async (id: string, raw: string) => {
    const trimmed = raw.trim();
    const num = Number(trimmed.replace(",", "."));
    if (trimmed !== "" && (!Number.isFinite(num) || num < 0 || num > 100)) {
      toast({ title: "Descuento no válido", description: "Introduce un porcentaje de 0 a 100 (0 para quitarlo).", variant: "destructive" });
      return;
    }
    const discount_percent = clampDiscountPercent(trimmed);
    const { error } = await supabase.from("bookings").update({ discount_percent, discount_cents: 0 }).eq("id", id);
    if (error) {
      toast({ title: "No se pudo guardar el descuento", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((prev) => prev.map((r) => (r.id === id ? { ...r, discount_percent, discount_cents: 0 } : r)));
    toast({ title: discount_percent > 0 ? `Descuento del ${discount_percent} % aplicado` : "Descuento eliminado" });
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
      <AccessLayout title="Acceso a gestión" description="">
          <Button asChild className="w-full">
            <Link to="/login?next=/admin">LOGIN</Link>
          </Button>
      </AccessLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AccessLayout title="Acceso no autorizado" description="Tu cuenta de Google no tiene acceso al panel de gestión.">
          <Button variant="outline" onClick={async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            } catch { toast({ title: "No se pudo cerrar sesión", description: "Inténtalo de nuevo.", variant: "destructive" }); }
          }} className="w-full gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
      </AccessLayout>
    );
  }

  const pendingNotifications = notifications.filter((n) => n.status !== "enviado").length;
  const newBookings = bookings.filter((b) => b.status === "nueva").length;
  const pendingPayBookings = bookings.filter((b) => b.status === "pendiente_pago").length;
  const seatIncidents = bookings.filter((b) => b.status === "incidencia_plazas").length;
  const attentionBookings = bookings.filter(b => ["nueva", "pendiente_pago", "incidencia_plazas"].includes(b.status))
    .sort((a, b) => Number(b.status === "incidencia_plazas") - Number(a.status === "incidencia_plazas"));
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

  const slots = buildSlots(Object.values(eventsById), bookings);
  const coincidencesFor = (b: Booking): Coincidence[] =>
    b.status === "cancelada" ? [] : findCoincidences(slotForBooking(b, slots), slots);
  const coincidenceCount = Object.fromEntries(bookings.map((b) => [b.id, coincidencesFor(b).length]));
  const cdot = (b: Booking) =>
    coincidenceCount[b.id] ? (
      <AlertTriangle className="ml-1.5 inline h-3.5 w-3.5 text-primary" aria-label="Posible coincidencia con otra actividad" />
    ) : null;

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

  const bookingDetail = selectedBooking && (() => {
    const b = selectedBooking;
    const ev = b.event_id ? eventsById[b.event_id] : undefined;
    const fin = computeFinance({
      bookingId: b.id,
      participantsRaw: b.number_of_people,
      activity: b.activity,
      eventPriceCents: ev?.price_cents ?? null,
      payments,
      discountCents: b.discount_cents ?? 0,
      discountPercent: b.discount_percent ?? 0,
    });
    const pct = Math.round(DEPOSIT_RATE * 100);
    const row = (label: string, value: React.ReactNode, strong = false) => (
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className={strong ? "font-heading font-bold text-foreground" : "text-foreground"}>{value}</dd>
      </div>
    );
    return (
      <section
        aria-label={`Detalle de la reserva de ${b.name || b.contact}`}
        className="self-start rounded-xl border border-border bg-card p-4 md:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">{b.activity}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <StatusBadge status={b.status} />
              <span>Recibida el {formatDate(b.created_at)}</span>
            </p>
          </div>
          <Button variant="ghost" className="min-h-11 gap-2 lg:hidden" onClick={() => setSelectedId(null)}>
            <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" /> Volver a la lista
          </Button>
        </div>

        <section aria-label="Datos principales" className="mt-5 rounded-xl border border-border bg-background/60 p-4">
          <dl className="grid grid-cols-2 gap-4">
            <Field label={ev ? "Fecha y hora" : "Fecha"} value={bookingDate(b)} />
            <Field label="Participantes" value={b.number_of_people} />
            <Field label="Cliente" value={b.name} />
            <Field label="Email" value={b.email || b.contact} />
            <Field label="Teléfono" value={b.phone ? <a className="text-primary underline-offset-2 hover:underline" href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a> : null} />
            <Field label="Nivel" value={b.experience_level} />
          </dl>
          {b.event_id && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                {ev ? `Salida programada${ev.guide_name ? ` · Guía: ${ev.guide_name}` : ""}` : "Salida programada"}
              </span>
              <Button size="sm" variant="outline" className="min-h-11" onClick={() => { setSelectedId(null); setTab("events"); }}>
                Ver en calendario
              </Button>
            </div>
          )}
        </section>

        <section aria-labelledby="fin-title" className="mt-4 rounded-xl border border-border bg-background/60 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 id="fin-title" className="font-heading font-semibold text-foreground">Resumen económico</h3>
            {fin.estimated && (
              <span className="rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">Estimado con tarifa actual · pendiente de confirmar</span>
            )}
            {fin.source === "senal" && <span className="text-xs text-muted-foreground">Importes pactados en la reserva</span>}
            {fin.source === "salida" && <span className="text-xs text-muted-foreground">Precio de la salida</span>}
          </div>
          {fin.totalCents === null ? (
            <p className="text-sm text-foreground">
              Precio a confirmar{!fin.participants ? " (faltan participantes)" : ""}.
              {fin.paidCents > 0 && <> Pagado: <strong>{formatAmount(fin.paidCents)}</strong>.</>}
            </p>
          ) : (
            <dl className="space-y-1.5 text-sm">
              {fin.unitCents !== null && fin.participants
                ? row("Tarifa", `${formatAmount(fin.unitCents)} × ${fin.participants} pers.`)
                : null}
              {row("Total actividad", formatAmount(fin.totalCents), fin.discountCents === 0)}
              {fin.discountCents > 0 &&
                row(
                  `Descuento${fin.discountPercent > 0 ? ` (${fin.discountPercent} %)` : ""}`,
                  `− ${formatAmount(fin.discountCents)}`,
                )}
              {fin.discountCents > 0 && row("Total con descuento", formatAmount(fin.netTotalCents ?? 0), true)}
              {row(`Señal (${pct} %, incluida en el total)`, fin.depositCents !== null ? formatAmount(fin.depositCents) : "—")}
              {row("Pagado", formatAmount(fin.paidCents))}
              <div className="border-t border-border pt-1.5">{row("Saldo pendiente", formatAmount(fin.balanceCents ?? 0), true)}</div>
            </dl>
          )}
          <DiscountField
            key={`disc-${b.id}`}
            id={b.id}
            value={b.discount_percent}
            totalCents={fin.totalCents}
            onSave={(p) => updateDiscount(b.id, p)}
          />
          {(() => {
            const own = payments.filter((p) => p.booking_id === b.id);
            const sug = suggestedDepositCents(fin);
            const base = depositConfirmationOption(b, own, sug !== null);
            const noDeposit = fin.depositCents === null || fin.depositCents < 50;
            const depositConfirmation =
              base.available && noDeposit && !fin.depositPaid
                ? {
                    available: false,
                    preselected: false,
                    reason:
                      fin.totalCents === null
                        ? "falta el precio o los participantes en el resumen económico."
                        : "con el descuento actual la señal es inferior a 0,50 €; revisa el descuento.",
                  }
                : base;
            return (
              <PaymentPanel
                key={`pay-${b.id}-d${b.discount_percent ?? 0}-p${b.number_of_people ?? ""}-${b.activity}`}
                target="booking"
                id={b.id}
                {...(sug === null
                  ? {
                      defaultConcept: `Reserva ${b.activity}`,
                      amountHint: fin.depositPaid ? "La señal ya está pagada: no se propone otra." : fin.depositPending ? "Ya hay una señal pendiente de pago." : undefined,
                    }
                  : {
                      defaultConcept: `Señal ${pct}% · ${b.activity} · ${fin.participants} pax`,
                      defaultAmount: (sug / 100).toFixed(2).replace(".", ","),
                      amountHint: `Importe propuesto: señal del ${pct} % del resumen.`,
                    })}
                payments={own}
                depositConfirmation={depositConfirmation}
                lockedDepositCents={sug}
                onCreated={(msg) => { if (msg) setActionDone(msg); loadData(); }}
              />
            );
          })()}
        </section>

        {(() => {
          const list = coincidencesFor(b);
          if (!list.length) return null;
          return (
            <section role="note" aria-labelledby="coin-title" className="mt-4 rounded-xl border border-primary/50 bg-primary/10 p-4 text-sm">
              <h3 id="coin-title" className="flex items-center gap-2 font-heading font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" /> Posible coincidencia
              </h3>
              <ul className="mt-2 space-y-2">
                {list.map((c) => {
                  const msg = c.sameGuide
                    ? "Mismo guía en horario solapado: incompatibilidad a resolver."
                    : c.level === "solape"
                      ? c.otherGuide
                        ? "Horarios solapados con otro guía asignado: revisa recursos."
                        : "Horarios solapados: revisa guía y material."
                      : "Otra actividad el mismo día: revisa horarios.";
                  return (
                    <li key={c.slot.key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background/60 px-3 py-2">
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">{c.slot.label}</span>
                        <span className="block text-muted-foreground">
                          {c.slot.startIso ? formatDateTime(c.slot.startIso) : formatPreferred(c.slot.day)} · {msg}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-11"
                        onClick={() => {
                          if (c.slot.kind === "booking") setSelectedId(c.slot.refId);
                          else { setSelectedId(null); setTab("events"); }
                        }}
                      >
                        {c.slot.kind === "booking" ? "Ver reserva" : "Ver en calendario"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })()}
        {!b.event_id &&
          payments.some((p) => p.booking_id === b.id && p.kind === "senal" && p.status === "pendiente") && (
            <p role="note" className="mt-4 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              Señal antigua sin salida concreta: no se puede pagar online. Revisa la disponibilidad y, si procede, envía un enlace de pago manual abajo.
            </p>
          )}
        {b.message && (
          <div className="mt-5">
            <p className="text-sm text-muted-foreground">Comentarios del cliente</p>
            <p className="mt-1 whitespace-pre-line rounded-lg bg-background/60 p-3 text-sm text-foreground">{b.message}</p>
          </div>
        )}
        <BookingEditForm key={`edit-${b.id}-${b.updated_at ?? ""}`} booking={b} onSaved={(patch) => setBookings((prev) => prev.map((r) => (r.id === b.id ? { ...r, ...patch } : r)))} />
        <div className="mt-6"><StatusSelect table="bookings" id={b.id} value={b.status} /></div>
        <NotesField key={b.id} id={b.id} value={b.admin_notes} onSave={(n) => updateNotes("bookings", b.id, n)} />
        <DeleteRecordButton target="booking" id={b.id} onDeleted={() => { setSelectedId(null); loadData(); }} />
      </section>
    );
  })();

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Helmet>
        <title>Panel de gestión | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-5 py-6 font-heading font-bold text-foreground">
          <Mountain className="h-5 w-5 text-primary" aria-hidden="true" /> Gestión NSL
        </div>
        <div className="flex-1 overflow-y-auto px-3">{navList}</div>
        <div className="border-t border-border p-3">
          <ResetAllButton onDone={() => { setSelectedId(null); loadData(); }} />
          <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="min-h-11 w-full justify-start gap-2">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Salir
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-2 lg:hidden">
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
            <div className="mt-6"><ResetAllButton onDone={() => { setSelectedId(null); loadData(); }} /></div>
            <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="min-h-11 w-full justify-start gap-2">
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
          <Button variant="outline" onClick={refresh} disabled={refreshing} className="hidden min-h-11 gap-2 lg:inline-flex">
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

        <div className="max-w-7xl space-y-4">
          {tab === "overview" && (
            <>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Reservas nuevas", value: newBookings, go: "bookings" as AdminTab, filter: "nueva" },
                  { label: "Pendientes de pago", value: pendingPayBookings, go: "bookings" as AdminTab, filter: "pendiente_pago" },
                  { label: "Incidencias de plazas", value: seatIncidents, go: "bookings" as AdminTab, filter: "incidencia_plazas" },
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
                {attentionBookings.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nada pendiente. Todo al día.</p>
                ) : (
                  <ul>
                    {attentionBookings
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
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className={selectedBooking ? "hidden lg:block" : ""}>
              {filteredBookings.length === 0 ? (
                emptyState(
                  bookings.length === 0 ? "Todavía no hay reservas" : "Ninguna reserva coincide",
                  bookings.length === 0 ? "Aparecerán aquí cuando alguien reserve o solicite fecha." : "Prueba con otra búsqueda o estado.",
                )
              ) : (
                <ul className="space-y-2">
                  {filteredBookings.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(b.id)}
                        aria-current={selectedId === b.id ? "true" : undefined}
                        className={`w-full rounded-xl border bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          selectedId === b.id ? "border-primary" : "border-border hover:border-primary"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-medium text-foreground">{b.activity}{cdot(b)}</span>
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
              )}
              </div>
              {bookingDetail ?? (
                <div className="hidden self-start rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center lg:block">
                  <CalendarCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">Selecciona una reserva para ver todos sus detalles aquí.</p>
                </div>
              )}
              </div>
            </>
          )}

          {tab === "contacts" && (
            <>
              {(() => {
                const overdue = contacts.filter((c) => followUpBucket(c.next_action_at) === "vencido").length;
                const today = contacts.filter((c) => followUpBucket(c.next_action_at) === "hoy").length;
                return (
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="rounded-lg border border-border bg-card px-4 py-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">Seguimientos vencidos</p><p className={`font-heading text-xl ${overdue ? "text-destructive" : "text-foreground"}`}>{overdue}</p></div>
                    <div className="rounded-lg border border-border bg-card px-4 py-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">Para hoy</p><p className={`font-heading text-xl ${today ? "text-primary" : "text-foreground"}`}>{today}</p></div>
                    <div className="ml-auto"><NewContactDialog existing={contacts} onCreated={async (id) => { await loadData(); setSelectedId(id); }} onOpenExisting={(id) => setSelectedId(id)} /></div>
                  </div>
                );
              })()}
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
                        {followUpBucket(c.next_action_at) === "vencido" && <Badge variant="destructive">Vencido</Badge>}
                        {followUpBucket(c.next_action_at) === "hoy" && <Badge>Hoy</Badge>}
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

      <Sheet open={!!selectedContact && tab === "contacts"} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto border-0 bg-card p-6 sm:max-w-none">
          {tab === "contacts" && selectedContact && (() => {
            const c = selectedContact;
            return (
              <div className="mx-auto w-full max-w-5xl">
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
                <ContactFollowUp key={`fu-${c.id}-${c.next_action_at ?? ""}`} contactId={c.id} nextAction={c.next_action ?? null} nextActionAt={c.next_action_at ?? null} refreshKey={crmTick} onSaved={() => { setCrmTick((t) => t + 1); loadData(); }} />
                <ContactCrmPanel key={`crm-${c.id}`} contact={c as unknown as CrmContact} onSaved={() => { setCrmTick((t) => t + 1); loadData(); }} />
                <div className="mt-6"><StatusSelect table="contact_submissions" id={c.id} value={c.status} /></div>
                <NotesField key={c.id} id={c.id} value={c.admin_notes} onSave={(n) => updateNotes("contact_submissions", c.id, n)} />
                <PaymentPanel
                  key={`pay-${c.id}`}
                  target="contact"
                  id={c.id}
                  defaultConcept={`Reserva ${c.interes}`}
                  payments={payments.filter((p) => p.contact_id === c.id)}
                  onCreated={(msg) => { if (msg) setActionDone(msg); loadData(); }}
                />
                <DeleteRecordButton target="contact" id={c.id} onDeleted={() => { setSelectedId(null); loadData(); }} />
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
      <Dialog open={actionDone !== null} onOpenChange={(o) => { if (!o) setActionDone(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
            </span>
            <DialogTitle className="text-center font-heading text-foreground">{actionDone?.title}</DialogTitle>
            <DialogDescription className="text-center">{actionDone?.description}</DialogDescription>
          </DialogHeader>
          <Button className="min-h-11 w-full" onClick={() => setActionDone(null)}>Entendido</Button>
        </DialogContent>
      </Dialog>
    </div>

  );
}
