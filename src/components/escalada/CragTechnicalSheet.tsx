import { Clock, Mountain, Compass, Ruler, Users, Backpack, Car, Sun, TrendingUp, Footprints } from 'lucide-react';
import type { Crag } from '@/data/crags';

interface CragTechnicalSheetProps {
  crag: Crag;
}

const accesoLabels: Record<string, string> = {
  fácil: 'Fácil',
  medio: 'Medio',
  difícil: 'Difícil',
};

export function CragTechnicalSheet({ crag }: CragTechnicalSheetProps) {
  const technicalData = [
    {
      icon: Clock,
      label: 'Duración',
      value: crag.duracion,
    },
    {
      icon: Mountain,
      label: 'Número de vías',
      value: `${crag.numeroVias} vías`,
    },
    {
      icon: TrendingUp,
      label: 'Grados disponibles',
      value: `${crag.gradoMinimo} - ${crag.gradoMaximo}`,
    },
    {
      icon: Compass,
      label: 'Orientación',
      value: crag.orientacion,
    },
    {
      icon: Ruler,
      label: 'Altura de vías',
      value: crag.altura,
    },
    {
      icon: Footprints,
      label: 'Aproximación',
      value: crag.aproximacion,
    },
    {
      icon: Sun,
      label: 'Mejor época',
      value: crag.mejorEpoca,
    },
    {
      icon: Users,
      label: 'Grupo mínimo',
      value: `${crag.grupoMinimo} personas`,
    },
    {
      icon: Backpack,
      label: 'Material incluido',
      value: crag.materialIncluido ? 'Sí' : 'No',
    },
    {
      icon: Car,
      label: 'Acceso',
      value: accesoLabels[crag.acceso],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {technicalData.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <item.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{item.label}</p>
            <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
