import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, Mail, MessageCircle, Phone, Save, CheckCircle2 } from "lucide-react";
import { contactChannels, mailtoLink, telLink, whatsappLink } from "@/lib/crmContact";
import { ContactSuggestions } from "@/components/admin/ContactSuggestions";

export type CrmContact = {
  id: string;
  nombre: string;
  contacto: string;
  interes: string;
  email?: string | null;
  phone?: string | null;
  client_type?: string | null;
  goal?: string | null;
  experience_level?: string | null;
  participants?: number | null;
  desired_dates?: string | null;
  contact_preference?: string | null;
  priority?: string | null;
  pipeline_stage?: string | null;
  recommended_service?: string | null;
  tags?: string[] | null;
  activities_interest?: string[] | null;
};

const OPT = {
  pipeline_stage: [["nuevo", "Nuevo"], ["contactado", "Contactado"], ["propuesta", "Propuesta enviada"], ["negociacion", "En negociación"], ["ganado", "Ganado"], ["perdido", "Perdido"]],
  priority: [["alta", "Alta"], ["media", "Media"], ["baja", "Baja"]],
  client_type: [["particular", "Particular"], ["grupo", "Grupo"], ["empresa", "Empresa"], ["centro_educativo", "Centro educativo"]],
  experience_level: [["ninguna", "Sin experiencia"], ["iniciacion", "Iniciación"], ["intermedio", "Intermedio"], ["avanzado", "Avanzado"]],
  contact_preference: [["whatsapp", "WhatsApp"], ["llamada", "Llamada"], ["email", "Email"]],
} as const;

const CHANNEL_LABEL: Record<string, string> = { whatsapp: "WhatsApp", llamada: "Llamada", email: "Email", otro: "Otro" };
const NONE = "__none";

