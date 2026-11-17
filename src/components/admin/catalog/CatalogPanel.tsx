import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ImagePlus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CATALOG_BUCKET, useAdminCatalog, usePhotoUrls, type CatalogDiscipline, type CatalogItem, type CatalogItemData } from '@/lib/adminCatalog';

const DISC: Record<CatalogDiscipline, string> = { barranquismo: 'Barranquismo', ferratas: 'Vías ferratas', espeleologia: 'Espeleología' };
const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const sel = 'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function Thumb({ path }: { path: string }) {
  const urls = usePhotoUrls([path]);
  return urls[path] ? <img src={urls[path]} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />;
}

function ItemEditor({ item, onDone }: { item: CatalogItem; onDone: () => Promise<void> }) {
  const { toast } = useToast();
  const [d, setD] = useState<CatalogItemData>(() => {
    const { key: _k, discipline: _d, photos: _p, edited: _e, ...rest } = item; return rest;
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
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('catalog_entries').upsert({ key: item.key, data: d as unknown as Json, photos, updated_by: u.user?.id ?? null });
    setBusy(false);
    if (error) toast({ title: 'No se pudo guardar', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Ficha del catálogo guardada' }); await onDone(); }
  };

  const restore = async () => {
    if (!window.confirm('¿Restaurar los datos originales? Se quitarán también las fotos subidas.')) return;
    setBusy(true);
    if (item.photos.length) await supabase.storage.from(CATALOG_BUCKET).remove(item.photos);
    await supabase.from('catalog_entries').delete().eq('key', item.key);
    setBusy(false); await onDone();
  };

  const removePhoto = async (p: string) => {
    setPhotos((x) => x.filter((y) => y !== p));
    if (!item.photos.includes(p)) await supabase.storage.from(CATALOG_BUCKET).remove([p]);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{DISC[item.discipline]}</Badge>{item.edited && <Badge className="border-primary/40 bg-primary/15 text-primary">Editada</Badge>}
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="ct-name">Nombre</Label><Input id="ct-name" value={d.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div><Label htmlFor="ct-grade">Grado técnico</Label><Input id="ct-grade" value={d.grade} onChange={(e) => set('grade', e.target.value)} /></div>
        <div><Label htmlFor="ct-prov">Provincia</Label><Input id="ct-prov" value={d.province} onChange={(e) => set('province', e.target.value)} /></div>
        <div><Label htmlFor="ct-zone">Zona</Label><Input id="ct-zone" value={d.zone} onChange={(e) => set('zone', e.target.value)} /></div>
        <div><Label htmlFor="ct-level">Nivel</Label>
          <select id="ct-level" className={sel} value={d.level} onChange={(e) => { const n = Number(e.target.value); setD((p) => ({ ...p, level: n, levelLabel: ['Iniciación', 'Intermedio', 'Avanzado'][n - 1] })); }}>
            <option value={1}>Iniciación</option><option value={2}>Intermedio</option><option value={3}>Avanzado</option>
          </select></div>
        <div><Label htmlFor="ct-dur">Duración</Label><Input id="ct-dur" value={d.duration} onChange={(e) => set('duration', e.target.value)} /></div>
        <div><Label htmlFor="ct-price">Precio por persona (€)</Label><Input id="ct-price" type="number" min={0} value={d.pricePerPersonEuros ?? ''} placeholder="Vacío = a consultar" onChange={(e) => set('pricePerPersonEuros', e.target.value === '' ? null : Number(e.target.value))} /></div>
        <div><Label htmlFor="ct-age">Edad mínima</Label><Input id="ct-age" type="number" min={0} value={d.minAge} onChange={(e) => set('minAge', Number(e.target.value))} /></div>
        <div><Label htmlFor="ct-fit">Condición física</Label>
          <select id="ct-fit" className={sel} value={d.fitness} onChange={(e) => set('fitness', e.target.value)}><option>Básica</option><option>Media</option><option>Alta</option></select></div>
        <label className="flex items-center gap-2 pt-6 text-sm text-foreground"><input type="checkbox" checked={d.experience} onChange={(e) => set('experience', e.target.checked)} />Requiere experiencia previa</label>
      </div>
      <div><Label htmlFor="ct-sum">Resumen</Label><Textarea id="ct-sum" rows={2} value={d.summary} onChange={(e) => set('summary', e.target.value)} /></div>
      <div><Label htmlFor="ct-desc">Descripción detallada</Label><Textarea id="ct-desc" rows={5} value={d.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="ct-inc">Incluye (una por línea)</Label><Textarea id="ct-inc" rows={5} value={d.includes.join('\n')} onChange={(e) => set('includes', lines(e.target.value))} /></div>
        <div><Label htmlFor="ct-req">Requisitos / características</Label><Textarea id="ct-req" rows={5} value={d.requirements.join('\n')} onChange={(e) => set('requirements', lines(e.target.value))} /></div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="hero" disabled={busy} onClick={save}><Save className="mr-1 h-4 w-4" />Guardar</Button>
        {item.edited && <Button variant="ghost" disabled={busy} onClick={restore}><RotateCcw className="mr-1 h-4 w-4" />Restaurar original</Button>}
      </div>
    </div>
  );
}

/** Catálogo original completo, editable al detalle (incluidas fotos propias). La web pública sigue mostrando niveles. */
export function CatalogPanel() {
  const { items, reload } = useAdminCatalog();
  const [disc, setDisc] = useState<CatalogDiscipline | 'todas'>('todas');
  const [q, setQ] = useState('');
  const [prov, setProv] = useState('todas');
  const provinces = useMemo(() => [...new Set(items.map((i) => i.province).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')), [items]);
  const [selected, setSelected] = useState<string | null>(null);
  const list = useMemo(() => items.filter((i) => (disc === 'todas' || i.discipline === disc) && (prov === 'todas' || i.province === prov) && `${i.name} ${i.zone} ${i.province}`.toLowerCase().includes(q.toLowerCase())), [items, disc, q, prov]);
  const current = items.find((i) => i.key === selected);
  if (current) return (
    <div className="space-y-3">
      <Button variant="ghost" onClick={() => setSelected(null)}><ArrowLeft className="mr-1 h-4 w-4" />Volver al catálogo</Button>
      <ItemEditor key={current.key} item={current} onDone={reload} />
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
