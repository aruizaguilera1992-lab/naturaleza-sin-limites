import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { CATALOG_BUCKET } from '@/lib/adminCatalog';
import { LEVEL_LABELS, type ActivityFields } from '@/lib/activityFields';

const sel = 'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground';
const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMG_BYTES = 10 * 1024 * 1024;

/** Miniatura de una foto propia del almacén privado (el admin tiene lectura). */
function PhotoThumb({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    supabase.storage.from(CATALOG_BUCKET).createSignedUrl(path, 3600).then(({ data }) => { if (live) setUrl(data?.signedUrl ?? null); });
    return () => { live = false; };
  }, [path]);
  return url
    ? <img src={url} alt="Foto actual de la actividad" className="h-24 w-32 rounded-md object-cover" />
    : <div className="h-24 w-32 rounded-md bg-muted" aria-hidden />;
}

/**
 * Mismos campos, etiquetas y orden en Catálogo, Grupo abierto y Grupo privado.
 * Se monta con una key por registro: el texto en bruto de los listados conserva los saltos de línea al escribir.
 */
export function ActivityFieldsEditor({ id, value, onChange, showImage = true, children }: {
  id: string; value: ActivityFields; onChange: (next: ActivityFields) => void;
  /** El Catálogo ya tiene su gestor de varias fotos; allí se oculta este campo. */
  showImage?: boolean; children?: React.ReactNode;
}) {
  const [raw, setRaw] = useState(() => ({ includes: value.includes.join('\n'), bring: value.bring.join('\n'), requirements: value.requirements.join('\n'), highlights: value.highlights.join('\n') }));
  const [imgError, setImgError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ActivityFields>(k: K, v: ActivityFields[K]) => onChange({ ...value, [k]: v });
  const uploadImage = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!IMG_TYPES.includes(f.type)) { setImgError('Formato no admitido: usa JPG, PNG, WebP o AVIF.'); return; }
    if (f.size > MAX_IMG_BYTES) { setImgError('La imagen supera los 10 MB.'); return; }
    setImgError(null); setUploading(true);
    const ext = f.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `uploads/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, f, { contentType: f.type });
    setUploading(false);
    if (error) { setImgError(`No se pudo subir: ${error.message}`); return; }
    set('imagePath', path);
  };
  const list = (k: 'includes' | 'bring' | 'requirements' | 'highlights', label: string) => (
    <div><Label htmlFor={`${id}-${k}`}>{label}</Label>
      <Textarea id={`${id}-${k}`} rows={5} value={raw[k]} onChange={(e) => { setRaw((r) => ({ ...r, [k]: e.target.value })); set(k, lines(e.target.value)); }} /></div>
  );
  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 font-heading font-bold text-foreground">Ficha de la actividad</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor={`${id}-name`}>Nombre</Label><Input id={`${id}-name`} value={value.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div><Label htmlFor={`${id}-grade`}>Grado técnico</Label><Input id={`${id}-grade`} value={value.grade} onChange={(e) => set('grade', e.target.value)} /></div>
        <div><Label htmlFor={`${id}-level`}>Nivel</Label>
          <select id={`${id}-level`} className={sel} value={value.level} onChange={(e) => { const n = Number(e.target.value); onChange({ ...value, level: n, levelLabel: LEVEL_LABELS[n - 1] }); }}>
            {LEVEL_LABELS.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
          </select></div>
        <div><Label htmlFor={`${id}-dur`}>Duración</Label><Input id={`${id}-dur`} value={value.duration} placeholder="p. ej. 4 horas" onChange={(e) => set('duration', e.target.value)} /></div>
        <div><Label htmlFor={`${id}-price`}>Precio por persona (€)</Label><Input id={`${id}-price`} type="number" min={0} value={value.pricePerPersonEuros ?? ''} placeholder="Vacío = a consultar" onChange={(e) => set('pricePerPersonEuros', e.target.value === '' ? null : Number(e.target.value))} /></div>
        <div><Label htmlFor={`${id}-age`}>Edad mínima</Label><Input id={`${id}-age`} type="number" min={0} value={value.minAge} onChange={(e) => set('minAge', Number(e.target.value))} /></div>
        <div><Label htmlFor={`${id}-fit`}>Condición física</Label>
          <select id={`${id}-fit`} className={sel} value={value.fitness} onChange={(e) => set('fitness', e.target.value)}><option>Básica</option><option>Media</option><option>Alta</option></select></div>
        <label className="flex items-center gap-2 pt-6 text-sm text-foreground"><input type="checkbox" checked={value.experience} onChange={(e) => set('experience', e.target.checked)} />Requiere experiencia previa</label>
        {children}
      </div>
      <div><Label htmlFor={`${id}-sum`}>Resumen</Label><Textarea id={`${id}-sum`} rows={2} value={value.summary} onChange={(e) => set('summary', e.target.value)} /></div>
      <div><Label htmlFor={`${id}-video`}>Vídeo (enlace de YouTube o Vimeo)</Label><Input id={`${id}-video`} type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={value.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} /></div>
      {showImage && <div>
        <Label>Foto de la actividad</Label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          {value.imagePath ? <PhotoThumb path={value.imagePath} /> : <div className="flex h-24 w-32 items-center justify-center rounded-md bg-muted text-center text-[11px] text-muted-foreground">Sin foto propia</div>}
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
              <ImagePlus className="mr-1 h-4 w-4" />{uploading ? 'Subiendo…' : value.imagePath ? 'Cambiar imagen' : 'Subir desde el PC'}
            </Button>
            {value.imagePath && <Button type="button" variant="ghost" size="sm" onClick={() => set('imagePath', '')}><Trash2 className="mr-1 h-4 w-4" />Quitar</Button>}
          </div>
          <input ref={fileInput} type="file" accept={IMG_TYPES.join(',')} className="hidden" onChange={(e) => { void uploadImage(e.target.files); e.target.value = ''; }} />
        </div>
        {imgError && <p role="alert" className="mt-1 text-sm text-destructive">{imgError}</p>}
      </div>}
      <div><Label htmlFor={`${id}-desc`}>Descripción detallada</Label><Textarea id={`${id}-desc`} rows={5} value={value.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        {list('includes', 'Incluye (una por línea)')}
        {list('bring', 'Qué llevar (una por línea)')}
        {list('requirements', 'Requisitos / características')}
      </div>
      {list('highlights', 'Lo esencial: zona, nivel técnico, duración, temporada, rápeles… (una por línea; vacío = los de la ficha original)')}
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor={`${id}-rules`}>Normas (una por línea)</Label><Textarea id={`${id}-rules`} rows={4} value={value.rules} onChange={(e) => set('rules', e.target.value)} /></div>
        <div><Label htmlFor={`${id}-steps`}>Pasos a seguir (uno por línea)</Label><Textarea id={`${id}-steps`} rows={4} value={value.steps} onChange={(e) => set('steps', e.target.value)} /></div>
      </div>
    </fieldset>
  );
}
