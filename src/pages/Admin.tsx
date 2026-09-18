import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

type NotesFieldProps = {
  value: string | null;
  onSave: (notes: string) => Promise<void>;
};

function NotesField({ value, onSave }: NotesFieldProps) {
  const [notes, setNotes] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = notes !== (value ?? "");

  return (
    <div className="mt-4 border-t border-border pt-3">
      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        Notas internas
      </label>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Seguimiento, llamadas, acuerdos..."
        className="mt-2 min-h-[70px] text-sm text-foreground"
      />
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
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
      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <CreditCard className="h-3.5 w-3.5" /> Cobro
      </label>

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
                <Badge variant={p.status === "pagado" ? "default" : "outline"}>{p.status}</Badge>
                {p.status !== "pagado" && (
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
          placeholder="Importe €"
          className="w-28 text-foreground"
        />
        <Input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Concepto"
          className="min-w-[180px] flex-1 text-foreground"
        />
        <Button size="sm" variant="outline" className="gap-2" disabled={creating} onClick={() => create(false)}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Generar enlace
        </Button>
        <Button size="sm" className="gap-2" disabled={creating} onClick={() => create(true)}>
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

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

type PlanOrder = {
  id: string;
  product_name: string;
  price_id: string;
  mode: string;
  status: string;
  amount_cents: number | null;
  currency: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  environment: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  last_invoice_status: string | null;
  last_invoice_at: string | null;
  created_at: string;
};

export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<unknown>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [planOrders, setPlanOrders] = useState<PlanOrder[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [tab, setTab] = useState<"bookings" | "contacts" | "plans" | "notifications">("bookings");

  const loadData = useCallback(async () => {
    const [b, c, p, n, o] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_requests").select("*").order("created_at", { ascending: false }),
      supabase
        .from("notification_log")
        .select("id, kind, recipient, subject, status, error, attempts, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("plan_orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (b.data) setBookings(b.data as Booking[]);
    if (c.data) setContacts(c.data as Contact[]);
    if (p.data) setPayments(p.data as PaymentRequest[]);
    if (n.data) setNotifications(n.data as NotificationRow[]);
    if (o.data) setPlanOrders(o.data as unknown as PlanOrder[]);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
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

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <Helmet>
        <title>Panel de gestión | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-heading font-bold">Solicitudes</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Actualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="gap-2">
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "bookings" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("bookings")}
          >
            Reservas ({bookings.length})
          </Button>
          <Button
            variant={tab === "contacts" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("contacts")}
          >
            Contactos ({contacts.length})
          </Button>
          <Button
            variant={tab === "plans" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("plans")}
          >
            Altas y planes ({planOrders.length})
          </Button>
          <Button
            variant={tab === "notifications" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("notifications")}
          >
            Notificaciones ({notifications.filter((n) => n.status !== "enviado").length})
          </Button>
        </div>

        <div className="space-y-4">
          {tab === "bookings" &&
            (bookings.length === 0 ? (
              <p className="text-muted-foreground">Todavía no hay reservas.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-heading font-semibold text-lg">{b.activity}</h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(b.created_at)} · {b.contact}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                      <Select value={b.status} onValueChange={(v) => updateStatus("bookings", b.id, v)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>Fecha: {b.preferred_date ?? "-"}</span>
                    <span>Personas: {b.number_of_people ?? "-"}</span>
                    <span>Nivel: {b.experience_level ?? "-"}</span>
                  </div>
                  {b.message && <p className="mt-3 text-sm text-foreground">{b.message}</p>}
                  <NotesField
                    value={b.admin_notes}
                    onSave={(n) => updateNotes("bookings", b.id, n)}
                  />
                  <PaymentPanel
                    target="booking"
                    id={b.id}
                    defaultConcept={`Reserva ${b.activity}`}
                    payments={payments.filter((p) => p.booking_id === b.id)}
                    onCreated={loadData}
                  />
                </div>

              ))
            ))}

          {tab === "contacts" &&
            (contacts.length === 0 ? (
              <p className="text-muted-foreground">Todavía no hay mensajes de contacto.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-heading font-semibold text-lg">{c.nombre}</h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(c.created_at)} · {c.contacto}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                      <Select
                        value={c.status}
                        onValueChange={(v) => updateStatus("contact_submissions", c.id, v)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <span>Interés: {c.interes}</span>
                    <span>Personas: {c.personas ?? "-"}</span>
                  </div>
                  {c.mensaje && <p className="mt-3 text-sm text-foreground">{c.mensaje}</p>}
                  <NotesField
                    value={c.admin_notes}
                    onSave={(n) => updateNotes("contact_submissions", c.id, n)}
                  />
                  <PaymentPanel
                    target="contact"
                    id={c.id}
                    defaultConcept={`Reserva ${c.interes}`}
                    payments={payments.filter((p) => p.contact_id === c.id)}
                    onCreated={loadData}
                  />
                </div>

              ))
            ))}

          {tab === "plans" &&
            (planOrders.length === 0 ? (
              <p className="text-muted-foreground">Todavía no hay altas de planes ni packs.</p>
            ) : (
              planOrders.map((o) => (
                <div key={o.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading font-semibold text-lg">{o.product_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(o.created_at)} ·{" "}
                        {o.mode === "suscripcion" ? "Suscripción" : "Pago único"} ·{" "}
                        {o.environment === "live" ? "real" : "pruebas"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                      {o.cancel_at_period_end && <Badge variant="outline">cancela al vencer</Badge>}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <span>Cliente: {o.customer_name ?? "-"}</span>
                    <span>Email: {o.customer_email ?? "-"}</span>
                    <span>Teléfono: {o.customer_phone ?? "-"}</span>
                    <span>
                      Importe: {o.amount_cents !== null ? formatAmount(o.amount_cents, o.currency) : "-"}
                    </span>
                    {o.mode === "suscripcion" && (
                      <>
                        <span>
                          Renueva:{" "}
                          {o.current_period_end ? formatDate(o.current_period_end) : "por confirmar"}
                        </span>
                        <span>
                          Último cobro: {o.last_invoice_status ?? "-"}
                          {o.last_invoice_at ? ` · ${formatDate(o.last_invoice_at)}` : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ))}

          {tab === "notifications" &&
            (notifications.length === 0 ? (
              <p className="text-muted-foreground">Todavía no se ha enviado ninguna notificación.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading font-semibold">{n.subject ?? n.kind}</h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(n.created_at)} · {n.recipient ?? "sin destinatario"} · intentos:{" "}
                        {n.attempts}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={n.status === "enviado" ? "default" : "destructive"}>
                        {n.status}
                      </Badge>
                      {n.status !== "enviado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          disabled={retrying === n.id}
                          onClick={() => retryNotification(n.id)}
                        >
                          {retrying === n.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          Reintentar
                        </Button>
                      )}
                    </div>
                  </div>
                  {n.error && <p className="mt-3 text-sm text-destructive">{n.error}</p>}
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
}
