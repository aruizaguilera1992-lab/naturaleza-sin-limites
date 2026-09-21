import { MapPin } from "lucide-react";

interface EventMapProps {
  latitude?: number | null;
  longitude?: number | null;
  zone: string;
  className?: string;
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/**
 * Mapa de ZONA APROXIMADA. Nunca muestra el punto de encuentro exacto:
 * ese dato se envía por email al confirmar la reserva.
 * Sin clave de Google Maps o sin coordenadas cargadas por el admin,
 * se muestra únicamente el nombre de la zona (no se inventan coordenadas).
 */
export function EventMap({ latitude, longitude, zone, className }: EventMapProps) {
  const hasPoint = typeof latitude === "number" && typeof longitude === "number";

  if (!apiKey || !hasPoint) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground ${className ?? ""}`}
      >
        <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>Zona aproximada: {zone}. Te enviamos el punto de encuentro exacto al confirmar.</span>
      </div>
    );
  }

  const center = `${latitude},${longitude}`;
  const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center}&zoom=11&maptype=roadmap`;

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-lg border border-border">
        <iframe
          title={`Zona aproximada de la salida en ${zone}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-48 w-full border-0"
          allowFullScreen
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Zona aproximada ({zone}). El punto de encuentro exacto se envía al confirmar la reserva.
      </p>
    </div>
  );
}
