import { Award, ShieldCheck, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Señales de confianza verificables. Solo se incluyen afirmaciones que el
 * propio proyecto ya respalda (titulación TD2 del guía, grupos de máximo 6,
 * material homologado y seguros de la actividad).
 *
 * IMPORTANTE: no añadir aquí números de registro de turismo activo, número
 * de póliza ni aseguradora mientras no exista el dato verificado.
 */
export const trustItems = [
  {
    icon: Award,
    title: 'Guía con titulación TD2',
    description: 'Técnico deportivo con formación específica en progresión vertical.',
  },
  {
    icon: Users,
    title: 'Grupos de máximo 6 personas',
    description: 'Atención personalizada y margen real para adaptar el ritmo.',
  },
  {
    icon: Wrench,
    title: 'Material homologado',
    description: 'Equipo técnico revisado antes de cada salida.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro de accidentes y RC',
    description: 'Cobertura de accidentes y responsabilidad civil en la actividad.',
  },
];

interface TrustBarProps {
  className?: string;
  /** `compact` para barras laterales o pasos de reserva. */
  variant?: 'section' | 'compact';
}

export function TrustBar({ className, variant = 'section' }: TrustBarProps) {
  if (variant === 'compact') {
    return (
      <ul className={cn('space-y-2 text-sm text-muted-foreground', className)}>
        {trustItems.map(({ icon: Icon, title }) => (
          <li key={title} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{title}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-label="Garantías de seguridad"
      className={cn('border-y border-border bg-card/60', className)}
    >
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
        {trustItems.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-sm font-bold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
