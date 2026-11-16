import { Link } from 'react-router-dom';
import { Camera, MapPin, ArrowDown, AlertTriangle, MessageCircle, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  canyonCatalog,
  canyonCatalogLinks,
  COMMERCIAL_LEVEL_LABEL,
  filterCanyonCatalog,
  MAX_GROUP_SIZE,
  type CanyonCatalogItem,
  type LevelFilter,
  type ProvinceFilter,
} from '@/data/canyonCatalog';

interface CanyonCatalogProps {
  provincia: ProvinceFilter;
  nivel: LevelFilter;
  onProvinciaChange: (value: ProvinceFilter) => void;
  onNivelChange: (value: LevelFilter) => void;
}

const PROVINCE_OPTIONS: { value: ProvinceFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'Málaga', label: 'Málaga' },
  { value: 'Granada', label: 'Granada' },
];
const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'iniciacion', label: 'Iniciación' },
  { value: 'intermedio', label: 'Intermedio' },
];

function FilterGroup<T extends string>({
  legend, options, value, onChange,
}: { legend: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-foreground">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              value === opt.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function consultUrl(item: CanyonCatalogItem) {
  const name = item.tramo ? `${item.nombre} (${item.tramo})` : item.nombre;
  return `https://wa.me/34685609542?text=${encodeURIComponent(
    `¡Hola! Quiero consultar el barranco ${name}. ¿Qué fechas y condiciones tenéis?`,
  )}`;
}

function CatalogCard({ item }: { item: CanyonCatalogItem }) {
  const links = canyonCatalogLinks(item);
  return (
    <article id={item.id} className="flex scroll-mt-40 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div
        role="img"
        aria-label={`Fotografía del recorrido ${item.nombre} pendiente`}
        className="flex h-40 flex-col items-center justify-center gap-2 border-b border-border bg-muted/40 text-muted-foreground"
      >
        <Camera className="h-6 w-6" aria-hidden="true" />
        <span className="text-xs font-medium">Fotografía del recorrido pendiente</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className="bg-primary text-primary-foreground">{COMMERCIAL_LEVEL_LABEL[item.nivelComercial]}</Badge>
          <Badge variant="outline" className="text-foreground">
            Grado técnico: {item.gradoTecnico ?? 'pendiente de validar'}
          </Badge>
        </div>

        <h3 className="text-xl font-heading font-bold text-foreground">{item.nombre}</h3>
        {item.tramo && <p className="text-sm font-semibold text-primary">{item.tramo}</p>}
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden="true" /> {item.zona} · {item.provincia}
        </p>

        <p className="mt-3 text-sm text-muted-foreground">{item.resumen}</p>

        {item.rapelMaximo && (
          <p className="mt-2 flex items-center gap-1 text-sm text-foreground">
            <ArrowDown className="h-4 w-4 text-primary" aria-hidden="true" /> Rápel máx.: {item.rapelMaximo}
          </p>
        )}

        {item.avisoAltura && (
          <p className="mt-3 flex gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {item.avisoAltura}
          </p>
        )}

        {item.pendienteValidacion && (
          <p className="mt-3 text-xs text-muted-foreground">
            Recorrido pendiente de validar disponibilidad. Solo consulta, sin cobro.
          </p>
        )}

        <details className="mt-3 text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">Fuentes documentales</summary>
          <ul className="mt-2 space-y-1">
            {item.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
                  {f.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">Consulta documental; no sustituye el reconocimiento del terreno ni acredita permisos.</p>
        </details>

        <div className="mt-auto pt-5">
          <div className="mb-3 flex items-baseline justify-between text-sm">
            <span className="font-bold text-foreground">{item.precio ?? 'Consultar'}</span>
            <span className="text-muted-foreground">Grupos de hasta {MAX_GROUP_SIZE}</span>
          </div>
          <div className="flex gap-3">
            {links.reserva ? (
              <>
                <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                  <Link to={links.ficha}><Info className="h-4 w-4" /> Ver ficha</Link>
                </Button>
                <Button variant="hero" size="sm" className="flex-1" asChild>
                  <Link to={links.reserva}>Reservar</Link>
                </Button>
              </>
            ) : (
              <Button variant="hero" size="sm" className="flex-1 gap-2" asChild>
                <a href={consultUrl(item)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Consultar
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CanyonCatalog({ provincia, nivel, onProvinciaChange, onNivelChange }: CanyonCatalogProps) {
  const items = filterCanyonCatalog(canyonCatalog, provincia, nivel);
  const reset = () => { onProvinciaChange('todas'); onNivelChange('todos'); };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-10">
          <FilterGroup legend="Provincia" options={PROVINCE_OPTIONS} value={provincia} onChange={onProvinciaChange} />
          <FilterGroup legend="Experiencia" options={LEVEL_OPTIONS} value={nivel} onChange={onNivelChange} />
        </div>
        <p aria-live="polite" className="text-sm font-semibold text-foreground">
          {items.length} {items.length === 1 ? 'barranco' : 'barrancos'}
        </p>
      </div>

      <p className="mb-6 text-xs text-muted-foreground">
        La señal solo se cobra en salidas programadas y validadas. Las fechas a medida se tramitan como consulta, sin pago.
      </p>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <CatalogCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card py-12 text-center">
          <p className="mb-4 text-foreground">No hay barrancos con esta combinación.</p>
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Quitar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
