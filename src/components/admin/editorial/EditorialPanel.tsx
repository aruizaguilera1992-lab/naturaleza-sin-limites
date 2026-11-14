import { useCallback, useEffect, useState } from 'react';
import { Plus, FileText, Pencil, ExternalLink, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts } from '@/data/blogPosts';
import { emptyPiece, type EditorialPiece } from '@/lib/editorial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PieceEditor } from './PieceEditor';
import { NewsletterPanel } from './NewsletterPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function EditorialPanel() {
  const [pieces, setPieces] = useState<EditorialPiece[]>([]);
  const [selected, setSelected] = useState<EditorialPiece | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const { data, error: failure } = await supabase.from('editorial_pieces').select('*, blog_publications(status, published_at)').order('updated_at', { ascending: false });
    setLoading(false);
    if (failure) { setError(failure.message); return null; }
    const rows = (data ?? []).map(row => ({ ...row, status: row.blog_publications?.status ?? 'borrador', published_at: row.blog_publications?.published_at ?? null })) as EditorialPiece[];
    setPieces(rows); return rows;
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (selected) return <PieceEditor key={`${selected.id ?? 'new'}-${selected.updated_at ?? ''}`} initial={selected} onClose={() => setSelected(null)} onSaved={async id => {
    const rows = await load();
    const saved = rows?.find(row => row.id === id);
    if (saved) setSelected(saved);
    await queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
  }} />;
  const filtered = pieces.filter(piece => (filter === 'all' || piece.status === filter) && `${piece.title} ${piece.slug}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <Tabs defaultValue="articles">
      <TabsList><TabsTrigger value="articles">Artículos</TabsTrigger><TabsTrigger value="newsletter">Newsletter</TabsTrigger></TabsList>
      <TabsContent value="newsletter" forceMount className="pt-4 data-[state=inactive]:hidden"><NewsletterPanel pieces={pieces} /></TabsContent>
      <TabsContent value="articles" forceMount className="pt-4 data-[state=inactive]:hidden"><section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1 max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar artículos" placeholder="Buscar artículos…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Button onClick={() => setSelected(emptyPiece())}><Plus className="mr-2 h-4 w-4" />Nuevo artículo</Button>
      </div>
      <div className="flex flex-wrap gap-2">{[['all','Todos'],['borrador','Borradores'],['publicado','Publicados'],['retirado','Retirados']].map(([value,label]) => <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>{label}</Button>)}</div>
      {error && <div role="alert" className="text-destructive">{error}<Button variant="link" onClick={() => load()}>Reintentar</Button></div>}
      {loading ? <p className="text-muted-foreground">Cargando artículos…</p> : !filtered.length ? <div className="flex items-center gap-3 border-y border-border py-10 text-muted-foreground"><FileText className="h-6 w-6" /><p>No hay artículos en esta selección.</p></div> : <div className="divide-y divide-border border-y border-border">{filtered.map(piece => <div key={piece.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0"><h2 className="break-words font-heading font-semibold">{piece.title || piece.slug}</h2><p className="mt-1 text-sm text-muted-foreground">/blog/{piece.slug}</p><Badge variant="outline" className="mt-2">{piece.status}</Badge></div><div className="flex gap-2"><Button variant="outline" onClick={() => setSelected(piece)}><Pencil className="mr-2 h-4 w-4" />Editar</Button>{piece.status === 'publicado' && <Button variant="ghost" asChild><a href={`/blog/${piece.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Ver</a></Button>}</div></div>)}</div>}
      <div className="pt-4"><h2 className="mb-4 font-heading text-lg font-semibold">Artículos existentes</h2><div className="divide-y divide-border">{blogPosts.map(post => <div key={post.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="break-words font-medium">{post.title}</p><p className="text-sm text-muted-foreground break-all">/blog/{post.slug}</p></div><Button variant="ghost" size="icon" asChild><a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" aria-label={`Ver ${post.title}`}><ExternalLink className="h-4 w-4" /></a></Button></div>)}</div></div>
    </section></TabsContent></Tabs>
  );
}