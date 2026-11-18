import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Eye, ImagePlus, Link2Off, Mail, MessageCircle, Plus, Save, Trash2 } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { SheetView } from './SheetView';
import { CATALOG_BUCKET, type CatalogItem } from '@/lib/adminCatalog';
import type { CatalogOutingStart } from '@/lib/catalogOuting';
import {
  MAX_SHEET_PEOPLE, STORAGE_PHOTO, sheetBases, sheetFromBase, sheetFromCatalog, sheetPhotoOptions, sheetState, sheetUrl, sheetWhatsappUrl, validateSheet, sheetFromRequest,
  type SheetContent, type SheetRequestPrefill, type SheetState,
} from '@/lib/activitySheets';

export interface SheetContact { id: string; nombre: string; email: string | null; phone: string | null }
interface SheetRow { id: string; token: string; content: SheetContent; status: string; contact_id: string | null; expires_at: string | null; sent_at: string | null; first_viewed_at: string | null; view_count: number; updated_at: string; accepted_at: string | null; booking_id: string | null }

const STATE_LABEL: Record<SheetState, string> = { borrador: 'Borrador', enviada: 'Enviada', vista: 'Vista', aceptada: 'Aceptada', caducada: 'Caducada', desactivada: 'Desactivada' };
const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const sel = 'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function Editor({ row, contacts, catalog, onSaved, onDeleted, onOpenBooking, prefill, fromItem }: { fromItem?: CatalogItem | null; prefill?: SheetRequestPrefill | null; row: SheetRow | null; contacts: SheetContact[]; catalog: CatalogItem[]; onSaved: (id: string) => Promise<void>; onDeleted: () => Promise<void>; onOpenBooking?: (bookingId: string) => void }) {
  const { toast } = useToast();
  const [c, setC] = useState<SheetContent>(() => row?.content ?? (fromItem ? sheetFromCatalog(fromItem) : prefill ? sheetFromRequest(prefill) : sheetFromBase(sheetBases[0].id)));
  const init = row?.content ?? (fromItem ? sheetFromCatalog(fromItem) : prefill ? sheetFromRequest(prefill) : sheetFromBase(sheetBases[0].id));
  const [contactId, setContactId] = useState<string>(() => row?.contact_id ?? (prefill ? (contacts.find((x) => (prefill.email && x.email?.toLowerCase() === prefill.email.toLowerCase()) || (prefill.phone && x.phone?.replace(/\D/g, '') === prefill.phone.replace(/\D/g, '')))?.id ?? '') : ''));
  const [expires, setExpires] = useState<string>(row?.expires_at?.slice(0, 10) ?? '');
  const contact = contacts.find((x) => x.id === contactId);
  const [email, setEmail] = useState<string>(contact?.email ?? prefill?.email ?? '');
  const [phone, setPhone] = useState<string>(contact?.phone ?? prefill?.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  // Texto en bruto de los listados: si se guardara ya filtrado, el salto de línea de Enter desaparecería al reescribir el campo.
  const [incRaw, setIncRaw] = useState(() => init.includes.join('\n'));
  const [bringRaw, setBringRaw] = useState(() => init.bring.join('\n'));
  const [reqRaw, setReqRaw] = useState(() => init.requirements.join('\n'));
  const ownPhotos = catalog.find((x) => `catalog:${x.key}` === c.base)?.photos ?? [];
  const set = <K extends keyof SheetContent>(k: K, v: SheetContent[K]) => setC((p) => ({ ...p, [k]: v }));
  const errors = validateSheet(c);
  const state = row ? sheetState(row) : 'borrador';
  const link = row ? sheetUrl(window.location.origin, row.token, c.title, (row as { short_code?: string | null }).short_code) : '';

  const save = async (activate = false): Promise<SheetRow | null> => {
    if (errors.length) { toast({ title: 'Revisa la ficha', description: errors.join(' · '), variant: 'destructive' }); return null; }
    setBusy(true);
    const payload = { content: c as unknown as Json, contact_id: contactId || null, expires_at: expires ? `${expires}T23:59:59+01:00` : null, ...(activate && row?.status !== 'desactivada' ? { status: 'enviada' } : {}) };
    const { data: u } = await supabase.auth.getUser();
    const q = row
      ? supabase.from('activity_sheets').update(payload).eq('id', row.id).select().single()
      : supabase.from('activity_sheets').insert({ ...payload, created_by: u.user?.id ?? null }).select().single();
    const { data, error } = await q;
    setBusy(false);
    if (error || !data) { toast({ title: 'No se pudo guardar', description: error?.message, variant: 'destructive' }); return null; }
    await onSaved(data.id);
    return data as unknown as SheetRow;
  };

  const logContact = async (kind: string, body: string) => {
    if (!contactId) return;
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('contact_events').insert({ contact_id: contactId, kind, body, origin: 'manual', author_id: u.user?.id ?? null });
  };

  const copy = async () => {
    const r = await save(true); if (!r) return;
    await navigator.clipboard.writeText(sheetUrl(window.location.origin, r.token, c.title, (r as { short_code?: string | null }).short_code)).catch(() => {});
    toast({ title: 'Enlace copiado y activado' });
  };
  const whatsapp = async () => {
    const r = await save(true); if (!r) return;
    window.open(sheetWhatsappUrl(phone, c, sheetUrl(window.location.origin, r.token, c.title, (r as { short_code?: string | null }).short_code)), '_blank', 'noopener,noreferrer');
    await logContact('comunicacion_whatsapp', `Ficha de actividad enviada por WhatsApp: ${c.title}`);
  };
  const sendEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { toast({ title: 'Email no válido', variant: 'destructive' }); return; }
    const r = await save(); if (!r) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('send-activity-sheet', { body: { id: r.id, email: email.trim(), origin: window.location.origin, send_id: crypto.randomUUID() } });
    setBusy(false);
    if (error || !data?.ok) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : (data?.error ?? error?.message);
      toast({ title: 'No se pudo enviar el email', description: String(details ?? ''), variant: 'destructive' });
    } else toast({ title: 'Ficha enviada por email' });
    await onSaved(r.id);
  };
  const uploadPhoto = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!IMG_TYPES.includes(f.type)) { toast({ title: 'Formato no admitido (JPG, PNG, WebP o AVIF)', variant: 'destructive' }); return; }
    if (f.size > 10 * 1024 * 1024) { toast({ title: 'Máximo 10 MB', variant: 'destructive' }); return; }
    setBusy(true);
    const ext = f.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `fichas/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, f, { contentType: f.type });
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
    if (error) { toast({ title: 'No se pudo subir la foto', description: error.message, variant: 'destructive' }); return; }
    setUploaded((p) => [...p, path]);
    set('photo', `${STORAGE_PHOTO}${path}`);
    toast({ title: 'Foto subida y seleccionada' });
  };

  const disable = async () => {
    if (!row) return;
    const { error } = await supabase.from('activity_sheets').update({ status: 'desactivada' }).eq('id', row.id);
    if (error) toast({ title: 'No se pudo desactivar', variant: 'destructive' }); else { toast({ title: 'Enlace desactivado' }); await onSaved(row.id); }
  };
  const remove = async () => {
    if (!row) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_delete_activity_sheet', { _id: row.id });
    setBusy(false);
    if (error) toast({ title: 'No se pudo eliminar', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Ficha eliminada definitivamente' }); await onDeleted(); }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={state === 'aceptada' ? 'default' : 'outline'}>{STATE_LABEL[state]}</Badge>
          {row?.accepted_at && <span className="text-xs text-muted-foreground">Confirmada el {new Date(row.accepted_at).toLocaleString('es-ES')}</span>}
          {row?.first_viewed_at && <span className="text-xs text-muted-foreground">Vista {row.view_count} {row.view_count === 1 ? 'vez' : 'veces'}</span>}
        </div>
        <ol aria-label="Flujo de la salida" className="grid grid-cols-4 gap-1 text-center text-[11px]">
          {[['Ficha', true], ['Enviada', !!row?.sent_at || state !== 'borrador'], ['Confirmada', !!row?.accepted_at], ['Reserva', !!row?.booking_id]].map(([l, on], i) => (
            <li key={i} className={`rounded-md border px-1 py-1.5 ${on ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground'}`}>{i + 1}. {l as string}</li>
          ))}
        </ol>
        {row?.booking_id && onOpenBooking && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
            <span className="text-foreground">Reserva creada. Siguiente paso: enviar el enlace de la señal.</span>
            <Button size="sm" variant="hero" className="min-h-11" onClick={() => { if (row.booking_id) onOpenBooking(row.booking_id); }}>Abrir reserva</Button>
          </div>
        )}
        <div><Label htmlFor="sh-base">Nivel de partida</Label>
          <select id="sh-base" className={sel} value={c.base} onChange={(e) => { const v = e.target.value; const it = catalog.find((x) => `catalog:${x.key}` === v); const next = it ? sheetFromCatalog(it) : sheetFromBase(v); setC((p) => ({ ...next, customerName: p.customerName, date: p.date, people: p.people, place: p.place, meetingPoint: p.meetingPoint, notes: p.notes, rules: p.rules, steps: p.steps })); setIncRaw(next.includes.join('\n')); setBringRaw(next.bring.join('\n')); setReqRaw(next.requirements.join('\n')); }}>
            <optgroup label="Niveles">{sheetBases.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</optgroup>
            <optgroup label="Catálogo (recorridos)">{catalog.map((it) => <option key={it.key} value={`catalog:${it.key}`}>{it.name} · {it.levelLabel}</option>)}</optgroup>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">Cambiarlo rellena texto, indicadores, incluye y edad.</p></div>
        <div><Label htmlFor="sh-contact">Cliente del CRM (opcional)</Label>
          <select id="sh-contact" className={sel} value={contactId} onChange={(e) => { const x = contacts.find((k) => k.id === e.target.value); setContactId(e.target.value); if (x) { setEmail(x.email ?? ''); setPhone(x.phone ?? ''); set('customerName', x.nombre); } }}>
            <option value="">Sin vincular</option>
            {contacts.map((k) => <option key={k.id} value={k.id}>{k.nombre}{k.email ? ` · ${k.email}` : ''}</option>)}
          </select></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="sh-name">Nombre del cliente</Label><Input id="sh-name" value={c.customerName} onChange={(e) => set('customerName', e.target.value)} /></div>
          <div><Label htmlFor="sh-title">Nombre</Label><Input id="sh-title" value={c.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div><Label htmlFor="sh-place">Recorrido / lugar</Label><Input id="sh-place" value={c.place} onChange={(e) => set('place', e.target.value)} /></div>
          <div><Label htmlFor="sh-date">Fecha propuesta (opcional)</Label><Input id="sh-date" type="date" value={c.date} onChange={(e) => set('date', e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Déjala vacía si la acordáis después: la ficha mostrará «Fecha a acordar».</p></div>
          <div><Label htmlFor="sh-dur">Duración</Label><Input id="sh-dur" value={c.duration} onChange={(e) => set('duration', e.target.value)} placeholder="p. ej. 4 horas" /></div>
          <div><Label htmlFor="sh-people">Personas (máx. {MAX_SHEET_PEOPLE})</Label><Input id="sh-people" type="number" min={1} max={MAX_SHEET_PEOPLE} value={c.people} onChange={(e) => set('people', Number(e.target.value))} /></div>
          <div><Label htmlFor="sh-price">Precio por persona (€)</Label><Input id="sh-price" type="number" min={0} value={c.pricePerPersonEuros ?? ''} placeholder="Vacío = a consultar" onChange={(e) => set('pricePerPersonEuros', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div><Label htmlFor="sh-grade">Grado técnico</Label><Input id="sh-grade" value={c.grade ?? ''} onChange={(e) => set('grade', e.target.value)} /></div>
          <div><Label htmlFor="sh-level">Nivel</Label>
            <select id="sh-level" className={sel} value={c.level} onChange={(e) => { const n = Number(e.target.value); set('level', n); set('levelLabel', ['Iniciación', 'Intermedio', 'Avanzado'][n - 1]); }}>
              <option value={1}>Iniciación</option><option value={2}>Intermedio</option><option value={3}>Avanzado</option>
            </select></div>
          <div><Label htmlFor="sh-age">Edad mínima</Label><Input id="sh-age" type="number" min={0} value={c.minAge} onChange={(e) => set('minAge', Number(e.target.value))} /></div>
          <div><Label htmlFor="sh-fit">Condición física</Label>
            <select id="sh-fit" className={sel} value={c.fitness} onChange={(e) => set('fitness', e.target.value)}><option>Básica</option><option>Media</option><option>Alta</option></select></div>
          <label className="flex items-center gap-2 pt-6 text-sm text-foreground"><input type="checkbox" checked={c.experience} onChange={(e) => set('experience', e.target.checked)} />Requiere experiencia previa</label>
          <div><Label htmlFor="sh-exp">Caduca el</Label><Input id="sh-exp" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></div>
        </div>
        <div><Label htmlFor="sh-meet">Punto de encuentro</Label><Input id="sh-meet" value={c.meetingPoint} onChange={(e) => set('meetingPoint', e.target.value)} /></div>
        <div><Label htmlFor="sh-sum">Resumen</Label><Textarea id="sh-sum" rows={2} value={c.summary} onChange={(e) => set('summary', e.target.value)} /></div>
        <div><Label htmlFor="sh-video">Vídeo (enlace de YouTube o Vimeo)</Label><Input id="sh-video" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={c.videoUrl ?? ''} onChange={(e) => set('videoUrl', e.target.value)} /></div>
        <div><Label htmlFor="sh-desc">Descripción detallada</Label><Textarea id="sh-desc" rows={5} value={c.description ?? ''} onChange={(e) => set('description', e.target.value)} /></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label htmlFor="sh-inc">Incluye (una por línea)</Label><Textarea id="sh-inc" rows={5} value={incRaw} onChange={(e) => { setIncRaw(e.target.value); set('includes', lines(e.target.value)); }} /></div>
          <div><Label htmlFor="sh-bring">Qué llevar</Label><Textarea id="sh-bring" rows={5} value={bringRaw} onChange={(e) => { setBringRaw(e.target.value); set('bring', lines(e.target.value)); }} /></div>
          <div><Label htmlFor="sh-req">Requisitos / características</Label><Textarea id="sh-req" rows={5} value={reqRaw} onChange={(e) => { setReqRaw(e.target.value); set('requirements', lines(e.target.value)); }} /></div>
        </div>
        <div><Label htmlFor="sh-notes">Notas para el cliente</Label><Textarea id="sh-notes" rows={3} value={c.notes} onChange={(e) => set('notes', e.target.value)} /></div>
        <fieldset className="space-y-3 border-t border-border pt-4">
          <legend className="font-heading font-semibold text-foreground">Normas y pasos a seguir</legend>
          <div><Label htmlFor="sh-rules">Normas (una por línea)</Label><Textarea id="sh-rules" rows={4} value={c.rules ?? ''} onChange={(e) => set('rules', e.target.value)} /></div>
          <div><Label htmlFor="sh-steps">Pasos a seguir (uno por línea)</Label><Textarea id="sh-steps" rows={4} value={c.steps ?? ''} onChange={(e) => set('steps', e.target.value)} /></div>
        </fieldset>
        <div><Label htmlFor="sh-photo">Foto</Label>
          <select id="sh-photo" className={sel} value={c.photo ?? ''} onChange={(e) => set('photo', e.target.value || null)}>
            <option value="">Sin foto</option>
            {ownPhotos.map((p, i) => <option key={p} value={`${STORAGE_PHOTO}${p}`}>Foto propia {i + 1} del recorrido</option>)}
            {uploaded.map((p, i) => <option key={p} value={`${STORAGE_PHOTO}${p}`}>Foto subida {i + 1}</option>)}
            {c.photo?.startsWith(STORAGE_PHOTO) && !ownPhotos.includes(c.photo.slice(STORAGE_PHOTO.length)) && !uploaded.includes(c.photo.slice(STORAGE_PHOTO.length)) && <option value={c.photo}>Foto subida guardada</option>}
            {sheetPhotoOptions.map((p) => <option key={p.key} value={p.key}>{p.alt} ({p.licencia})</option>)}
          </select>
          <div className="mt-2 flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}><ImagePlus className="mr-1 h-4 w-4" />Subir foto desde el PC</Button>
            <input ref={fileRef} type="file" accept={IMG_TYPES.join(',')} className="hidden" onChange={(e) => uploadPhoto(e.target.files)} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Fotos propias del recorrido (catálogo), fotos subidas por ti o fotos de uso libre, que se muestran como ilustrativas.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="sh-email">Email del cliente</Label><Input id="sh-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor="sh-phone">WhatsApp del cliente</Label><Input id="sh-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        {errors.length > 0 && <p role="alert" className="text-sm text-destructive">{errors.join(' · ')}</p>}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="outline" disabled={busy} onClick={() => save()}><Save className="mr-1 h-4 w-4" />Guardar borrador</Button>
          <Button variant="outline" disabled={busy || state === 'desactivada'} onClick={copy}><Copy className="mr-1 h-4 w-4" />Copiar enlace</Button>
          <Button variant="hero" disabled={busy || state === 'desactivada'} onClick={sendEmail}><Mail className="mr-1 h-4 w-4" />Enviar por email</Button>
          <Button variant="outline" disabled={busy || state === 'desactivada'} onClick={whatsapp}><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</Button>
          {row && state !== 'desactivada' && <Button variant="ghost" disabled={busy} onClick={disable}><Link2Off className="mr-1 h-4 w-4" />Desactivar enlace</Button>}
          {row && row.status !== 'borrador' && <Button variant="ghost" asChild><a href={link} target="_blank" rel="noopener noreferrer"><Eye className="mr-1 h-4 w-4" />Abrir</a></Button>}
          {row && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" disabled={busy} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="mr-1 h-4 w-4" />Eliminar</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar esta ficha definitivamente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se borrará «{c.title || 'Sin título'}» y su enlace dejará de funcionar. No se puede deshacer.
                    {row.accepted_at && row.booking_id ? ' Esta ficha fue aceptada y tiene una reserva vinculada: elimina primero la reserva desde «Reservas».' : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction disabled={busy} onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa del cliente</p>
        <SheetView c={c} />
      </div>
    </div>
  );
}

/** Constructor de fichas privadas de actividad con enlace único. */
export function ActivitySheetsPanel({ contacts, catalog, focusSheetId, onOpenBooking, prefill, catalogStart }: { catalogStart?: CatalogOutingStart | null; prefill?: SheetRequestPrefill | null; contacts: SheetContact[]; catalog: CatalogItem[]; focusSheetId?: string | null; onOpenBooking?: (bookingId: string) => void }) {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [selected, setSelected] = useState<string | 'new' | null>(focusSheetId ?? null);
  useEffect(() => { if (focusSheetId) setSelected(focusSheetId); }, [focusSheetId]);
  const load = useCallback(async () => {
    const { data } = await supabase.from('activity_sheets').select('*').order('updated_at', { ascending: false });
    setRows((data ?? []) as unknown as SheetRow[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const current = useMemo(() => rows.find((r) => r.id === selected) ?? null, [rows, selected]);
  const name = (id: string | null) => contacts.find((c) => c.id === id)?.nombre;
  const [newKey, setNewKey] = useState(0);
  useEffect(() => { if (prefill) { setFromItem(null); setSelected('new'); setNewKey((k) => k + 1); } }, [prefill]);
  const [fromItem, setFromItem] = useState<CatalogItem | null>(null);
  useEffect(() => { if (catalogStart?.mode === 'privado') { setFromItem(catalogStart.item); setSelected('new'); setNewKey((k) => k + 1); } }, [catalogStart]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="hero" onClick={() => { setFromItem(null); setSelected('new'); setNewKey((k) => k + 1); }}><Plus className="mr-1 h-4 w-4" />Nueva ficha</Button>
        <p className="text-sm text-muted-foreground">{rows.length} {rows.length === 1 ? 'ficha' : 'fichas'}</p>
      </div>
      {rows.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => setSelected(r.id)} aria-current={selected === r.id || undefined}
                className={`w-full rounded-lg border p-3 text-left transition-all duration-300 active:scale-95 ${selected === r.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
                <div className="flex items-center justify-between gap-2"><span className="truncate font-semibold text-foreground">{r.content?.title || 'Sin título'}</span><Badge variant={r.booking_id ? 'default' : 'outline'}>{r.booking_id ? 'Con reserva' : STATE_LABEL[sheetState(r)]}</Badge></div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{name(r.contact_id) ?? r.content?.customerName ?? 'Sin cliente'}{r.content?.date ? ` · ${r.content.date}` : ''}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected === 'new' && <Editor key={`new-${newKey}`} row={null} fromItem={fromItem} prefill={fromItem ? null : prefill} contacts={contacts} catalog={catalog} onSaved={async (id) => { await load(); setSelected(id); }} onDeleted={async () => { await load(); setSelected(null); }} />}
      {current && <Editor key={current.id} row={current} contacts={contacts} catalog={catalog} onOpenBooking={onOpenBooking} onSaved={async () => { await load(); }} onDeleted={async () => { await load(); setSelected(null); }} />}
      {!selected && rows.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aún no hay fichas. Crea una y envía el enlace al cliente.</p>}
    </div>
  );
}
