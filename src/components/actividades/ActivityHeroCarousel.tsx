import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { YoutubeLitePlayer } from '@/components/YoutubeLitePlayer';
import type { ActivityMediaCollection } from '@/data/activityMedia';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  media: ActivityMediaCollection;
}

type Slide =
  | { kind: 'video'; video: ActivityMediaCollection['videos'][number] }
  | { kind: 'image'; image: ActivityMediaCollection['images'][number] };

/** Carrusel principal de la ficha: el vídeo (si existe) va primero. */
export function ActivityHeroCarousel({ title, media }: Props) {
  const slides: Slide[] = [
    ...media.videos.map((video) => ({ kind: 'video' as const, video })),
    ...media.images.map((image) => ({ kind: 'image' as const, image })),
  ];
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const total = slides.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + total) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!fullscreen) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, go]);

  if (total === 0) return null;
  const current = slides[index];

  const renderSlide = (slide: Slide, large = false) =>
    slide.kind === 'video' ? (
      <div className={cn('flex h-full w-full items-center justify-center bg-background', large && 'max-h-[80vh]')}>
        <div className="w-full max-w-5xl"><YoutubeLitePlayer video={slide.video} /></div>
      </div>
    ) : (
      <img
        src={slide.image.src}
        alt={slide.image.alt}
        decoding="async"
        fetchPriority={large ? undefined : 'high'}
        className={cn('h-full w-full', large ? 'max-h-[80vh] object-contain' : 'object-cover')}
      />
    );

  const arrows = total > 1 && (
    <>
      <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all duration-300 hover:border-primary hover:text-primary active:scale-95">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button type="button" onClick={() => go(1)} aria-label="Siguiente" className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all duration-300 hover:border-primary hover:text-primary active:scale-95">
        <ChevronRight className="h-6 w-6" />
      </button>
    </>
  );

  const dots = total > 1 && (
    <div className="flex justify-center gap-2" role="tablist" aria-label="Seleccionar foto o vídeo">
      {slides.map((s, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`${s.kind === 'video' ? 'Vídeo' : 'Foto'} ${i + 1} de ${total}`}
          onClick={() => setIndex(i)}
          className={cn('h-2.5 rounded-full transition-all duration-300', i === index ? 'w-8 bg-primary' : 'w-2.5 bg-foreground/40 hover:bg-foreground/70')}
        />
      ))}
    </div>
  );

  return (
    <section aria-label={`Fotos y vídeo de ${title}`} className="relative">
      <div className="relative h-[56vh] min-h-[320px] w-full overflow-hidden bg-card sm:h-[64vh] lg:h-[72vh]">
        {renderSlide(current)}
        {current.kind === 'image' && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />}
        {arrows}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {current.kind === 'video' && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"><PlayCircle className="h-4 w-4" /> Vídeo</span>}
          <span className="rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">{index + 1}/{total}</span>
          <button type="button" onClick={() => setFullscreen(true)} aria-label="Ver a pantalla completa" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all duration-300 hover:text-primary active:scale-95">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-4 z-10">{dots}</div>
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 bg-background p-3 sm:p-6">
          <DialogTitle className="pr-10">{title}</DialogTitle>
          <DialogDescription className="sr-only">Galería a pantalla completa</DialogDescription>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {renderSlide(current, true)}
            {arrows}
          </div>
          <div className="space-y-3">
            {dots}
            {current.kind === 'image' && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{current.image.license}</span>
                <Button variant="ghost" size="sm" asChild><a href={current.image.sourceUrl} target="_blank" rel="noopener noreferrer">Fuente <ExternalLink className="ml-2 h-3 w-3" /></a></Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
