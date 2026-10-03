import { FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  FALLBACK_INSURER,
  FALLBACK_RC_POLICY,
  FALLBACK_TOURISM_REGISTRY,
  useBusinessSettings,
} from '@/hooks/useBusinessSettings';

/**
 * Sección de confianza y seguridad.
 *
 * IMPORTANTE: solo se afirman datos verificados. La Responsabilidad Civil está
 * acreditada con la póliza real (nº y vigencia); el seguro de accidentes está
 * contratado según informa el titular, pero aún no hay certificado aportado, así
 * que no se presentan número de póliza, condiciones ni coberturas de accidentes.
 * Los logotipos son versiones monocromas generadas como placeholder hasta contar
 * con los archivos oficiales de cada marca. «Datos del seguro» lleva al Aviso
 * Legal; nunca se enlaza el contrato completo (contiene datos personales).
 */

const ACCIDENT_FORM_URL =
  'https://drive.google.com/file/d/1PvunUN7hG8bt3BFFXpxxFN5Wubvt4bUJ/view?usp=sharing';

const brands = [
  { src: '/images/brands/petzl.png', alt: 'Petzl' },
  { src: '/images/brands/fixe.png', alt: 'Fixe' },
  { src: '/images/brands/sealand.png', alt: 'Sealand' },
];

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

const legalLinkClasses =
  'inline-flex items-center gap-2 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary/10 active:scale-95';

const secondaryLinkClasses = 'text-xs font-semibold text-primary hover:underline underline-offset-2';

export function SafetyAssuranceSection({ className }: { className?: string }) {
  const { insurer, rcPolicy, tourismRegistry } = useBusinessSettings();

  const FALLBACK_INSURER = 'W. R. Berkley Europe AG, Sucursal en España';
  const FALLBACK_RC_POLICY = '1500175606';
  const RC_VALIDITY_PERIOD = '18/09/2026–17/09/2027';
  const FALLBACK_TOURISM_REGISTRY = 'AT/MA/00508';

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

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          <Block
            title="Federación Andaluza de Espeleología"
            visual={
              <img
                src="/images/brands/fae.png"
                alt="Federación Andaluza de Espeleología"
                loading="lazy"
                width={816}
                height={816}
                className="h-28 w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />
            }
          >
            Actividades avaladas por los estándares de la federación.
          </Block>

          <Block
            title="Material técnico homologado"
            visual={
              <div className="flex flex-wrap items-center justify-center gap-6">
                {brands.map((brand) => (
                  <img
                    key={brand.alt}
                    src={brand.src}
                    alt={brand.alt}
                    loading="lazy"
                    width={816}
                    height={816}
                    className="h-14 w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />
                ))}
              </div>
            }
          >
            Equipamiento Petzl, Fixe y Sealand, revisado antes de cada salida.
          </Block>

          <Block
            title="Seguro de accidentes y RC"
            visual={
              <span className="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <ShieldCheck className="h-12 w-12 text-primary" aria-hidden="true" />
              </span>
            }
            footer={
              <>
                <Link to="/terminos#identificacion" className={legalLinkClasses}>
                  Datos del seguro
                </Link>
                <a
                  href={ACCIDENT_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryLinkClasses}
                >
                  Formulario de declaración de accidentes
                </a>
              </>
            }
          >
            <span className="block">
              Seguro de accidentes incluido en todas las actividades.
            </span>
            <span className="mt-2 block">
              Responsabilidad civil · {insurer || FALLBACK_INSURER} · Póliza{' '}
              {rcPolicy || FALLBACK_RC_POLICY} · Vigencia {RC_VALIDITY_PERIOD}.
            </span>
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
      </div>
    </section>
  );
}

export default SafetyAssuranceSection;
