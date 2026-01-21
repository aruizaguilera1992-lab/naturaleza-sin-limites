import { Clock, Ruler, Mountain, TrendingUp, TrendingDown, Footprints, Users, Calendar, Compass, ShieldCheck, CalendarCheck } from 'lucide-react';
import type { Ferrata } from '@/data/ferratas';

interface FerrataTechnicalSheetProps {
  ferrata: Ferrata;
}

export function FerrataTechnicalSheet({ ferrata }: FerrataTechnicalSheetProps) {
  const dataItems = [
    { icon: Clock, label: 'Duración', value: ferrata.duracion },
    { icon: Ruler, label: 'Desarrollo', value: ferrata.desarrollo },
    { icon: TrendingUp, label: 'Desnivel', value: ferrata.desnivel },
    { icon: Mountain, label: 'Altura máxima', value: ferrata.alturaMaxima },
    { icon: Compass, label: 'Clasificación', value: `${ferrata.clasificacion} (${ferrata.dificultad})` },
    { icon: TrendingDown, label: 'Exposición', value: ferrata.exposicion },
    { icon: Footprints, label: 'Aproximación', value: ferrata.aproximacion },
    { icon: Users, label: 'Grupo', value: `${ferrata.grupoMinimo}-${ferrata.grupoMaximo} personas` },
    { icon: Calendar, label: 'Mejor época', value: ferrata.mejorEpoca },
    { icon: ShieldCheck, label: 'Material incluido', value: ferrata.materialIncluido ? 'Sí, completo' : 'No incluido' },
    { icon: CalendarCheck, label: 'Reserva', value: ferrata.reservaObligatoria ? 'Obligatoria' : 'Recomendada' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {dataItems.map((item, index) => (
        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-muted-foreground block">{item.label}</span>
            <span className="text-sm font-medium text-foreground">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
