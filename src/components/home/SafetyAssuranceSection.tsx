import { ShieldCheck, Anchor, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Sección de confianza y seguridad.
 *
 * IMPORTANTE: no incluir números de póliza, coberturas ni datos legales que
 * no estén verificados. Los logotipos se muestran como placeholders
 * monocromos (nombre de la marca) hasta contar con los archivos reales.
 */

const brands = ['PETZL', 'FIXE', 'SEALAND'];

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
      <div className="flex min-h-[72px] flex-wrap items-center gap-3">{visual}</div>
      <h3 className="mt-6 font-heading text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {children}
      </p>
      {footer && <div className="mt-6">{footer}</div>}
    </article>
  );
}

/** Placeholder monocromo de marca: Wordmark tipográfico sutil. */
function BrandMark({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-foreground/15 bg-foreground/5',
        'px-4 py-2 font-heading text-sm font-bold uppercase tracking-[0.2em] text-foreground/60',
        'transition-colors duration-300 group-hover:border-primary/30 group-hover:text-foreground/80',
        className
      )}
    >
      {label}
    </span>
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
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Trabajamos con material técnico homologado, guías cualificadas y seguro de accidentes
            para que solo te preocupes por disfrutar.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 lg:grid-cols-3">
          <Block
            title="Federación Andaluza de Espeleología"
            visual={
              <span
                className="inline-flex items-center gap-3 rounded-lg border border-foreground/15 bg-foreground/5 px-4 py-2.5"
                aria-label="Federación Andaluza de Espeleología (logo pendiente)"
              >
                <Anchor className="h-5 w-5 text-foreground/60" aria-hidden="true" />
                <span className="font-heading text-xs font-bold uppercase leading-tight tracking-wide text-foreground/60 transition-colors duration-300 group-hover:text-foreground/80">
                  Federación Andaluza
                  <br />
                  de Espeleología
                </span>
              </span>
            }
          >
            Actividades avaladas. Colaboramos y nos apoyamos en los estándares de la Federación
            Andaluza de Espeleología.
          </Block>

          <Block
            title="Material técnico homologado"
            visual={
              <div className="flex flex-wrap items-center gap-3">
                {brands.map((brand) => (
                  <BrandMark key={brand} label={brand} />
                ))}
              </div>
            }
          >
            Equipamiento técnico de marcas como Petzl, Fixe y Sealand, revisado y mantenido para
            cada salida.
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
            Seguro de accidentes incluido en todas las actividades. Consulta la póliza y las
            condiciones antes de reservar.
          </Block>
        </div>
      </div>
    </section>
  );
}

export default SafetyAssuranceSection;

// Icono auxiliar (no se usa actualmente, reservado para el logo federativo real)
export const _unused = Wrench;