export function ContactCrmPanel({ contact, onSaved }: { contact: CrmContact; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => toForm(contact));
  const [saving, setSaving] = useState(false);
  const firstName = contact.nombre.split(" ")[0] || "";
  const [message, setMessage] = useState(`Hola ${firstName}, soy Antonio de Naturaleza Sin Límites. Te escribo por tu interés en ${contact.interes || "nuestras actividades"}.`);
  const [pending, setPending] = useState<string | null>(null);
  const [logChannel, setLogChannel] = useState("whatsapp");
  const [logBody, setLogBody] = useState("");
  const [logging, setLogging] = useState(false);

  // No se resincroniza al cambiar el objeto `contact`: un refresco de la lista
  // (loadData) crea una identidad nueva y borraría los cambios sin guardar.
  // El panel se remonta al cambiar de contacto (key `crm-${c.id}` en Admin.tsx).



  const { email, phone } = contactChannels(contact);
  const wa = whatsappLink(phone, message);
  const tel = telLink(phone);
  const mail = mailtoLink(email, "Naturaleza Sin Límites", message);

  const set = (k: keyof ReturnType<typeof toForm>, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const participants = form.participants.trim() ? Number(form.participants) : null;
    if (participants !== null && (!Number.isInteger(participants) || participants < 1 || participants > 500)) {
      toast({ title: "Participantes no válido", description: "Escribe un número entero.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("contact_submissions").update({
      pipeline_stage: form.pipeline_stage || "nuevo",
      priority: form.priority || null,
      client_type: form.client_type || null,
      experience_level: form.experience_level || null,
      contact_preference: form.contact_preference || null,
      goal: form.goal.trim() || null,
      desired_dates: form.desired_dates.trim() || null,
      recommended_service: form.recommended_service.trim() || null,
      participants,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }).eq("id", contact.id);
    setSaving(false);
    if (error) return toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
    toast({ title: "Clasificación guardada" });
    onSaved();
  };

  const register = async (channel: string, body: string) => {
    setLogging(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("contact_events").insert({
      contact_id: contact.id,
      kind: `comunicacion_${channel}`,
      body: body.trim() || null,
      origin: "manual",
      author_id: u.user?.id ?? null,
    });
    setLogging(false);
    if (error) return toast({ title: "No se pudo registrar", description: error.message, variant: "destructive" });
    toast({ title: "Comunicación registrada", description: CHANNEL_LABEL[channel] });
    setPending(null);
    setLogBody("");
    onSaved();
  };

  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); toast({ title: `${label} copiado` }); }
    catch { toast({ title: "No se pudo copiar", variant: "destructive" }); }
  };

  const action = (href: string | null, channel: string, label: string, Icon: typeof Mail) => (
    <Button asChild={!!href} variant="outline" size="sm" disabled={!href} title={href ? undefined : "Dato no válido"}>
      {href ? (
        <a href={href} target={channel === "llamada" ? undefined : "_blank"} rel="noopener noreferrer" onClick={() => setPending(channel)}>
          <Icon className="mr-1 h-4 w-4" />{label}
        </a>
      ) : (<span><Icon className="mr-1 h-4 w-4" />{label}</span>)}
    </Button>
  );

  return (
    <div className="mt-6 space-y-6">
      <ContactSuggestions
        firstName={firstName}
        interests={contact.activities_interest}
        interes={contact.interes}
        experience={form.experience_level || contact.experience_level}
        onUseMessage={setMessage}
      />
      <section aria-labelledby="crm-actions" className="rounded-lg border border-border bg-background/40 p-4">
        <h3 id="crm-actions" className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Acciones rápidas</h3>
        <Label htmlFor="crm-msg" className="mt-3 block text-xs text-muted-foreground">Mensaje (puedes editarlo antes de abrir la app)</Label>
        <Textarea id="crm-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
        <div className="mt-3 flex flex-wrap gap-2">
          {action(wa, "whatsapp", "WhatsApp", MessageCircle)}
          {action(tel, "llamada", "Llamar", Phone)}
          {action(mail, "email", "Email", Mail)}
          <Button variant="ghost" size="sm" onClick={() => copy(message, "Mensaje")}><Copy className="mr-1 h-4 w-4" />Copiar mensaje</Button>
          {phone && <Button variant="ghost" size="sm" onClick={() => copy(phone, "Teléfono")}><Copy className="mr-1 h-4 w-4" />Teléfono</Button>}
          {email && <Button variant="ghost" size="sm" onClick={() => copy(email, "Email")}><Copy className="mr-1 h-4 w-4" />Email</Button>}
        </div>
        {!phone && !email && <p className="mt-2 text-xs text-muted-foreground">No hay teléfono ni email válidos para este contacto.</p>}
        {pending && (
          <div role="status" className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
            <span>¿Has enviado el mensaje por {CHANNEL_LABEL[pending]}?</span>
            <Button size="sm" disabled={logging} onClick={() => register(pending, pending === "llamada" ? "Llamada realizada" : message)}>
              <CheckCircle2 className="mr-1 h-4 w-4" />Sí, registrar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>No</Button>
          </div>
        )}
      </section>

      <section aria-labelledby="crm-log" className="rounded-lg border border-border bg-background/40 p-4">
        <h3 id="crm-log" className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Registrar comunicación</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr]">
          <Select value={logChannel} onValueChange={setLogChannel}>
            <SelectTrigger aria-label="Canal"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(CHANNEL_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Input aria-label="Resumen" placeholder="Qué habéis hablado" value={logBody} onChange={(e) => setLogBody(e.target.value)} maxLength={1000} />
        </div>
        <Button className="mt-2" size="sm" disabled={logging || !logBody.trim()} onClick={() => register(logChannel, logBody)}>
          {logging ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Registrar
        </Button>
      </section>

      <section aria-labelledby="crm-class" className="rounded-lg border border-border bg-background/40 p-4">
        <h3 id="crm-class" className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Clasificación</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sel("Etapa comercial", "pipeline_stage", false)}
          {sel("Prioridad", "priority")}
          {sel("Tipo de cliente", "client_type")}
          {sel("Experiencia", "experience_level")}
          {sel("Prefiere", "contact_preference")}
          {txt("Participantes", "participants", "number")}
          {txt("Fechas deseadas", "desired_dates")}
          {txt("Servicio recomendado", "recommended_service")}
          <div className="sm:col-span-2">{txt("Objetivo", "goal")}</div>
          <div className="sm:col-span-2">{txt("Etiquetas (separadas por comas)", "tags")}</div>
        </div>
        <Button className="mt-3" size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Guardar clasificación
        </Button>
      </section>
    </div>
  );

  function sel(label: string, key: keyof typeof OPT, allowEmpty = true) {
    const id = `crm-${key}`;
    return (
      <div>
        <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
        <Select value={form[key] || NONE} onValueChange={(v) => set(key, v === NONE ? "" : v)}>
          <SelectTrigger id={id} className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {allowEmpty && <SelectItem value={NONE}>Sin indicar</SelectItem>}
            {OPT[key].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  function txt(label: string, key: keyof ReturnType<typeof toForm>, type = "text") {
    const id = `crm-${key}`;
    return (
      <div>
        <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
        <Input id={id} type={type} className="mt-1" value={form[key]} onChange={(e) => set(key, e.target.value)} maxLength={300} />
      </div>
    );
  }
}

function toForm(c: CrmContact) {
  return {
    pipeline_stage: c.pipeline_stage ?? "nuevo",
    priority: c.priority ?? "",
    client_type: c.client_type ?? "",
    experience_level: c.experience_level ?? "",
    contact_preference: c.contact_preference ?? "",
    goal: c.goal ?? "",
    desired_dates: c.desired_dates ?? "",
    recommended_service: c.recommended_service ?? "",
    participants: c.participants != null ? String(c.participants) : "",
    tags: (c.tags ?? []).join(", "),
  };
}
