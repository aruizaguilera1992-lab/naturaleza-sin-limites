import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

const REASONS: Record<string, string> = {
  not_available: 'Este enlace ya no está disponible.',
  rgpd: 'Debes aceptar la política de privacidad.',
  invalid_contact: 'Indica tu nombre y un email o teléfono válido.',
  invalid_participants: 'El número de personas no es válido. Escríbenos por WhatsApp.',
};

/** Aceptación sin pago de una propuesta privada: crea la reserva pendiente; la señal la envía el equipo. */
export function AcceptProposal({ token, defaultName, acceptedAt, onAccepted }: { token: string; defaultName: string; acceptedAt: string | null; onAccepted: (at: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rgpd, setRgpd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (acceptedAt) {
    return (
      <p role="status" className="flex w-full items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        Propuesta aceptada. Te enviaremos el enlace para pagar la señal y confirmar la fecha.
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { data, error: err } = await supabase.rpc('accept_activity_sheet', { _token: token, _name: name, _email: email, _phone: phone, _rgpd: rgpd });
    setBusy(false);
    const r = data as { ok?: boolean; reason?: string; accepted_at?: string } | null;
    if (err || !r?.ok) { setError(REASONS[r?.reason ?? ''] ?? 'No se pudo aceptar. Inténtalo de nuevo o escríbenos.'); return; }
    setOpen(false);
    onAccepted(r.accepted_at ?? new Date().toISOString());
  };

  return (
    <>
      <Button variant="hero" className="min-h-11" onClick={() => setOpen(true)}><CheckCircle2 className="mr-1 h-4 w-4" />Aceptar propuesta</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceptar propuesta</DialogTitle>
            <DialogDescription>No se cobra nada ahora. Te enviaremos el enlace de la señal del 30 % para confirmar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><Label htmlFor="ap-name">Nombre</Label><Input id="ap-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required /></div>
            <div><Label htmlFor="ap-email">Email</Label><Input id="ap-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} /></div>
            <div><Label htmlFor="ap-phone">Teléfono</Label><Input id="ap-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} /></div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <Checkbox checked={rgpd} onCheckedChange={(v) => setRgpd(v === true)} className="mt-0.5" />
              <span>Acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline">política de privacidad</a> para gestionar mi reserva.</span>
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="hero" className="min-h-11 w-full" disabled={busy || !rgpd}>{busy ? 'Enviando…' : 'Confirmar aceptación'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
