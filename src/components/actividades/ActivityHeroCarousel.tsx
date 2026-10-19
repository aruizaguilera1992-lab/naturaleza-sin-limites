import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Images, Maximize2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { YoutubeLitePlayer } from '@/components/YoutubeLitePlayer';
import type { ActivityMediaCollection } from '@/data/activityMedia';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  media: ActivityMediaCollection;
  fallbackSrc?: string;
}

type Slide =
  | { kind: 'video'; video: ActivityMediaCollection['videos'][number] }
  | { kind: 'image'; image: ActivityMediaCollection['images'][number] };

/**
 * Galería editorial de la ficha: fotografía principal grande y, cuando existen,
 * miniaturas secundarias (el vídeo se muestra como miniatura y solo se reproduce
 * bajo demanda dentro del visor a pantalla completa).
 */
export function ActivityHeroCarousel({ title, media, fallbackSrc }: Props) {
  // Fotografías primero; los vídeos van al final como miniaturas.
  const slides: Slide[] = [
    ...media.images.map((image) => ({ kind: 'image' as const, image })),
    ...media.videos.map((video) => ({ kind: 'video' as const, video })),
  ];
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const total = slides.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + total) % total), [total]);
  const openAt = useCallback((i: number) => { setIndex(i); setFullscreen(true); }, []);

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
  const main = slides[0];
  const secondary = slides.slice(1, 3);

  const renderImage = (image: ActivityMediaCollection['images'][number], className: string, eager = false) => (
    <img
      src={image.src}
      alt={image.alt}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onError={(e) => { if (fallbackSrc && !e.currentTarget.src.endsWith(fallbackSrc)) e.currentTarget.src = fallbackSrc; }}
      fetchPriority={eager ? 'high' : undefined}
      className={className}
    />
  );

  const renderSlide = (slide: Slide, large = false) =>
    slide.kind === 'video' ? (
      <div className={cn('flex h-full w-full items-center justify-center bg-background', large && 'max-h-[80vh]')}>
        <div className="w-full max-w-5xl"><YoutubeLitePlayer video={slide.video} /></div>
      </div>
    ) : (
      renderImage(slide.image, cn('h-full w-full', large ? 'max-h-[80vh] object-contain' : 'object-cover'), !large)
    );

  /** Miniatura: las fotos se ven directas; el vídeo muestra su thumbnail con botón de play. */
  const renderThumb = (slide: Slide, i: number, className: string) => (
    <button
      key={i}
      type="button"
      onClick={() => openAt(i)}
      aria-label={slide.kind === 'video' ? `Ver vídeo de ${title}` : `Ver foto ${i + 1} de ${title}`}
      className={cn('group relative block overflow-hidden bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', className)}
    >
      {slide.kind === 'video' ? (
        <>
          <img src={slide.video.thumbnail} alt="" aria-hidden loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute inset-0 flex items-center justify-center bg-background/40 transition-colors duration-300 group-hover:bg-background/25">
            <PlayCircle className="h-12 w-12 text-primary-foreground drop-shadow-lg" />
          </span>
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            <PlayCircle className="h-3.5 w-3.5" /> Vídeo
          </span>
        </>
      ) : (
        renderImage(slide.image, 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105')
      )}
    </button>
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
      {/* Móvil: una imagen 4:3 con acceso a la galería */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-card lg:hidden">
        {renderThumb(main, 0, 'h-full w-full')}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 right-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/85 px-4 text-sm font-semibold text-foreground backdrop-blur transition-all duration-300 hover:text-primary active:scale-95"
        >
          <Images className="h-4 w-4" /> Ver galería · {total}
        </button>
      </div>

      {/* Escritorio: galería editorial con imagen principal y secundarias */}
      <div className="container mx-auto hidden px-4 lg:block">
        <div className={cn('grid gap-3', secondary.length > 0 ? 'grid-cols-[2fr_1fr]' : 'grid-cols-1')}>
          <div className="relative overflow-hidden rounded-lg">
            {renderThumb(main, 0, 'h-[52vh] min-h-[360px] w-full rounded-lg')}
            <button
              type="button"
              onClick={() => openAt(0)}
              aria-label="Ver a pantalla completa"
              className="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/85 text-foreground backdrop-blur transition-all duration-300 hover:text-primary active:scale-95"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
          {secondary.length > 0 && (
            <div className={cn('grid gap-3', secondary.length > 1 ? 'grid-rows-2' : 'grid-rows-1')}>
              {secondary.map((slide, i) => renderThumb(slide, i + 1, 'h-full min-h-[176px] w-full rounded-lg'))}
            </div>
          )}
        </div>
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
