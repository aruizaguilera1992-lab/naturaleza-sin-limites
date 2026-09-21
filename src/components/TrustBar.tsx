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
    title: 'Guía TD2',
    description: 'Formación técnica en progresión vertical.',
  },
  {
    icon: Users,
    title: 'Máx. 6 personas',
    description: 'Ritmo adaptado y atención directa.',
  },
  {
    icon: Wrench,
    title: 'Material homologado',
    description: 'Equipo técnico revisado antes de cada salida.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro accidentes + RC',
    description: 'Cobertura incluida durante la actividad.',
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
      className={cn('border-y border-border bg-secondary/40', className)}
    >
      <div className="container mx-auto grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {trustItems.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3 bg-secondary px-4 py-5 sm:px-6 lg:py-6">
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold uppercase text-foreground sm:text-sm">{title}</p>
              <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
