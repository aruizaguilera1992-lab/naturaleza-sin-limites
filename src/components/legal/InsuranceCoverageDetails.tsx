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
  useBusinessSettings,
} from '@/hooks/useBusinessSettings';
import { secondaryLinkClasses } from '@/components/legal/linkStyles';

function CoverageTable({
  title,
  rows,
  caption,
}: {
  title: string;
  rows: { label: string; value: string }[];
  caption?: string;
}) {
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
              <th scope="row" className="w-1/2 py-2 pr-3 text-left font-normal text-muted-foreground break-words">
                {r.label}
              </th>
              <td className="py-2 text-right font-semibold text-foreground break-words">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Detalle verificado de coberturas de las pólizas (RC y accidentes).
 * Datos contrastados con los contratos aportados por el titular; no se
 * publican los contratos completos y no constituye certificado de cumplimiento.
 * Usado en la sección de confianza de portada y en /terminos#identificacion.
 */
export function InsuranceCoverageDetails({ showCheckedLabel = false }: { showCheckedLabel?: boolean }) {
  const { insurer, rcPolicy, accidentPolicy } = useBusinessSettings();

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
        <p className="mt-2 text-xs text-muted-foreground">
          La comparación de importes es informativa; no constituye certificado de cumplimiento ni aval de la Junta de Andalucía.{' '}
          <a href={NORMATIVE_SOURCE.url} target="_blank" rel="noopener noreferrer" className={secondaryLinkClasses}>
            {NORMATIVE_SOURCE.label}
          </a>
        </p>
      </div>

      <CoverageTable title={`Responsabilidad civil · Póliza ${rcPolicy || FALLBACK_RC_POLICY}`} rows={RC_ROWS} />

      <div className="min-w-0">
        <CoverageTable
          title={`Accidentes · Póliza ${accidentPolicy || FALLBACK_ACCIDENT_POLICY}`}
          rows={ACCIDENT_ROWS}
          caption="Límites generales por persona"
        />
        <p
          role="note"
          className="mt-3 rounded-xl border border-primary/50 bg-primary/10 p-3 text-sm font-semibold leading-6 text-foreground"
        >
          {AGE_RESTRICTION}
        </p>
      </div>

      <div className="min-w-0 rounded-2xl border border-border bg-card/60 p-5 lg:col-span-2">
        <h3 className="font-heading text-base font-bold text-foreground">Precisiones del seguro de accidentes</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {ACCIDENT_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Aseguradora: {insurer || FALLBACK_INSURER} · Vigencia de ambas pólizas: {POLICY_PERIOD}
        </p>
      </div>
    </div>
  );
}
