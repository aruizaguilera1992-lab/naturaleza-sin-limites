import { useEffect, useState } from 'react';
import { Plus, Trash2, Mail, MessageCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { defaultDossier, lines, whatsappDossierText, type DossierContent, type DossierParticipant } from '@/lib/activityDossier';

interface Props { booking: { id: string; activity: string; name?: string | null; email?: string | null; phone?: string | null; contact: string; status: string; paid_amount_cents?: number | null }; defaultRules?: string | null }
type Row = { id: string; token: string; status: string; content: DossierContent; participants: DossierParticipant[]; sent_at: string | null; completed_at: string | null };

export function DossierPanel({ booking, defaultRules }: Props) {
  const [row, setRow] = useState<Row | null>(null);
  const [c, setC] = useState<DossierContent>(() => defaultDossier(booking.activity, defaultRules));
  const [needs, setNeeds] = useState(c.needs.join('\n'));
  const [rules, setRules] = useState(c.rules.join('\n'));
  const [busy, setBusy] = useState(false);
  const paid = !!booking.paid_amount_cents || booking.status === 'confirmada';

  useEffect(() => {
    supabase.from('activity_dossiers').select('id, token, status, content, participants, sent_at, completed_at').eq('booking_id', booking.id).then(({ data }) => {
      const r = (Array.isArray(data) ? data[0] : data) as unknown as Row | undefined; if (!r?.content) return; setRow(r); setC(r.content); setNeeds(r.content.needs.join('\n')); setRules(r.content.rules.join('\n'));
    });
  }, [booking.id]);

  const content = (): DossierContent => ({ ...c, needs: lines(needs), rules: lines(rules), schedule: c.schedule.filter((s) => s.label.trim()) });
  const save = async (): Promise<Row | null> => {
    setBusy(true);
    const payload = { booking_id: booking.id, content: content() as never };
    const q = row ? supabase.from('activity_dossiers').update(payload).eq('id', row.id) : supabase.from('activity_dossiers').insert(payload);
    const { data, error } = await q.select('id, token, status, content, participants, sent_at, completed_at').single();
    setBusy(false);
    if (error) { toast.error('No se pudo guardar el dossier'); return null; }
    const r = data as unknown as Row; setRow(r); toast.success('Dossier guardado'); return r;
  };
  const link = (r: Row) => `${window.location.origin}/dossier/${r.token}`;
  const sendEmail = async () => {
    const email = booking.email || (booking.contact.includes('@') ? booking.contact : '');
    if (!email) { toast.error('La reserva no tiene email'); return; }
    const r = await save(); if (!r) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('send-activity-dossier', { body: { id: r.id, email, origin: window.location.origin, send_id: crypto.randomUUID() } });
    setBusy(false);
    if (error || !(data as { ok?: boolean })?.ok) { toast.error('No se pudo enviar el correo'); return; }
    setRow({ ...r, status: r.status === 'completado' ? r.status : 'enviado', sent_at: new Date().toISOString() }); toast.success(`Dossier enviado a ${email}`);
  };
  const sendWhatsapp = async () => {
    const r = await save(); if (!r) return;
    if (r.status === 'borrador') { await supabase.from('activity_dossiers').update({ status: 'enviado', sent_at: new Date().toISOString() }).eq('id', r.id); setRow({ ...r, status: 'enviado' }); }
    const phone = (booking.phone ?? '').replace(/\D/g, '');
    const to = phone.length === 9 ? `34${phone}` : phone;
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(whatsappDossierText(booking.name ?? null, booking.activity, link(r)))}`, '_blank', 'noopener,noreferrer');
  };
  const setItem = (i: number, k: 'time' | 'label', v: string) => setC({ ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });
  const statusLabel = row?.status === 'completado' ? 'Completado por el cliente' : row?.status === 'enviado' ? 'Enviado' : row ? 'Borrador' : 'Sin crear';

  return (
    <section aria-labelledby="dossier-title" className="mt-4 rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 id="dossier-title" className="font-heading font-semibold text-foreground">Dossier · Pasos a seguir</h3>
        <span className="rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">{statusLabel}</span>
      </div>
      {!paid && <p className="mb-3 text-sm text-muted-foreground">Disponible cuando la reserva esté pagada.</p>}
      <fieldset disabled={!paid || busy} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Cronograma</p>
          <div className="space-y-2">
            {c.schedule.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input aria-label="Hora" type="time" className="w-28" value={s.time} onChange={(e) => setItem(i, 'time', e.target.value)} />
                <Input aria-label="Paso" value={s.label} maxLength={160} onChange={(e) => setItem(i, 'label', e.target.value)} />
                <Button type="button" size="icon" variant="ghost" aria-label="Quitar" onClick={() => setC({ ...c, schedule: c.schedule.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setC({ ...c, schedule: [...c.schedule, { time: '', label: '' }] })}><Plus className="mr-1 h-4 w-4" />Añadir paso</Button>
          </div>
        </div>
        <label className="block text-sm font-medium text-foreground">Qué necesitas (uno por línea)<Textarea className="mt-1" rows={4} value={needs} onChange={(e) => setNeeds(e.target.value)} /></label>
        <label className="block text-sm font-medium text-foreground">Normas de participación (una por línea)<Textarea className="mt-1" rows={4} value={rules} onChange={(e) => setRules(e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={c.canyoning} onChange={(e) => setC({ ...c, canyoning: e.target.checked })} />Pedir medidas de neopreno y escarpines (SELAND)</label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={save}><Save className="mr-1 h-4 w-4" />Guardar</Button>
          <Button type="button" onClick={sendEmail}><Mail className="mr-1 h-4 w-4" />Enviar por email</Button>
          <Button type="button" variant="outline" onClick={sendWhatsapp}><MessageCircle className="mr-1 h-4 w-4" />Enviar por WhatsApp</Button>
        </div>
      </fieldset>
      {row && row.participants.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <p className="mb-2 text-sm font-medium text-foreground">Participantes registrados para el seguro</p>
          <table className="w-full text-left text-xs text-foreground">
            <thead className="text-muted-foreground"><tr><th className="p-1">Nombre</th><th className="p-1">DNI/NIE</th><th className="p-1">Nacimiento</th><th className="p-1">Teléfono</th><th className="p-1">Emergencia</th><th className="p-1">Salud</th>{c.canyoning && <><th className="p-1">Medidas</th><th className="p-1">Neopreno</th><th className="p-1">Escarpín</th></>}</tr></thead>
            <tbody>{row.participants.map((p, i) => (
              <tr key={i} className="border-t border-border"><td className="p-1">{p.fullName}</td><td className="p-1">{p.docId}</td><td className="p-1">{p.birthDate}</td><td className="p-1">{p.phone}</td><td className="p-1">{p.emergencyName} · {p.emergencyPhone}</td><td className="p-1">{p.health || '—'}</td>
                {c.canyoning && <><td className="p-1">{[p.heightCm && `${p.heightCm} cm`, p.weightKg && `${p.weightKg} kg`, p.chestCm && `pecho ${p.chestCm}`, p.waistCm && `cintura ${p.waistCm}`, p.hipCm && `cadera ${p.hipCm}`, p.footEu && `pie ${p.footEu}`].filter(Boolean).join(' · ')}</td><td className="p-1">{p.wetsuitSize || 'Asignar'}</td><td className="p-1">{p.bootieSize || 'Asignar'}</td></>}</tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
