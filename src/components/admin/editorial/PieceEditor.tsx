import { useEffect, useState } from 'react';
import { Save, Eye, ArrowLeft, Send, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BlogArticleContent } from '@/components/blog/BlogArticleContent';
import { categoryLabels, type BlogCategory } from '@/data/blogPosts';
import { pieceToPost, validatePiece, type EditorialPiece, type PublicationStatus } from '@/lib/editorial';
import { supabase } from '@/integrations/supabase/client';

interface Props { initial: EditorialPiece; onSaved: (id: string) => Promise<void>; onClose: () => void }

export function PieceEditor({ initial, onSaved, onClose }: Props) {
  const [piece, setPiece] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dirty = JSON.stringify(piece) !== JSON.stringify(initial);
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);
  const update = <K extends keyof EditorialPiece>(key: K, value: EditorialPiece[K]) => setPiece(old => ({ ...old, [key]: value }));
  const close = () => { if (!dirty || window.confirm('¿Salir sin guardar los cambios?')) onClose(); };
  const save = async (status: PublicationStatus) => {
    const validation = validatePiece(piece, status === 'publicado');
    if (validation) { setError(validation); return; }
    if (status === 'publicado' && !window.confirm('¿Publicar este artículo en el blog?')) return;
    if (status === 'retirado' && !window.confirm('¿Retirar este artículo del blog?')) return;
    setSaving(true); setError('');
    try {
      const { data, error: failure } = await supabase.rpc('save_editorial_piece', {
        _piece: JSON.parse(JSON.stringify(piece)), _status: status,
        _expected_updated_at: initial.updated_at ?? undefined,
      });
      if (failure) throw failure;
      if (!data) throw new Error('No se pudo guardar el artículo.');
      await onSaved(data);
    } catch (failure) { setError(failure instanceof Error ? failure.message : String((failure as { message?: string }).message ?? 'No se pudo guardar.')); }
    finally { setSaving(false); }
  };
  const field = (key: 'title' | 'slug' | 'featured_image' | 'author_name' | 'meta_title', label: string, disabled = false) => (
    <div className="space-y-2"><Label htmlFor={`piece-${key}`}>{label}</Label><Input id={`piece-${key}`} value={piece[key]} disabled={disabled || saving} onChange={e => update(key, e.target.value)} className="bg-background text-foreground" /></div>
  );
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <Button variant="ghost" onClick={close} disabled={saving}><ArrowLeft className="mr-2 h-4 w-4" />Artículos</Button>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="text-sm text-muted-foreground">Cambios sin guardar</span>}
          <Button variant="outline" disabled={saving} onClick={() => save(initial.status === 'publicado' ? 'publicado' : 'borrador')}><Save className="mr-2 h-4 w-4" />{saving ? 'Guardando…' : 'Guardar'}</Button>
          {initial.status !== 'publicado' && <Button disabled={saving} onClick={() => save('publicado')}><Send className="mr-2 h-4 w-4" />Publicar artículo</Button>}
          {initial.status === 'publicado' && <Button variant="outline" disabled={saving} onClick={() => save('retirado')}><Archive className="mr-2 h-4 w-4" />Retirar</Button>}
        </div>
      </div>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <Tabs defaultValue="edit">
        <TabsList><TabsTrigger value="edit">Artículo</TabsTrigger><TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Vista previa</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger></TabsList>
        <TabsContent value="edit" forceMount className="space-y-5 pt-4 data-[state=inactive]:hidden">
          {field('title', 'Título')}
          <div className="grid gap-5 md:grid-cols-2">
            {field('slug', 'Dirección /blog/', Boolean(initial.published_at))}
            <div className="space-y-2"><Label htmlFor="piece-category">Categoría</Label><Select value={piece.category} onValueChange={value => update('category', value as BlogCategory)}><SelectTrigger id="piece-category"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categoryLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="piece-excerpt">Extracto</Label><Textarea id="piece-excerpt" value={piece.excerpt} onChange={e => update('excerpt', e.target.value)} /></div>
          {field('featured_image', 'Dirección de la fotografía')}
          {piece.featured_image && /^(https:\/\/|\/images\/)/.test(piece.featured_image) && <img src={piece.featured_image} alt={piece.title} className="aspect-video w-full max-w-md rounded-lg object-cover" />}
          <div className="space-y-2"><Label htmlFor="piece-content">Contenido (Markdown)</Label><Textarea id="piece-content" value={piece.content} onChange={e => update('content', e.target.value)} className="min-h-80 bg-background font-mono text-foreground" /></div>
          <div className="grid gap-5 md:grid-cols-2">{field('author_name', 'Autor')}<div className="space-y-2"><Label htmlFor="piece-tags">Etiquetas</Label><Input id="piece-tags" value={piece.tags.join(', ')} onChange={e => update('tags', e.target.value.split(',').map(tag => tag.trim()))} /></div></div>
          <div className="space-y-2"><Label htmlFor="piece-bio">Biografía del autor</Label><Textarea id="piece-bio" value={piece.author_bio} onChange={e => update('author_bio', e.target.value)} /></div>
        </TabsContent>
        <TabsContent value="preview" forceMount className="pt-6 data-[state=inactive]:hidden">
          <h2 className="break-words font-heading text-3xl font-bold">{piece.title}</h2><p className="mt-3 text-muted-foreground">{piece.excerpt}</p>
          {piece.featured_image && <img src={piece.featured_image} alt={piece.title} className="mt-6 aspect-video w-full rounded-lg object-cover" />}
          <BlogArticleContent post={pieceToPost(piece)} preview />
        </TabsContent>
        <TabsContent value="seo" forceMount className="space-y-5 pt-4 data-[state=inactive]:hidden">
          {field('meta_title', 'Título SEO')}<p className="text-sm text-muted-foreground">{piece.meta_title.length} / 60 caracteres</p>
          <div className="space-y-2"><Label htmlFor="piece-description">Descripción SEO</Label><Textarea id="piece-description" value={piece.meta_description} onChange={e => update('meta_description', e.target.value)} /><p className="text-sm text-muted-foreground">{piece.meta_description.length} / 160 caracteres</p></div>
          <div className="border-l-2 border-primary pl-4"><p className="text-sm text-muted-foreground">naturalezasinlimites.es/blog/{piece.slug}</p><p className="mt-2 text-xl font-semibold text-primary break-words">{piece.meta_title}</p><p className="mt-1 break-words text-muted-foreground">{piece.meta_description}</p></div>
        </TabsContent>
      </Tabs>
    </section>
  );
}