import {
  COVERAGE_CHECKED_LABEL,
  NORMATIVE_REQUIREMENT,
} from '@/data/insuranceCoverage';

/**
 * Detalle de las pólizas (bloque «Norma vs. contrato»).
 * Usado en la sección de confianza de portada y en /terminos#identificacion.
 */
export function InsuranceCoverageDetails({ showCheckedLabel = false }: { showCheckedLabel?: boolean }) {
  return (
    <div className="grid gap-5 text-left lg:grid-cols-2">
      {showCheckedLabel && (
        <p className="text-xs text-muted-foreground lg:col-span-2">{COVERAGE_CHECKED_LABEL}</p>
      )}

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
      </div>
    </div>
  );
}
