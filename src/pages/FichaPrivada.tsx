import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { SheetView } from '@/components/admin/sheets/SheetView';
import type { SheetContent } from '@/lib/activitySheets';
import { AcceptProposal } from '@/components/sheets/AcceptProposal';

export default function FichaPrivada() {
  const { token = '' } = useParams();
  const [state, setState] = useState<'loading' | 'ok' | 'off'>('loading');
  const [content, setContent] = useState<SheetContent | null>(null);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.rpc('get_activity_sheet', { _token: token }).then(({ data, error }) => {
      if (!alive) return;
      const r = data as { available?: boolean; content?: SheetContent; accepted_at?: string | null } | null;
      if (error || !r?.available || !r.content) setState('off'); else { setContent(r.content); setAcceptedAt(r.accepted_at ?? null); setState('ok');
        if (r.content.photo?.startsWith('storage:')) void supabase.functions.invoke('activity-sheet-photo', { body: { token } }).then(({ data: p }) => { if (alive) setPhotoUrl((p as { url?: string | null } | null)?.url ?? null); }); }
    });
    return () => { alive = false; };
  }, [token]);
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Tu ficha de actividad | Naturaleza Sin Límites</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 pt-44 sm:pt-48 md:pt-32 lg:pt-40 pb-16">
        {state === 'loading' && <p className="text-muted-foreground">Cargando tu ficha…</p>}
        {state === 'ok' && content && <SheetView c={content} ownPhotoUrl={photoUrl} reference={token.slice(0, 8)} accept={<AcceptProposal token={token} defaultName={content.customerName} acceptedAt={acceptedAt} hasDate={Boolean(content.date)} onAccepted={setAcceptedAt} />} />}
        {state === 'off' && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-foreground">Este enlace ya no está disponible</h1>
            <p className="mt-2 text-muted-foreground">Puede haber caducado o haberse desactivado. Escríbenos y te enviamos uno nuevo.</p>
            <Button variant="hero" className="mt-5 min-h-11" asChild><a href="https://wa.me/34685609542" target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</a></Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
