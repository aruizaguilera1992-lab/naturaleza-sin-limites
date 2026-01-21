import { Clock, Ruler, ArrowDown, Droplets, Sun, Users, Backpack, Car } from 'lucide-react';
import type { Barranco } from '@/data/barrancos';

interface CanyonTechnicalSheetProps {
  barranco: Barranco;
}

const caudalLabels: Record<string, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
};

const accesoLabels: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil',
};

export function CanyonTechnicalSheet({ barranco }: CanyonTechnicalSheetProps) {
  const technicalData = [
    {
      icon: Clock,
      label: 'Duración',
      value: barranco.duracion,
    },
    {
      icon: Ruler,
      label: 'Desnivel',
      value: barranco.desnivel,
    },
    {
      icon: ArrowDown,
      label: 'Rapel máximo',
      value: barranco.rapelMaximo,
    },
    {
      icon: Droplets,
      label: 'Caudal',
      value: caudalLabels[barranco.caudal],
    },
    {
      icon: Sun,
      label: 'Mejor época',
      value: barranco.mejorEpoca,
    },
    {
      icon: Users,
      label: 'Grupo mínimo',
      value: `${barranco.grupoMinimo} personas`,
    },
    {
      icon: Backpack,
      label: 'Material incluido',
      value: barranco.materialIncluido ? 'Sí' : 'No',
    },
    {
      icon: Car,
      label: 'Acceso',
      value: accesoLabels[barranco.acceso],
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
