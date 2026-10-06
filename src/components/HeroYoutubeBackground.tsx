import { useEffect, useRef, useState } from 'react';
import { officialYoutubeVideos } from '@/data/youtubeVideos';

/**
 * Fondo de vídeo de YouTube (canal oficial) para los hero.
 * Elige un vídeo aleatorio en cada visita, arranca en su segundo destacado
 * (heroStart, por defecto 60) y solo se muestra cuando YouTube informa de
 * que está reproduciéndose. Contenedor transparente: la capa inferior
 * (imagen) queda visible hasta que el vídeo empieza.
 * No renderiza nada con prefers-reduced-motion.
 */
export function HeroYoutubeBackground() {
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [youtubeVideo] = useState(
    () => officialYoutubeVideos[Math.floor(Math.random() * officialYoutubeVideos.length)]
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Muestra el vídeo solo cuando YouTube informa de que está reproduciéndose.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(event.origin || 'http://x').hostname)) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.info?.playerState === 1 || (data?.event === 'onStateChange' && data?.info === 1)) setVideoPlaying(true);
      } catch { /* ignorar */ }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(motionPreference.matches);
    motionPreference.addEventListener('change', updatePreference);
    return () => motionPreference.removeEventListener('change', updatePreference);
  }, []);

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <iframe
        ref={iframeRef}
        title={youtubeVideo.title}
        onLoad={() => iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*')}
        src={`https://www.youtube-nocookie.com/embed/${youtubeVideo.youtubeId}?autoplay=1&mute=1&start=${youtubeVideo.heroStart ?? 60}&loop=1&playlist=${youtubeVideo.youtubeId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1`}
        allow="autoplay; encrypted-media; picture-in-picture"
        tabIndex={-1}
        className={`absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.15] border-0 transition-opacity duration-1000 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
