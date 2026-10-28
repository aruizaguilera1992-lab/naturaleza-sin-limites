import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Loader2, Save, CheckCircle2 } from "lucide-react";
import { followUpBucket } from "@/lib/crmFollowUp";

type Event = { id: string; kind: string; body: string | null; origin: string; occurred_at: string };

const KIND: Record<string, string> = {
  formulario: "Contacto recibido",
  comunicacion_whatsapp: "WhatsApp",
  comunicacion_llamada: "Llamada",
  comunicacion_email: "Email",
  comunicacion_otro: "Comunicación",
  seguimiento: "Seguimiento",
};
const ORIGIN: Record<string, string> = { web: "web", preapertura: "preapertura", manual: "a mano", sistema: "sistema" };

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

export function ContactFollowUp({ contactId, nextAction, nextActionAt, onSaved, refreshKey }: {
  contactId: string; nextAction: string | null; nextActionAt: string | null; onSaved: () => void; refreshKey: number;
}) {
  const { toast } = useToast();
  const [action, setAction] = useState(nextAction ?? "");
  const [at, setAt] = useState(toLocalInput(nextActionAt));
  const [busy, setBusy] = useState(false);
  const bucket = followUpBucket(nextActionAt);

  const persist = async (a: string | null, when: string | null, logBody?: string) => {
    setBusy(true);
    const { error } = await supabase.from("contact_submissions").update({ next_action: a, next_action_at: when }).eq("id", contactId);
    if (!error && logBody) {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("contact_events").insert({ contact_id: contactId, kind: "seguimiento", body: logBody, origin: "manual", author_id: u.user?.id ?? null });
    }
    setBusy(false);
    if (error) return toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
    toast({ title: logBody?.startsWith("Hecho") ? "Seguimiento completado" : "Seguimiento guardado" });
    onSaved();
  };

  return (
    <section aria-labelledby="crm-follow" className="mt-6 rounded-lg border border-border bg-background/40 p-4">
      <h3 id="crm-follow" className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
        <CalendarClock className="h-4 w-4" />Próxima acción
        {bucket === "vencido" && <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs normal-case text-destructive">Vencida</span>}
        {bucket === "hoy" && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs normal-case text-primary">Hoy</span>}
      </h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_200px]">
        <div>
          <Label htmlFor="crm-next" className="text-xs text-muted-foreground">Qué hacer</Label>
          <Input id="crm-next" className="mt-1" value={action} maxLength={300} onChange={(e) => setAction(e.target.value)} placeholder="Ej.: enviar propuesta" />
        </div>
        <div>
          <Label htmlFor="crm-next-at" className="text-xs text-muted-foreground">Cuándo</Label>
          <Input id="crm-next-at" type="datetime-local" className="mt-1" value={at} onChange={(e) => setAt(e.target.value)} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy || !action.trim() || !at}
          onClick={() => persist(action.trim(), new Date(at).toISOString(), `Programado: ${action.trim()}`)}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Guardar
        </Button>
        {nextAction && (
          <Button size="sm" variant="outline" disabled={busy}
            onClick={() => { setAction(""); setAt(""); persist(null, null, `Hecho: ${nextAction}`); }}>
            <CheckCircle2 className="mr-1 h-4 w-4" />Marcar como hecha
          </Button>
        )}
      </div>
      <ContactTimeline contactId={contactId} refreshKey={refreshKey} />
    </section>
  );
}

export function ContactTimeline({ contactId, refreshKey }: { contactId: string; refreshKey: number }) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("contact_events")
      .select("id, kind, body, origin, occurred_at").eq("contact_id", contactId)
      .order("occurred_at", { ascending: false }).limit(100);
    if (error) setError(error.message); else { setError(null); setEvents(data as Event[]); }
  }, [contactId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  return (
    <div className="mt-5">
      <h4 className="text-xs uppercase tracking-wide text-muted-foreground">Historial</h4>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">No se pudo cargar el historial: {error}</p>}
      {!events && !error && <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" aria-label="Cargando historial" />}
      {events && events.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Sin actividad registrada.</p>}
      {events && events.length > 0 && (
        <ol className="mt-2 space-y-3 border-l border-border pl-4">
          {events.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
              <p className="text-sm font-medium text-foreground">
                {KIND[e.kind] ?? e.kind}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {new Date(e.occurred_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" })}
                  {ORIGIN[e.origin] ? ` · ${ORIGIN[e.origin]}` : ""}
                </span>
              </p>
              {e.body && <p className="whitespace-pre-line text-sm text-muted-foreground">{e.body}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
