import { Clock, Ruler, ArrowDown, Droplets, Sun, Users, Backpack, Car, Mountain } from 'lucide-react';
import type { Cueva } from '@/data/caves';

interface CaveTechnicalSheetProps {
  cueva: Cueva;
}

const estadoLabels: Record<string, string> = {
  seca: 'Seca',
  húmeda: 'Húmeda',
  acuática: 'Acuática',
};

const accesoLabels: Record<string, string> = {
  fácil: 'Fácil',
  medio: 'Medio',
  difícil: 'Difícil',
};

export function CaveTechnicalSheet({ cueva }: CaveTechnicalSheetProps) {
  const technicalData = [
    {
      icon: Clock,
      label: 'Duración',
      value: cueva.duracion,
    },
    {
      icon: Ruler,
      label: 'Desarrollo',
      value: cueva.desarrollo,
    },
    {
      icon: ArrowDown,
      label: 'Desnivel',
      value: cueva.desnivel,
    },
    {
      icon: Mountain,
      label: 'Vertical máx.',
      value: cueva.verticalMaxima,
    },
    {
      icon: Droplets,
      label: 'Estado',
      value: estadoLabels[cueva.estado],
    },
    {
      icon: Sun,
      label: 'Mejor época',
      value: cueva.mejorEpoca,
    },
    {
      icon: Users,
      label: 'Grupo mínimo',
      value: `${cueva.grupoMinimo} personas`,
    },
    {
      icon: Backpack,
      label: 'Material incluido',
      value: cueva.materialIncluido ? 'Sí' : 'No',
    },
    {
      icon: Car,
      label: 'Acceso',
      value: accesoLabels[cueva.acceso],
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
