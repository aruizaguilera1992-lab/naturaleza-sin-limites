import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const REASONS: Record<string, string> = {
  not_available: 'Este enlace ya no está disponible.',
  invalid_participants: 'El número de personas no es válido. Escríbenos por WhatsApp.',
};

/** Confirmación sin pago: los datos de contacto ya los tiene el equipo (ficha vinculada), solo se pide confirmar. */
export function AcceptProposal({ token, defaultName, acceptedAt, onAccepted }: { token: string; defaultName: string; acceptedAt: string | null; onAccepted: (at: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (acceptedAt) {
    return (
      <p role="status" className="flex w-full items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        ¡Fecha confirmada! Te enviaremos el enlace para pagar la señal del 30 % y cerrar tu plaza.
      </p>
    );
  }

  const confirm = async () => {
    setBusy(true); setError('');
    const { data, error: err } = await supabase.rpc('accept_activity_sheet', { _token: token, _name: '', _email: '', _phone: '', _rgpd: true });
    setBusy(false);
    const r = data as { ok?: boolean; reason?: string; accepted_at?: string } | null;
    if (err || !r?.ok) { setError(REASONS[r?.reason ?? ''] ?? 'No se pudo confirmar. Inténtalo de nuevo o escríbenos.'); return; }
    setOpen(false);
    onAccepted(r.accepted_at ?? new Date().toISOString());
    // Aviso interno al equipo; si falla no afecta a la confirmación del cliente.
    supabase.functions.invoke('notify-sheet-acceptance', { body: { token, origin: window.location.origin } }).catch(() => {});
  };

  return (
    <>
      <Button variant="hero" className="min-h-11" onClick={() => setOpen(true)}><CheckCircle2 className="mr-1 h-4 w-4" />Confirmar fecha</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{defaultName ? `¿Confirmamos, ${defaultName}?` : '¿Confirmamos tu fecha?'}</DialogTitle>
            <DialogDescription>Reservamos esta propuesta para ti. No se cobra nada ahora: te enviaremos el enlace de la señal del 30 %.</DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Al confirmar aceptas la <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline">política de privacidad</a> para gestionar tu reserva.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button variant="hero" className="min-h-11 w-full" disabled={busy} onClick={confirm}>{busy ? 'Confirmando…' : 'Sí, confirmo la fecha'}</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
