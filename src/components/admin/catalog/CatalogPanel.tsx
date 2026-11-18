import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ImagePlus, Lock, Plus, Users, RotateCcw, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { safeVideoEmbed } from '@/lib/safeVideo';
import type { OutingMode } from '@/lib/catalogOuting';
import { ActivityFieldsEditor } from '@/components/admin/shared/ActivityFieldsEditor';
import { blankItemData, CATALOG_BUCKET, newCustomKey, useAdminCatalog, usePhotoUrls, type CatalogDiscipline, type CatalogItem, type CatalogItemData } from '@/lib/adminCatalog';

const DISC: Record<CatalogDiscipline, string> = { barranquismo: 'Barranquismo', ferratas: 'Vías ferratas', espeleologia: 'Espeleología' };
const sel = 'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function Thumb({ path }: { path: string }) {
  const urls = usePhotoUrls([path]);
  return urls[path] ? <img src={urls[path]} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />;
}

function ItemEditor({ item, onDone, onConfigure }: { item: CatalogItem; onDone: (removed?: boolean) => Promise<void>; onConfigure?: (item: CatalogItem, mode: OutingMode) => void }) {
  const { toast } = useToast();
  const [d, setD] = useState<CatalogItemData>(() => {
    const { key: _k, discipline: _d, photos: _p, edited: _e, custom: _c, reference: _r, sourceUrl: _s, sourceLabel: _l, ...rest } = item; return rest;
  });
  const [photos, setPhotos] = useState<string[]>(item.photos);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const set = <K extends keyof CatalogItemData>(k: K, v: CatalogItemData[K]) => setD((p) => ({ ...p, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      if (!IMG_TYPES.includes(f.type)) { toast({ title: `${f.name}: formato no admitido`, variant: 'destructive' }); continue; }
      if (f.size > 10 * 1024 * 1024) { toast({ title: `${f.name}: máximo 10 MB`, variant: 'destructive' }); continue; }
      const ext = f.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${item.key.replace(/[^a-z0-9-]/gi, '_')}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, f, { contentType: f.type });
      if (error) toast({ title: 'No se pudo subir la foto', description: error.message, variant: 'destructive' }); else added.push(path);
    }
    setPhotos((p) => [...p, ...added]);
    setBusy(false);
    if (file.current) file.current.value = '';
  };

  const save = async () => {
    if (!d.name.trim()) { toast({ title: 'Falta el nombre', variant: 'destructive' }); return; }
    if (d.videoUrl.trim() && !safeVideoEmbed(d.videoUrl)) {
      toast({ title: 'El enlace de vídeo no es válido', description: 'Solo se admiten enlaces de YouTube o Vimeo.', variant: 'destructive' }); return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('catalog_entries').upsert({ key: item.key, data: d as unknown as Json, photos, updated_by: u.user?.id ?? null });
    setBusy(false);
    if (error) toast({ title: 'No se pudo guardar', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Ficha del catálogo guardada' }); await onDone(); }
  };

  const restore = async () => {
    if (!window.confirm(item.custom ? '¿Eliminar esta actividad del catálogo? Se borrarán también sus fotos.' : '¿Restaurar los datos originales? Se quitarán también las fotos subidas.')) return;
    setBusy(true);
    if (item.photos.length) await supabase.storage.from(CATALOG_BUCKET).remove(item.photos);
    await supabase.from('catalog_entries').delete().eq('key', item.key);
    setBusy(false); await onDone(item.custom);
  };

  const removePhoto = async (p: string) => {
    setPhotos((x) => x.filter((y) => y !== p));
    if (!item.photos.includes(p)) await supabase.storage.from(CATALOG_BUCKET).remove([p]);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{DISC[item.discipline]}</Badge>{item.edited && <Badge className="border-primary/40 bg-primary/15 text-primary">Editada</Badge>}{item.custom && <Badge className="border-primary/40 bg-primary/15 text-primary">Nueva</Badge>}
        {item.reference && <Badge variant="outline">Referencia documental · pendiente de revisar</Badge>}
        {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Ver fuente ({item.sourceLabel ?? 'RocJumper'})</a>}</div>
      <section aria-labelledby="ph-title">
        <h3 id="ph-title" className="font-heading font-bold text-foreground">Fotografías</h3>
        <p className="text-xs text-muted-foreground">Sube fotos propias del recorrido. La primera es la portada.</p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
              <Thumb path={p} />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-background/85 px-1.5 text-[10px] font-semibold text-foreground">Portada</span>}
              <div className="absolute bottom-1 right-1 flex gap-1">
                {i > 0 && <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Usar como portada" onClick={() => setPhotos((x) => [p, ...x.filter((y) => y !== p)])}><ArrowUp /></Button>}
                <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Quitar foto" onClick={() => removePhoto(p)}><Trash2 /></Button>
              </div>
            </li>
          ))}
          <li>
            <button type="button" disabled={busy} onClick={() => file.current?.click()} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary active:scale-95">
              <ImagePlus className="h-5 w-5" />Subir fotos
            </button>
            <input ref={file} type="file" accept={IMG_TYPES.join(',')} multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </li>
        </ul>
      </section>
      <ActivityFieldsEditor id="ct" value={{ ...d, videoUrl: d.videoUrl ?? '', bring: d.bring ?? [], rules: d.rules ?? '', steps: d.steps ?? '' }} onChange={(f) => setD((p) => ({ ...p, ...f }))}>
        <div><Label htmlFor="ct-prov">Provincia</Label><Input id="ct-prov" value={d.province} onChange={(e) => set('province', e.target.value)} /></div>
        <div><Label htmlFor="ct-zone">Zona</Label><Input id="ct-zone" value={d.zone} onChange={(e) => set('zone', e.target.value)} /></div>
      </ActivityFieldsEditor>
      <p className="text-xs text-muted-foreground">Los cambios se aplican a las salidas nuevas; las ya creadas conservan sus datos.</p>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="hero" disabled={busy} onClick={save}><Save className="mr-1 h-4 w-4" />Guardar</Button>
        {onConfigure && <>
          <Button variant="outline" disabled={busy} onClick={() => onConfigure({ ...item, ...d, photos }, 'privado')}><Lock className="mr-1 h-4 w-4" />Crear salida privada</Button>
          {!item.reference && !item.custom && <Button variant="outline" disabled={busy} onClick={() => onConfigure({ ...item, ...d, photos }, 'abierto')}><Users className="mr-1 h-4 w-4" />Crear salida en grupo abierto</Button>}
        </>}
        {item.edited && <Button variant="ghost" disabled={busy} onClick={restore}><RotateCcw className="mr-1 h-4 w-4" />Restaurar original</Button>}
        {item.custom && <Button variant="ghost" disabled={busy} onClick={restore}><Trash2 className="mr-1 h-4 w-4" />Eliminar actividad</Button>}
      </div>
    </div>
  );
}

/** Catálogo original completo, editable al detalle (incluidas fotos propias). La web pública sigue mostrando niveles. */
export function CatalogPanel({ onConfigure }: { onConfigure?: (item: CatalogItem, mode: OutingMode) => void } = {}) {
  const { items, reload } = useAdminCatalog();
  const [disc, setDisc] = useState<CatalogDiscipline | 'todas'>('todas');
  const [q, setQ] = useState('');
  const [prov, setProv] = useState('todas');
  const provinces = useMemo(() => [...new Set(items.map((i) => i.province).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')), [items]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<CatalogItem | null>(null);
  const [newDisc, setNewDisc] = useState<CatalogDiscipline>('barranquismo');
  const startNew = () => setDraft({ ...blankItemData(), key: newCustomKey(newDisc), discipline: newDisc, photos: [], edited: false, custom: true });
  const list = useMemo(() => items.filter((i) => (disc === 'todas' || i.discipline === disc) && (prov === 'todas' || i.province === prov) && `${i.name} ${i.zone} ${i.province}`.toLowerCase().includes(q.toLowerCase())), [items, disc, q, prov]);
  const current = items.find((i) => i.key === selected) ?? (draft && items.find((i) => i.key === draft.key)) ?? draft;
  const back = () => { setSelected(null); setDraft(null); };
  if (current) return (
    <div className="space-y-3">
      <Button variant="ghost" onClick={back}><ArrowLeft className="mr-1 h-4 w-4" />Volver al catálogo</Button>
      <ItemEditor key={current.key} item={current} onConfigure={onConfigure}
        onDone={async (removed) => { await reload(); if (removed) back(); else if (draft) { setSelected(draft.key); setDraft(null); } }} />
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['todas', 'barranquismo', 'ferratas', 'espeleologia'] as const).map((d) => (
          <Button key={d} size="sm" variant={disc === d ? 'hero' : 'outline'} onClick={() => setDisc(d)}>{d === 'todas' ? 'Todas' : DISC[d]}</Button>
        ))}
        <Input aria-label="Buscar en el catálogo" placeholder="Buscar por nombre o zona" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select aria-label="Filtrar por provincia" className={`${sel} w-auto`} value={prov} onChange={(e) => setProv(e.target.value)}>
          <option value="todas">Todas las provincias</option>{provinces.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-3">
        <select aria-label="Disciplina de la nueva actividad" className={`${sel} w-auto`} value={newDisc} onChange={(e) => setNewDisc(e.target.value as CatalogDiscipline)}>
          {(Object.keys(DISC) as CatalogDiscipline[]).map((d) => <option key={d} value={d}>{DISC[d]}</option>)}
        </select>
        <Button variant="hero" size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" />Añadir actividad</Button>
      </div>
      <p className="text-xs text-muted-foreground">{list.length} recorridos</p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((i) => (
          <li key={i.key}>
            <button type="button" onClick={() => setSelected(i.key)} className="flex w-full gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all duration-300 hover:border-primary/50 active:scale-95">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md">{i.photos[0] ? <Thumb path={i.photos[0]} /> : <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">Sin foto</div>}</div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{i.name}</p>
                <p className="truncate text-xs text-muted-foreground">{DISC[i.discipline]} · {i.levelLabel}{i.grade ? ` · ${i.grade}` : ''}</p>
                <p className="truncate text-xs text-muted-foreground">{i.zone}, {i.province}{i.edited ? ' · editada' : ''}</p>
                {i.reference && <Badge variant="outline" className="mt-1 text-[10px]">Referencia · pendiente de revisar</Badge>}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
