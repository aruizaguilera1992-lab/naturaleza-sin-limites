import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Sección de confianza y seguridad.
 *
 * IMPORTANTE: no incluir números de póliza, coberturas ni datos legales que
 * no estén verificados. Los logotipos son versiones monocromas generadas
 * como placeholder hasta contar con los archivos oficiales de cada marca.
 */

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
        'group flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6 sm:p-8',
        'transition-all duration-300 hover:border-primary/40 hover:bg-card',
        'active:scale-[0.98]'
      )}
    >
      <div className="flex min-h-[72px] flex-wrap items-center gap-4">{visual}</div>
      <h3 className="mt-6 font-heading text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{children}</p>
      {footer && <div className="mt-6">{footer}</div>}
    </article>
  );
}

export function SafetyAssuranceSection({ className }: { className?: string }) {
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
            Aventura con seguridad, material profesional y garantías reales
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Material homologado, guías cualificadas y seguro de accidentes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 lg:grid-cols-3">
          <Block
            title="Federación Andaluza de Espeleología"
            visual={
              <img
                src="/images/brands/fae.png"
                alt="Federación Andaluza de Espeleología"
                loading="lazy"
                width={816}
                height={816}
                className="h-16 w-auto opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              />
            }
          >
            Actividades avaladas por los estándares de la federación.
          </Block>

          <Block
            title="Material técnico homologado"
            visual={
              <div className="flex flex-wrap items-center gap-5">
                {brands.map((brand) => (
                  <img
                    key={brand.alt}
                    src={brand.src}
                    alt={brand.alt}
                    loading="lazy"
                    width={816}
                    height={816}
                    className="h-8 w-auto opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  />
                ))}
              </div>
            }
          >
            Equipamiento Petzl, Fixe y Sealand, revisado antes de cada salida.
          </Block>

          <Block
            title="Seguro de accidentes"
            visual={
              <span className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary/10 p-3">
                <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
              </span>
            }
            footer={
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary/10 active:scale-95"
              >
                Ver condiciones del seguro
              </Link>
            }
          >
            Incluido en todas las actividades.
          </Block>
        </div>
      </div>
    </section>
  );
}

export default SafetyAssuranceSection;
