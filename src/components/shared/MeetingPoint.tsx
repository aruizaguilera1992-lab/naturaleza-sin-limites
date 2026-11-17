import { MapPin } from 'lucide-react';
import { appleMapsUrl, googleMapsUrl } from '@/lib/meetingPoint';

/** Punto de encuentro con enlaces interactivos a Google Maps y Apple Maps. */
export function MeetingPoint({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <p className="flex gap-2">
        <MapPin className="h-5 w-5 shrink-0 text-primary" />
        <span><span className="font-semibold">Punto de encuentro: </span>{text}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2 pl-7">
        <a
          href={googleMapsUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-all duration-300 active:scale-95"
        >
          <MapPin className="h-4 w-4" />Abrir en Google Maps
        </a>
        <a
          href={appleMapsUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold text-foreground transition-all duration-300 active:scale-95"
        >
          <MapPin className="h-4 w-4" />Abrir en Apple Maps
        </a>
      </div>
    </div>
  );
}
