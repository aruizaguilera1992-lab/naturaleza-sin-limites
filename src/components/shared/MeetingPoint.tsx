import { MapPin } from 'lucide-react';
import { appleMapsUrl, googleMapsUrl, textWithoutUrl, type MapsTarget } from '@/lib/meetingPoint';
import { useMeetingPointTarget } from '@/hooks/useMeetingPointTarget';

const BTN_G = 'inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-all duration-300 active:scale-95';
const BTN_A = 'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold text-foreground transition-all duration-300 active:scale-95';

/** Botones para abrir el punto de quedada en Google Maps o en Apple Maps. */
export function MeetingPointActions({ text, target, className = 'mt-3 flex flex-wrap gap-2' }: { text: string; target?: MapsTarget | null; className?: string }) {
  return (
    <div className={className}>
      <a href={googleMapsUrl(text)} target="_blank" rel="noopener noreferrer" className={BTN_G}>
        <MapPin className="h-4 w-4" />Abrir en Google Maps
      </a>
      <a href={appleMapsUrl(text, target)} target="_blank" rel="noopener noreferrer" className={BTN_A}>
        <MapPin className="h-4 w-4" />Abrir en Apple Maps
      </a>
    </div>
  );
}

/** Texto del punto de quedada sin la URL cruda, con el nombre real del sitio si se conoce. */
export function MeetingPointLabel({ text, target }: { text: string; target?: MapsTarget | null }) {
  const base = textWithoutUrl(text).replace(/\s*[:;,]\s*$/, '') || 'Punto de quedada';
  const name = target?.name && !base.toLowerCase().includes(target.name.toLowerCase()) ? target.name : null;
  return <span>{base}{name ? <span className="text-muted-foreground"> — {name}</span> : null}</span>;
}

/** Punto de encuentro con enlaces interactivos a Google Maps y Apple Maps. */
export function MeetingPoint({ text }: { text: string }) {
  const target = useMeetingPointTarget(text);
  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <p className="flex gap-2">
        <MapPin className="h-5 w-5 shrink-0 text-primary" />
        <span className="font-semibold">Punto de encuentro: </span>
        <span className="min-w-0 break-words"><MeetingPointLabel text={text} target={target} /></span>
      </p>
      <MeetingPointActions text={text} target={target} className="mt-3 flex flex-wrap gap-2 pl-7" />
    </div>
  );
}
