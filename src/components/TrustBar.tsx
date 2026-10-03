import { Link } from 'react-router-dom';
import { BadgeCheck, FileText, ShieldCheck, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FALLBACK_ACCIDENT_POLICY,
  FALLBACK_INSURER,
  FALLBACK_RC_POLICY,
  FALLBACK_TOURISM_REGISTRY,
  useBusinessSettings,
  type BusinessSettings,
} from '@/hooks/useBusinessSettings';

/**
 * Señales de confianza verificables. Solo se incluyen afirmaciones que el
 * propio proyecto ya respalda (titulación TD2 del guía, grupos de máximo 6,
 * material homologado, póliza de accidentes y póliza de RC, registro de
 * turismo activo).
 *
 * IMPORTANTE: ambas pólizas (accidentes 1300013109 y RC 1500175606) son reales
 * y de la misma compañía. No se generaliza la cobertura ni se muestran
 * capitales, edades o altitud. En esta tarjeta no se muestran vigencia,
 * condiciones ni enlaces de seguro (retirados a petición del titular).
 */

function TourismRegistryCard({ registry }: { registry: string | null }) {
  return (
    <span>
      Registro de Turismo de Andalucía · {registry || FALLBACK_TOURISM_REGISTRY}.{' '}
      <Link
        to="/terminos#identificacion"
        className="font-semibold text-primary hover:underline underline-offset-2"
      >
        Ver Aviso Legal
      </Link>
    </span>
  );
}

function AccidentInsuranceCard({
  insurer,
  rcPolicy,
  accidentPolicy,
}: {
  insurer: string | null;
  rcPolicy: string | null;
  accidentPolicy: string | null;
}) {
  return (
    <span>
      Accidentes · Póliza {accidentPolicy || FALLBACK_ACCIDENT_POLICY}. Responsabilidad
      civil · Póliza {rcPolicy || FALLBACK_RC_POLICY}. {insurer || FALLBACK_INSURER} ·
      Vigencia {POLICY_VALIDITY_PERIOD}. Cobertura para participantes durante las
      actividades aseguradas, según las condiciones de la póliza.{' '}
      <a
        href={ACCIDENT_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:underline underline-offset-2"
      >
        Formulario de declaración de accidentes
      </a>{' · '}
      <Link
        to="/terminos#identificacion"
        className="font-semibold text-primary hover:underline underline-offset-2"
      >
        Datos del seguro
      </Link>
    </span>
  );
}

interface TrustItem {
  icon: typeof ShieldCheck;
  title: string;
  description: React.ReactNode;
}

export function buildTrustItems(settings: BusinessSettings): TrustItem[] {
  return [
    {
      icon: BadgeCheck,
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
      title: 'Seguro de accidentes y RC',
      description: (
        <AccidentInsuranceCard
          insurer={settings.insurer}
          rcPolicy={settings.rcPolicy}
          accidentPolicy={settings.accidentPolicy}
        />
      ),
    },
    {
      icon: FileText,
      title: 'Turismo activo registrado',
      description: <TourismRegistryCard registry={settings.tourismRegistry} />,
    },
  ];
}

interface TrustBarProps {
  className?: string;
  /** `compact` para barras laterales o pasos de reserva. */
  variant?: 'section' | 'compact';
}

export function TrustBar({ className, variant = 'section' }: TrustBarProps) {
  const settings = useBusinessSettings();
  const items = buildTrustItems(settings);

  if (variant === 'compact') {
    return (
      <ul className={cn('space-y-2 text-sm text-muted-foreground', className)}>
        {items.map(({ icon: Icon, title }) => (
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
      <div className="container mx-auto grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-3 bg-secondary px-4 py-5 sm:px-5 lg:py-6"
          >
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold uppercase text-foreground sm:text-sm">
                {title}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
