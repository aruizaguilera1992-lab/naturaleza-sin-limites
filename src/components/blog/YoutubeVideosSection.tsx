import { ExternalLink } from 'lucide-react';
import { YoutubeLitePlayer } from '@/components/YoutubeLitePlayer';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { blogYoutubeVideos, OFFICIAL_YOUTUBE_CHANNEL } from '@/data/youtubeVideos';

export function YoutubeVideosSection() {
  return (
    <section className="border-y border-border bg-card py-10 sm:py-12" aria-labelledby="videos-heading">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{ align: 'start', containScroll: 'trimSnaps' }}
          className="w-full"
          aria-label="Vídeos de Naturaleza Sin Límites"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">Canal oficial</p>
              <h2 id="videos-heading" className="mt-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">Vídeos de Naturaleza Sin Límites</h2>
            </div>
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static h-9 w-9 translate-y-0" />
              <CarouselNext className="static h-9 w-9 translate-y-0" />
              <Button asChild variant="outline" size="sm">
                <a href={OFFICIAL_YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer">Ver canal en YouTube <ExternalLink className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
          <CarouselContent>
            {blogYoutubeVideos.map((video) => (
              <CarouselItem key={video.youtubeId} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <YoutubeLitePlayer video={video} compact />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
