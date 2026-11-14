import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Send, CalendarClock, FlaskConical, Eye, Ban } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { newsletterSegments, disciplineLabels, renderNewsletter } from '@/lib/newsletter';
import type { Tables } from '@/integrations/supabase/types';
import type { EditorialPiece } from '@/lib/editorial';
export type Campaign = Tables<'newsletter_campaigns'>;
export async function campaignAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('newsletter-campaigns', { body });
  if (error) {
    if (error instanceof FunctionsHttpError) { const detail = await error.context.json().catch(() => null); throw new Error(detail?.error ?? 'No se pudo completar la acción'); }
    throw error;
  }
  if (!data?.ok) throw new Error(data?.error ?? 'El correo no se ha enviado');
  return data;
}
export function NewsletterComposer({ initial, pieces, onClose, onSaved }: { initial: Campaign | null; pieces: EditorialPiece[]; onClose: () => void; onSaved: (id: string) => Promise<void> }) {
  const [form, setForm] = useState({ piece_id: initial?.piece_id ?? null as string | null, subject: initial?.subject ?? '', preheader: initial?.preheader ?? '', title: initial?.title ?? '', content: initial?.content ?? '', segments: initial?.segments ?? [] as string[] });
  const [date, setDate] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('edit');
  const [testId, setTestId] = useState(() => crypto.randomUUID());
  const savedForm = { piece_id: initial?.piece_id ?? null, subject: initial?.subject ?? '', preheader: initial?.preheader ?? '', title: initial?.title ?? '', content: initial?.content ?? '', segments: initial?.segments ?? [] };
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm); const editable = !initial || initial.status === 'borrador';
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const update = (key: 'subject' | 'preheader' | 'title' | 'content', value: string) => { setForm(f => ({ ...f, [key]: value })); setTestId(crypto.randomUUID()); };
  const act = async (action: 'save' | 'test' | 'start' | 'cancel', scheduled = false) => {
    if (action === 'start' && (!initial || dirty)) { setError('Guarda los cambios antes de enviar.'); return; }
    if (scheduled && (!date || new Date(date).getTime() <= Date.now())) { setError('Elige una fecha futura.'); return; }
    if ((action === 'start' || action === 'cancel') && !window.confirm(action === 'cancel' ? '¿Cancelar los envíos pendientes? Los correos ya aceptados no pueden retirarse.' : scheduled ? '¿Programar esta campaña para las disciplinas seleccionadas?' : '¿Enviar esta campaña ahora a los suscriptores confirmados de las disciplinas seleccionadas?')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await campaignAction({ action, ...(initial ? { id: initial.id, expected: initial.updated_at } : {}), ...(action === 'save' || action === 'test' ? { campaign: form } : {}), ...(action === 'test' ? { test_id: testId } : {}), ...(scheduled ? { scheduled_at: new Date(date).toISOString() } : {}) });
      if (action === 'test') setNotice('Correo de prueba aceptado para tu dirección de administrador.');
      else await onSaved(result.id);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la acción'); } finally { setBusy(false); }
  };
  return <section className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3 border-b border-border pb-4"><Button variant="ghost" onClick={() => { if (!dirty || window.confirm('¿Salir sin guardar?')) onClose(); }} disabled={busy}><ArrowLeft className="mr-2 h-4 w-4" />Campañas</Button><div className="flex flex-wrap gap-2 items-center">{dirty && <span className="text-sm text-muted-foreground">Cambios sin guardar</span>}{editable && <Button variant="outline" disabled={busy} onClick={() => act('save')}><Save className="mr-2 h-4 w-4" />Guardar borrador</Button>}<Button variant="outline" disabled={busy} onClick={() => act('test')}><FlaskConical className="mr-2 h-4 w-4" />Prueba a mi correo</Button></div></div>
    {error && <p role="alert" className="text-destructive">{error}</p>}{notice && <p role="status" className="text-primary">{notice}</p>}
    <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="edit">Newsletter</TabsTrigger><TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Vista previa</TabsTrigger><TabsTrigger value="send">Envío</TabsTrigger></TabsList>
      <TabsContent value="edit" forceMount className="data-[state=inactive]:hidden space-y-5 pt-4"><fieldset disabled={!editable || busy} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="campaign-piece">Pieza editorial</Label><select id="campaign-piece" className="w-full rounded-md border border-input bg-background p-2 text-foreground" value={form.piece_id ?? ''} onChange={e => { const piece = pieces.find(p => p.id === e.target.value); if (piece && (!dirty || window.confirm('¿Sustituir título y contenido con esta pieza?'))) { setForm(f => ({ ...f, piece_id: piece.id ?? null, subject: piece.title, title: piece.title, preheader: piece.excerpt, content: piece.content })); setTestId(crypto.randomUUID()); } else if (!e.target.value) setForm(f => ({ ...f, piece_id: null })); }}><option value="">Newsletter independiente</option>{pieces.map(p => <option key={p.id} value={p.id}>{p.title || p.slug} · {p.status}</option>)}</select></div>
        {(['subject','preheader','title'] as const).map(key => <div key={key} className="space-y-2"><Label htmlFor={`campaign-${key}`}>{({subject:'Asunto',preheader:'Texto de avance',title:'Título de la newsletter'})[key]}</Label><Input id={`campaign-${key}`} maxLength={key === 'subject' ? 200 : key === 'preheader' ? 300 : 500} value={form[key]} onChange={e => update(key,e.target.value)} /></div>)}
        <div className="space-y-2"><Label htmlFor="campaign-content">Contenido (Markdown)</Label><Textarea id="campaign-content" value={form.content} onChange={e => update('content',e.target.value)} className="min-h-80 font-mono" maxLength={100000} /></div>
        <fieldset className="space-y-3"><legend className="text-sm font-medium">Disciplinas</legend><div className="flex flex-wrap gap-2">{newsletterSegments.map(s => <Button type="button" key={s} variant={form.segments.includes(s) ? 'default' : 'outline'} aria-pressed={form.segments.includes(s)} onClick={() => setForm(f => ({ ...f, segments: f.segments.includes(s) ? f.segments.filter(v => v !== s) : [...f.segments,s] }))}>{disciplineLabels[s]}</Button>)}</div></fieldset>
      </fieldset></TabsContent>
      <TabsContent value="preview" forceMount className="data-[state=inactive]:hidden pt-4"><iframe title="Vista previa del correo" sandbox="" srcDoc={renderNewsletter(form)} className="h-[700px] w-full max-w-3xl rounded-md border border-border" /></TabsContent>
      <TabsContent value="send" forceMount className="data-[state=inactive]:hidden space-y-5 pt-4"><p className="text-sm text-muted-foreground">Estado: {initial?.status ?? 'borrador'}{initial?.scheduled_at ? ` · ${new Date(initial.scheduled_at).toLocaleString('es-ES')}` : ''}</p>
        {editable && <><Button disabled={busy || !initial || dirty} onClick={() => act('start')}><Send className="mr-2 h-4 w-4" />Enviar ahora</Button><div className="space-y-2 max-w-md"><Label htmlFor="campaign-date">Fecha y hora (zona horaria de este dispositivo)</Label><Input id="campaign-date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /><Button variant="outline" disabled={busy || !initial || dirty || !date} onClick={() => act('start', true)}><CalendarClock className="mr-2 h-4 w-4" />Programar envío</Button></div></>}
        {initial && ['borrador','programada','enviando'].includes(initial.status) && <Button variant="outline" disabled={busy} onClick={() => act('cancel')}><Ban className="mr-2 h-4 w-4" />Cancelar campaña</Button>}
      </TabsContent>
    </Tabs>
  </section>;
}