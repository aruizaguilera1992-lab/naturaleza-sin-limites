import { useEffect, useState } from 'react';
import { FileText, HardHat, ChevronDown, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { technicalBrands } from '@/data/technicalBrands';
import {
  ACCIDENT_NOTES,
  ACCIDENT_ROWS,
  AGE_RESTRICTION,
  COVERAGE_CHECKED_LABEL,
  NORMATIVE_REQUIREMENT,
  NORMATIVE_SOURCE,
  POLICY_PERIOD,
  RC_ROWS,
} from '@/data/insuranceCoverage';
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

function CoverageTable({ title, rows, caption }: { title: string; rows: { label: string; value: string }[]; caption?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card/60 p-5">
      <table className="w-full table-fixed text-sm">
        <caption className="mb-3 text-left">
          <span className="block font-heading text-base font-bold text-foreground break-words">{title}</span>
          {caption && <span className="block text-xs text-muted-foreground">{caption}</span>}
        </caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border">
              <th scope="row" className="w-1/2 py-2 pr-3 text-left font-normal text-muted-foreground break-words">{r.label}</th>
              <td className="py-2 text-right font-semibold text-foreground break-words">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SafetyAssuranceSection({ className }: { className?: string }) {
  const { insurer, rcPolicy, accidentPolicy, tourismRegistry } = useBusinessSettings();
  const { hash } = useLocation();
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [coverageOpen, setCoverageOpen] = useState(false);

  useEffect(() => {
    if (hash === '#marcas-equipamiento') setBrandsOpen(true);
    if (hash === '#coberturas-seguro') setCoverageOpen(true);
  }, [hash]);

  const openBrands = () => {
    setBrandsOpen(true);
    requestAnimationFrame(() =>
      document.getElementById('marcas-equipamiento')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  const openCoverage = () => {
    setCoverageOpen(true);
    requestAnimationFrame(() =>
      document.getElementById('coberturas-seguro')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

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
              <button
                type="button"
                onClick={openBrands}
                className={cn(secondaryLinkClasses, 'cursor-pointer')}
              >
                Ver las {technicalBrands.length} marcas
              </button>
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
            footer={
              <button type="button" onClick={openCoverage} className={cn(secondaryLinkClasses, 'cursor-pointer')}>
                Ver coberturas y condiciones
              </button>
            }
          >
            <span className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-foreground">RC 1.000.000 €</span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-foreground">Asistencia hasta 6.000 €</span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-foreground">Rescate hasta 12.000 €</span>
            </span>
            <span className="mt-3 block text-xs">
              Límites generales por persona para accidentes, sujetos a condiciones, exclusiones y restricciones por edad.
            </span>
            <span className="mt-2 block">
              Accidentes · Póliza {accidentPolicy || FALLBACK_ACCIDENT_POLICY} · RC · Póliza {rcPolicy || FALLBACK_RC_POLICY}
            </span>
            <span className="mt-1 block">{insurer || FALLBACK_INSURER}.</span>
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

        <div id="coberturas-seguro" className="mt-12 scroll-mt-32">
          <button
            type="button"
            onClick={() => setCoverageOpen((v) => !v)}
            aria-expanded={coverageOpen}
            aria-controls="detalle-coberturas-seguro"
            className="mx-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-center transition-all duration-300 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
              Ver coberturas y condiciones
            </span>
            <ChevronDown aria-hidden="true" className={cn('h-5 w-5 shrink-0 text-primary transition-transform duration-300', coverageOpen && 'rotate-180')} />
          </button>
          <p className="mt-1 text-center text-xs text-muted-foreground">{COVERAGE_CHECKED_LABEL}</p>
          {coverageOpen && (
            <div id="detalle-coberturas-seguro" className="mx-auto mt-6 grid max-w-5xl gap-5 text-left lg:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-border bg-card/60 p-5 lg:col-span-2">
                <h3 className="font-heading text-base font-bold text-foreground">Norma vs. contrato</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
                    <dt className="text-xs text-muted-foreground">RC contratada</dt>
                    <dd className="font-heading text-lg font-bold text-foreground">1.000.000 € por siniestro</dd>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 p-3">
                    <dt className="text-xs text-muted-foreground">Mínimo normativo</dt>
                    <dd className="font-heading text-lg font-bold text-foreground">600.000 € por siniestro</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{NORMATIVE_REQUIREMENT}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  La comparación de importes es informativa; no constituye certificado de cumplimiento ni aval de la Junta de Andalucía.{' '}
                  <a href={NORMATIVE_SOURCE.url} target="_blank" rel="noopener noreferrer" className={secondaryLinkClasses}>
                    {NORMATIVE_SOURCE.label}
                  </a>
                </p>
              </div>

              <CoverageTable
                title={`Responsabilidad civil · Póliza ${rcPolicy || FALLBACK_RC_POLICY}`}
                rows={RC_ROWS}
              />
              <div className="min-w-0">
                <CoverageTable
                  title={`Accidentes · Póliza ${accidentPolicy || FALLBACK_ACCIDENT_POLICY}`}
                  rows={ACCIDENT_ROWS}
                  caption="Límites generales por persona"
                />
                <p role="note" className="mt-3 rounded-xl border border-primary/50 bg-primary/10 p-3 text-sm font-semibold leading-6 text-foreground">
                  {AGE_RESTRICTION}
                </p>
              </div>

              <div className="min-w-0 rounded-2xl border border-border bg-card/60 p-5 lg:col-span-2">
                <h3 className="font-heading text-base font-bold text-foreground">Precisiones del seguro de accidentes</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                  {ACCIDENT_NOTES.map((n) => <li key={n}>{n}</li>)}
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Aseguradora: {insurer || FALLBACK_INSURER} · Vigencia de ambas pólizas: {POLICY_PERIOD}
                </p>
              </div>
            </div>
          )}
        </div>

        <div id="marcas-equipamiento" className="mt-12 scroll-mt-32">
          <button
            type="button"
            onClick={() => setBrandsOpen((v) => !v)}
            aria-expanded={brandsOpen}
            aria-controls="lista-marcas-equipamiento"
            className="mx-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-center transition-all duration-300 hover:text-primary active:scale-95"
          >
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
              Marcas de nuestro equipamiento técnico
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'h-5 w-5 shrink-0 text-primary transition-transform duration-300',
                brandsOpen && 'rotate-180',
              )}
            />
          </button>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {brandsOpen
              ? 'Toca para plegar'
              : `${technicalBrands.length} fabricantes · toca para ver`}
          </p>
          {brandsOpen && (
            <ul
              id="lista-marcas-equipamiento"
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            >
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
          )}
        </div>
      </div>
    </section>
  );
}

export default SafetyAssuranceSection;
