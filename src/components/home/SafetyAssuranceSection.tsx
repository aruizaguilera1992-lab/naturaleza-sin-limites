import { FileText, HardHat, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { technicalBrands } from '@/data/technicalBrands';
import {
  FALLBACK_ACCIDENT_POLICY,
  FALLBACK_INSURER,
  FALLBACK_RC_POLICY,
  FALLBACK_TOURISM_REGISTRY,
  useBusinessSettings,
} from '@/hooks/useBusinessSettings';

/**
 * Sección de confianza y seguridad.
 *
 * IMPORTANTE: solo se afirman datos verificados. Ambas pólizas (RC 1500175606
 * y accidentes 1300013109) son reales y de la misma compañía. La cobertura de
 * accidentes no se generaliza, ni se muestran capitales, edades o altitud. En
 * esta tarjeta no se muestran vigencia, condiciones ni enlaces de seguro
 * (retirados a petición del titular). Las marcas de material no implican
 * patrocinio ni acuerdo (ver src/data/technicalBrands.ts).
 */

interface BlockProps {
  visual: React.ReactNode;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Block({ visual, title, children, footer }: BlockProps) {
  return (
    <article
      className={cn(
        'group flex h-full min-w-0 flex-col items-center rounded-2xl border border-border bg-card/60 p-6 text-center sm:p-8',
        'transition-all duration-300 hover:border-primary/40 hover:bg-card',
        'active:scale-[0.98]'
      )}
    >
      <div className="flex min-h-[96px] flex-wrap items-center justify-center gap-5">{visual}</div>
      <h3 className="mt-6 font-heading text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground break-words">{children}</p>
      {footer && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{footer}</div>}
    </article>
  );
}

const secondaryLinkClasses = 'text-xs font-semibold text-primary hover:underline underline-offset-2';

export function SafetyAssuranceSection({ className }: { className?: string }) {
  const { insurer, rcPolicy, accidentPolicy, tourismRegistry } = useBusinessSettings();

  return (
    <section
      aria-labelledby="seguridad-titulo"
      className={cn('border-b border-border bg-background py-16 sm:py-20', className)}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="seguridad-titulo"
            className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            Seguridad, Material y trato profesional
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Solo trabajamos con las mejores marcas, guías cualificados y seguros en cada
            actividad para que tu única preocupación sea disfrutar.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-3">
          <Block
            title="Material técnico homologado"
            visual={
              <span className="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <HardHat className="h-12 w-12 text-primary" aria-hidden="true" />
              </span>
            }
            footer={
              <a href="#marcas-equipamiento" className={secondaryLinkClasses}>
                Ver las {technicalBrands.length} marcas
              </a>
            }
          >
            Seleccionamos equipos adecuados para cada actividad y revisamos el material antes de cada
            salida. Los EPI se utilizan según su certificación y las indicaciones del fabricante.
          </Block>

          <Block
            title="Seguro de accidentes y RC"
            visual={
              <span className="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <ShieldCheck className="h-12 w-12 text-primary" aria-hidden="true" />
              </span>
            }
          >
            <span className="block">
              Accidentes · Póliza {accidentPolicy || FALLBACK_ACCIDENT_POLICY}.
            </span>
            <span className="mt-1 block">
              Responsabilidad civil · Póliza {rcPolicy || FALLBACK_RC_POLICY}.
            </span>
            <span className="mt-2 block">{insurer || FALLBACK_INSURER}.</span>
          </Block>

          <Block
            title="Turismo activo registrado"
            visual={
              <span className="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <FileText className="h-12 w-12 text-primary" aria-hidden="true" />
              </span>
            }
            footer={
              <Link to="/terminos#identificacion" className={secondaryLinkClasses}>
                Ver datos legales
              </Link>
            }
          >
            Registro de Turismo de Andalucía · {tourismRegistry || FALLBACK_TOURISM_REGISTRY}.
          </Block>
        </div>

        <div id="marcas-equipamiento" className="mt-12 scroll-mt-32">
          <h3 className="text-center font-heading text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
            Marcas de nuestro equipamiento técnico
          </h3>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {technicalBrands.map((brand) => (
              <li key={brand.name} className="min-w-0">
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} (web oficial, se abre en una pestaña nueva)`}
                  className="group/brand flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/60 transition-all duration-300 hover:border-primary/40 active:scale-95"
                >
                  <span className={cn('flex h-20 items-center justify-center p-3 sm:h-24', brand.plate === 'light' ? 'bg-foreground' : 'bg-secondary')}>
                    <img src={brand.logo} alt={brand.name} loading="lazy" decoding="async" className="max-h-full w-full object-contain" />
                  </span>
                  <span className="truncate px-2 py-2 text-center text-xs font-semibold text-muted-foreground group-hover/brand:text-primary">
                    {brand.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default SafetyAssuranceSection;
