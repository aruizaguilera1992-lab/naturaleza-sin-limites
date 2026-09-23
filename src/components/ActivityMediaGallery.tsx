import { useState } from 'react';
import { ExternalLink, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { YoutubeLitePlayer } from '@/components/YoutubeLitePlayer';
import type { ActivityMediaCollection } from '@/data/activityMedia';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  media: ActivityMediaCollection;
}

export function ActivityMediaGallery({ title, media }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const images = media.images;

  return (
    <section aria-labelledby="galeria-actividad">
      <div className="mb-5 flex items-center gap-2">
        <Images className="h-5 w-5 text-primary" />
        <h2 id="galeria-actividad" className="font-heading text-2xl font-bold text-foreground">Fotos y vídeo</h2>
      </div>

      <div className={cn('grid gap-2 overflow-hidden rounded-md', images.length > 1 && 'sm:grid-cols-2', images.length > 2 && 'sm:grid-rows-2')}>
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image.src}-${index}`}
            onClick={() => setSelected(index)}
            className={cn('group relative min-h-56 overflow-hidden bg-muted text-left', images.length > 2 && index === 0 && 'sm:row-span-2 sm:min-h-[460px]', images.length > 2 && index > 0 && 'sm:min-h-0')}
            aria-label={`Ampliar imagen ${index + 1} de ${title}`}
          >
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 right-3 rounded-sm bg-background/85 px-2 py-1 text-xs text-foreground backdrop-blur-sm">{index + 1}/{images.length}</span>
          </button>
        ))}
      </div>

      {media.videos.map((video) => <div key={video.youtubeId} className="mt-5"><YoutubeLitePlayer video={video} /></div>)}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-border p-3 sm:p-5">
          {selected !== null && images[selected] ? (
            <>
              <DialogTitle className="pr-8">{title}</DialogTitle>
              <DialogDescription className="sr-only">Imagen ampliada de la actividad</DialogDescription>
              <img src={images[selected].src} alt={images[selected].alt} className="max-h-[70vh] w-full rounded-md object-contain" />
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{images[selected].license}</span>
                <Button variant="ghost" size="sm" asChild>
                  <a href={images[selected].sourceUrl} target="_blank" rel="noopener noreferrer">Fuente <ExternalLink className="ml-2 h-3 w-3" /></a>
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
