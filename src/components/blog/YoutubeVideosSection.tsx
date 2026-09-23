import { ExternalLink } from 'lucide-react';
import { YoutubeLitePlayer } from '@/components/YoutubeLitePlayer';
import { Button } from '@/components/ui/button';
import { blogYoutubeVideos, OFFICIAL_YOUTUBE_CHANNEL } from '@/data/youtubeVideos';

export function YoutubeVideosSection() {
  return (
    <section className="border-y border-border bg-card py-12 sm:py-16" aria-labelledby="videos-heading">
      <div className="container mx-auto px-4">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Canal oficial</p>
            <h2 id="videos-heading" className="mt-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">Vídeos de Naturaleza Sin Límites</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={OFFICIAL_YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer">Ver canal en YouTube <ExternalLink className="ml-2 h-4 w-4" /></a>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogYoutubeVideos.map((video) => <YoutubeLitePlayer key={video.youtubeId} video={video} compact />)}
        </div>
      </div>
    </section>
  );
}
