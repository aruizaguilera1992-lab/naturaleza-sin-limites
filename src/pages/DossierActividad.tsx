import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { MeetingPointStep } from '@/components/shared/MeetingPoint';
import { isMeetingPointLabel } from '@/lib/meetingPoint';
import { participantErrors, suggestBootie, suggestWetsuit, type DossierContent, type DossierParticipant } from '@/lib/activityDossier';

const blank = (): DossierParticipant => ({ fullName: '', docId: '', birthDate: '', phone: '', emergencyName: '', emergencyPhone: '', health: '' });
type Data = { content: DossierContent; status: string; participants: DossierParticipant[]; activity: string; date: string | null; people: string | null };

export default function DossierActividad() {
  const { token = '' } = useParams();
  const [state, setState] = useState<'loading' | 'ok' | 'off'>('loading');
  const [d, setD] = useState<Data | null>(null);
  const [ps, setPs] = useState<DossierParticipant[]>([blank()]);
  const [rulesOk, setRulesOk] = useState(false); const [rgpd, setRgpd] = useState(false);
  const [msg, setMsg] = useState<string | null>(null); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc('get_activity_dossier' as never, { _token: token } as never).then(({ data, error }) => {
      const r = data as unknown as ({ available?: boolean } & Data) | null;
      if (error || !r?.available) { setState('off'); return; }
      setD(r); const n = Math.min(6, Math.max(1, Number(r.people) || 1));
      setPs(r.participants?.length ? r.participants : Array.from({ length: n }, blank)); setDone(r.status === 'completado'); setState('ok');
    });
  }, [token]);

  const upd = (i: number, k: keyof DossierParticipant, v: string) => setPs(ps.map((p, j) => {
    if (j !== i) return p;
    const num = ['heightCm', 'weightKg', 'chestCm', 'waistCm', 'hipCm', 'footEu'].includes(k);
    const n = { ...p, [k]: num ? (v ? Number(v) : null) : v } as DossierParticipant;
    return { ...n, wetsuitSize: suggestWetsuit(n), bootieSize: suggestBootie(n.footEu) };
  }));
  const submit = async () => {
    const errs = ps.map(participantErrors).map((e, i) => (e.length ? `Participante ${i + 1}: ${e.join(', ')}` : '')).filter(Boolean);
    if (errs.length) { setMsg(`Revisa: ${errs.join(' · ')}`); return; }
    if (!rulesOk || !rgpd) { setMsg('Acepta las normas y el tratamiento de datos para el seguro.'); return; }
    setBusy(true); setMsg(null);
    const { data } = await supabase.rpc('submit_activity_dossier' as never, { _token: token, _participants: ps, _rgpd: true } as never);
    setBusy(false);
    if ((data as unknown as { ok?: boolean })?.ok) { setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } else setMsg('No se pudo enviar. Revisa los datos o escríbenos por WhatsApp.');
  };

  const f = (i: number, k: keyof DossierParticipant, label: string, type = 'text') => (
    <label className="block text-sm text-foreground">{label}<Input className="mt-1 bg-background" type={type} value={(ps[i][k] as string | number | null) ?? ''} maxLength={120} onChange={(e) => upd(i, k, e.target.value)} /></label>
  );
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Pasos a seguir | Naturaleza Sin Límites</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 pt-44 sm:pt-48 md:pt-32 lg:pt-40 pb-16">
        {state === 'loading' && <p className="text-muted-foreground">Cargando…</p>}
        {state === 'off' && <div className="rounded-xl border border-border bg-card p-8 text-center"><h1 className="font-heading text-2xl font-bold text-foreground">Este enlace ya no está disponible</h1><p className="mt-2 text-muted-foreground">Escríbenos por WhatsApp y te enviamos uno nuevo.</p></div>}
        {state === 'ok' && d && (<div className="space-y-6">
          <header><p className="text-xs uppercase tracking-[0.2em] text-primary">Pasos a seguir</p><h1 className="mt-2 font-heading text-3xl font-bold text-foreground">{d.activity}</h1>{d.date && <p className="mt-1 text-muted-foreground">{new Date(d.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>}</header>
          {done && <p className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/10 p-4 text-foreground"><CheckCircle2 className="h-5 w-5 text-primary" />Registro recibido. Puedes corregirlo y volver a enviarlo.</p>}
          <section className="rounded-xl border border-border bg-card p-5"><h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Cronograma</h2>
            <ol className="relative space-y-4 border-l-2 border-primary/60 pl-5">{d.content.schedule.map((s, i) => <li key={i} className="relative"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" /><p className="font-heading font-bold text-primary">{s.time}</p><p className="text-foreground">{s.label}</p></li>)}</ol></section>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5"><h2 className="mb-3 font-heading text-lg font-semibold text-foreground">Qué necesitas</h2><ul className="list-disc space-y-1 pl-5 text-foreground">{d.content.needs.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
            <div className="rounded-xl border border-border bg-card p-5"><h2 className="mb-3 font-heading text-lg font-semibold text-foreground">Normas de participación</h2><ul className="list-disc space-y-1 pl-5 text-foreground">{d.content.rules.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
          </section>
          <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-heading text-lg font-semibold text-foreground">Registro para el seguro de responsabilidad</h2>
            {d.content.canyoning && <p className="mt-1 text-sm text-muted-foreground">Incluye tus medidas para preparar neopreno y escarpines SELAND.</p>}
            <div className="mt-4 space-y-5">{ps.map((_, i) => (
              <fieldset key={i} className="rounded-lg border border-border p-4"><legend className="px-2 font-heading text-sm font-semibold text-primary">Participante {i + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">{f(i, 'fullName', 'Nombre y apellidos')}{f(i, 'docId', 'DNI/NIE o pasaporte')}{f(i, 'birthDate', 'Fecha de nacimiento', 'date')}{f(i, 'phone', 'Teléfono', 'tel')}{f(i, 'emergencyName', 'Contacto de emergencia')}{f(i, 'emergencyPhone', 'Teléfono de emergencia', 'tel')}</div>
                <div className="mt-3">{f(i, 'health', 'Salud relevante: alergias, lesiones, medicación (opcional)')}</div>
                {d.content.canyoning && <label className="mt-3 block text-sm text-foreground">Tabla de neopreno<select className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3" value={ps[i].sizeGroup ?? ''} onChange={(e) => upd(i, 'sizeGroup', e.target.value)}><option value="">Elige</option><option value="nino">Niño</option><option value="hombre">Hombre</option><option value="mujer">Mujer</option></select></label>}
                {d.content.canyoning && ps[i].wetsuitSize && <p className="mt-2 text-sm text-primary">Talla de neopreno SELAND sugerida: <strong>{ps[i].wetsuitSize}</strong></p>}
                {d.content.canyoning && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{f(i, 'heightCm', 'Altura (cm)', 'number')}{f(i, 'weightKg', 'Peso (kg)', 'number')}{f(i, 'chestCm', 'Pecho (cm)', 'number')}{f(i, 'waistCm', 'Cintura (cm)', 'number')}{f(i, 'hipCm', 'Cadera (cm)', 'number')}{f(i, 'footEu', 'Nº de pie (EU)', 'number')}</div>}
                {ps.length > 1 && <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setPs(ps.filter((__, j) => j !== i))}><Trash2 className="mr-1 h-4 w-4" />Quitar</Button>}
              </fieldset>))}
              {ps.length < 6 && <Button type="button" variant="outline" onClick={() => setPs([...ps, blank()])}><Plus className="mr-1 h-4 w-4" />Añadir participante</Button>}
            </div>
            <div className="mt-5 space-y-2 text-sm text-foreground">
              <label className="flex gap-2"><input type="checkbox" checked={rulesOk} onChange={(e) => setRulesOk(e.target.checked)} />He leído y acepto las normas de participación.</label>
              <label className="flex gap-2"><input type="checkbox" checked={rgpd} onChange={(e) => setRgpd(e.target.checked)} />Autorizo el uso de estos datos solo para tramitar el seguro de la actividad, según la política de privacidad.</label>
            </div>
            {msg && <p className="mt-3 text-sm text-destructive">{msg}</p>}
            <Button className="mt-4 w-full" disabled={busy} onClick={submit}>{done ? 'Actualizar registro' : 'Enviar registro'}</Button>
          </section>
        </div>)}
      </main>
      <Footer />
    </div>
  );
}
