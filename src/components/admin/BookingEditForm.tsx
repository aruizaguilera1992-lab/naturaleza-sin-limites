import { useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Editable = {
  activity: string;
  preferred_date: string | null;
  number_of_people: string | null;
  experience_level: string | null;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  message: string | null;
};

const FIELDS: { key: keyof Editable; label: string; type?: string; required?: boolean }[] = [
  { key: "activity", label: "Actividad", required: true },
  { key: "preferred_date", label: "Fecha", type: "date" },
  { key: "number_of_people", label: "Participantes", type: "number" },
  { key: "experience_level", label: "Nivel" },
  { key: "name", label: "Cliente" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Teléfono", type: "tel" },
];

/** Lets an admin correct any section of a booking request. RLS restricts updates to admins. */
export function BookingEditForm({ booking, onSaved }: { booking: Editable & { id: string; event_id: string | null }; onSaved: (patch: Partial<Editable>) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const initial = () => Object.fromEntries([...FIELDS.map((f) => f.key), "message"].map((k) => [k, (booking[k as keyof Editable] as string | null) ?? ""])) as Record<string, string>;
  const [form, setForm] = useState<Record<string, string>>(initial);

  const save = async () => {
    if (!form.activity.trim()) {
      toast({ title: "La actividad es obligatoria", variant: "destructive" });
      return;
    }
    if (form.number_of_people && !(Number(form.number_of_people) >= 1 && Number(form.number_of_people) <= 6)) {
      toast({ title: "Participantes no válidos", description: "Indica de 1 a 6 personas.", variant: "destructive" });
      return;
    }
    const patch: Partial<Editable> = {};
    for (const [k, v] of Object.entries(form)) {
      const value = v.trim() === "" ? null : v.trim();
      if (k === "activity") patch.activity = value ?? booking.activity;
      else (patch as Record<string, string | null>)[k] = value;
    }
    if (patch.email) patch.email = patch.email.toLowerCase();
    // Contact is the legacy required field: keep it aligned with email/phone.
    const contact = patch.email || patch.phone;
    setSaving(true);
    const { error } = await supabase.from("bookings").update({ ...patch, ...(contact ? { contact } : {}) }).eq("id", booking.id);
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      return;
    }
    onSaved({ ...patch, ...(contact ? { contact } : {}) } as Partial<Editable>);
    setOpen(false);
    toast({ title: "Solicitud actualizada" });
  };

  if (!open) {
    return (
      <Button variant="outline" className="mt-4 min-h-11 gap-2" onClick={() => { setForm(initial()); setOpen(true); }}>
        <Pencil className="h-4 w-4" aria-hidden="true" /> Editar solicitud
      </Button>
    );
  }

  return (
    <section aria-label="Editar solicitud" className="mt-4 rounded-xl border border-primary/40 bg-background/60 p-4">
      <h3 className="font-heading font-semibold text-foreground">Editar solicitud</h3>
      {booking.event_id && (
        <p className="mt-1 text-xs text-muted-foreground">Reserva de salida programada: cambiar fecha o participantes aquí no mueve las plazas reservadas.</p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Label htmlFor={`edit-${f.key}`} className="text-sm text-muted-foreground">{f.label}</Label>
            <Input
              id={`edit-${f.key}`}
              type={f.type ?? "text"}
              min={f.type === "number" ? 1 : undefined}
              max={f.type === "number" ? 6 : undefined}
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className="mt-1.5 h-11 text-foreground"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Label htmlFor="edit-message" className="text-sm text-muted-foreground">Comentarios del cliente</Label>
          <Textarea id="edit-message" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="mt-1.5 text-foreground" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="min-h-11 gap-2" disabled={saving} onClick={save}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar cambios
        </Button>
        <Button variant="ghost" className="min-h-11 gap-2" disabled={saving} onClick={() => setOpen(false)}>
          <X className="h-4 w-4" /> Cancelar
        </Button>
      </div>
    </section>
  );
}
