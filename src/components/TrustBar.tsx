import { Link } from 'react-router-dom';
import { BadgeCheck, FileText, ShieldCheck, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FALLBACK_INSURER,
  FALLBACK_RC_POLICY,
  FALLBACK_TOURISM_REGISTRY,
  useBusinessSettings,
  type BusinessSettings,
} from '@/hooks/useBusinessSettings';

/**
 * Señales de confianza verificables. Solo se incluyen afirmaciones que el
 * propio proyecto ya respalda (titulación TD2 del guía, grupos de máximo 6,
 * material homologado, seguro de accidentes y RC, registro de turismo activo).
 *
 * IMPORTANTE: el enlace de seguro apunta al formulario oficial de declaración
 * de siniestros de la aseguradora; no presenta certificado de accidentes, ni
 * condiciones, ni número de póliza de accidentes (aún no aportados). Los datos
 * de la póliza de Responsabilidad Civil (número y vigencia) son los de la
 * póliza real facilitada; no se inventan coberturas ni capitales. El enlace
 * «Datos del seguro» lleva al Aviso Legal, no al contrato completo.
 */

const ACCIDENT_FORM_URL =
  'https://drive.google.com/file/d/1PvunUN7hG8bt3BFFXpxxFN5Wubvt4bUJ/view?usp=sharing';

/** Vigencia de la póliza de Responsabilidad Civil (póliza real facilitada). */
const RC_VALIDITY_PERIOD = '18/09/2026–17/09/2027';

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
}: {
  insurer: string | null;
  rcPolicy: string | null;
}) {
  return (
    <span>
      Responsabilidad civil · {insurer || FALLBACK_INSURER} · Póliza{' '}
      {rcPolicy || FALLBACK_RC_POLICY} · Vigencia {RC_VALIDITY_PERIOD}. Seguro de
      accidentes incluido en la actividad.{' '}
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
      description: <AccidentInsuranceCard insurer={settings.insurer} rcPolicy={settings.rcPolicy} />,
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
