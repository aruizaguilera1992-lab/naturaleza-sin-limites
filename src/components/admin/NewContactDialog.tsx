import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, UserPlus } from "lucide-react";
import { isValidEmail, normalizePhone } from "@/lib/crmContact";
import { findDuplicates } from "@/lib/crmFollowUp";

type Existing = { id: string; nombre: string; email?: string | null; phone?: string | null; contacto?: string | null };

export function NewContactDialog({ existing, onCreated, onOpenExisting }: {
  existing: Existing[]; onCreated: (id: string) => void; onOpenExisting: (id: string) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nombre: "", email: "", phone: "", interes: "", mensaje: "" });
  const [busy, setBusy] = useState(false);
  const dups = useMemo(() => findDuplicates({ email: f.email, phone: f.phone }, existing), [f.email, f.phone, existing]);
  const emailBad = !!f.email.trim() && !isValidEmail(f.email);
  const phoneBad = !!f.phone.trim() && !normalizePhone(f.phone);
  const valid = f.nombre.trim().length >= 2 && (f.email.trim() || f.phone.trim()) && !emailBad && !phoneBad;

  const submit = async () => {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const email = f.email.trim() || null, phone = f.phone.trim() || null;
    const { data, error } = await supabase.from("contact_submissions").insert({
      nombre: f.nombre.trim().slice(0, 120),
      contacto: (email ?? phone)!,
      email, phone,
      interes: f.interes.trim().slice(0, 120) || "Sin indicar",
      mensaje: f.mensaje.trim().slice(0, 1000) || null,
      source: "manual",
      created_by: u.user?.id ?? null,
    }).select("id").single();
    setBusy(false);
    if (error) return toast({ title: "No se pudo crear", description: error.message, variant: "destructive" });
    toast({ title: "Contacto creado" });
    setOpen(false);
    setF({ nombre: "", email: "", phone: "", interes: "", mensaje: "" });
    onCreated(data.id);
  };

  const field = (k: keyof typeof f, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <Label htmlFor={`nc-${k}`} className="text-xs text-muted-foreground">{label}</Label>
      <Input id={`nc-${k}`} className="mt-1" value={f[k]} onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))} {...props} />
    </div>
  );

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><UserPlus className="mr-1 h-4 w-4" />Nuevo contacto</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo contacto</DialogTitle>
            <DialogDescription>Añade a mano a alguien que te ha llamado o escrito. No se le envía nada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {field("nombre", "Nombre *", { maxLength: 120 })}
            {field("email", "Email", { type: "email", maxLength: 150, "aria-invalid": emailBad })}
            {emailBad && <p className="text-xs text-destructive">Email no válido.</p>}
            {field("phone", "Teléfono", { type: "tel", maxLength: 30, "aria-invalid": phoneBad })}
            {phoneBad && <p className="text-xs text-destructive">Teléfono no válido.</p>}
            {field("interes", "Interés", { maxLength: 120 })}
            <div>
              <Label htmlFor="nc-mensaje" className="text-xs text-muted-foreground">Notas</Label>
              <Textarea id="nc-mensaje" rows={3} className="mt-1" maxLength={1000} value={f.mensaje} onChange={(e) => setF((s) => ({ ...s, mensaje: e.target.value }))} />
            </div>
            {dups.length > 0 && (
              <div role="alert" className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
                <p className="flex items-center gap-1 font-medium"><AlertTriangle className="h-4 w-4" />Ya existe un contacto con estos datos</p>
                <ul className="mt-1 space-y-1">
                  {dups.slice(0, 3).map((d) => (
                    <li key={d.id}>
                      <button type="button" className="underline" onClick={() => { setOpen(false); onOpenExisting(d.id); }}>{d.nombre}</button>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground">Puedes abrirlo o crear igualmente uno nuevo.</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Indica al menos email o teléfono.</p>
            <Button className="w-full" disabled={!valid || busy} onClick={submit}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{dups.length ? "Crear igualmente" : "Crear contacto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
