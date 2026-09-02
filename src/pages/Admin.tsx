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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mountain, LogOut, RefreshCw, Save } from "lucide-react";

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
};

const STATUSES = ["nueva", "contactada", "confirmada", "cancelada"] as const;


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

export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<unknown>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tab, setTab] = useState<"bookings" | "contacts">("bookings");

  const loadData = useCallback(async () => {
    const [b, c] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
    ]);
    if (b.data) setBookings(b.data as Booking[]);
    if (c.data) setContacts(c.data as Contact[]);
  }, []);

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
    const { data: sub } = supabase.auth.onAuthStateChange(() => init());
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
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
}
