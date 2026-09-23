import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/context/CookieConsentContext';
import type { YoutubeVideo } from '@/data/youtubeVideos';

interface Props {
  video: YoutubeVideo;
  compact?: boolean;
}

export function YoutubeLitePlayer({ video, compact = false }: Props) {
  const [playing, setPlaying] = useState(false);
  const { consent, openPreferences } = useCookieConsent();
  const thumbnail = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

  if (playing && consent.marketing) {
    return (
      <div className="aspect-video overflow-hidden rounded-md bg-muted">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="group relative aspect-video overflow-hidden bg-muted">
        <img src={thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-background/25" />
        <Button
          type="button"
          size="icon"
          variant="hero"
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
          onClick={() => consent.marketing ? setPlaying(true) : openPreferences()}
          aria-label={consent.marketing ? `Reproducir ${video.title}` : 'Configurar cookies para reproducir el vídeo'}
        >
          <Play className="h-6 w-6 fill-current" />
        </Button>
      </div>
      <div className={compact ? 'p-3' : 'p-4'}>
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{video.title}</h3>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">{video.channel}</span>
          <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            Ver en YouTube <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
