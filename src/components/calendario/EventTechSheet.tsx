import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  Baby,
  Backpack,
  CalendarDays,
  CalendarRange,
  Cable,
  Check,
  CloudRain,
  Clock,
  Compass,
  FileCheck2,
  Gauge,
  MapPin,
  Mountain,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Timer,
  UserCheck,
  Users,
  Waves,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getActivityCatalogImage } from "@/data/activityProfiles";
import type { ActivityEvent } from "@/hooks/useActivityEvents";
import { useCatalogForOuting } from "@/hooks/useCatalogForOuting";
import { mergeOutingSheet } from "@/lib/catalogSync";
import { OutingInstructions } from "@/components/shared/OutingInstructions";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  barranquismo: Waves,
  escalada: Mountain,
  "vias-ferratas": Cable,
  espeleologia: Mountain,
};

const FITNESS: Record<string, number> = { básica: 1, basica: 1, media: 2, alta: 3 };
const LEVEL_NAME = ["Iniciación", "Intermedio", "Avanzado"];
/** Cuántas preguntas caben por diapositiva en cada formato. */
const FAQ_PER_SLIDE = { wide: 6, compact: 4 };

/** Etiquetas de los bloques de la descripción en portada. */
const DESC_LABELS = ["La salida", "Para quién", "A tener en cuenta"];

/** true en pantallas de escritorio: diapositivas con más bloques cada una. */
function useIsWide() {
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}

/** Una diapositiva de la ficha: cabecera propia y uno o varios bloques. */
type Slide = { key: string; eyebrow: string; title: string; blocks: string[] };

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

function Meter({ value, max = 3 }: { value: number; max?: number }) {
  return (
    <div className="flex justify-center gap-1" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className={cn("h-2 rounded-full", n <= value ? "bg-primary" : "bg-muted-foreground/25")}
        />
      ))}
    </div>
  );
}

/** Dato destacado: icono, etiqueta mínima y valor grande. */
function Stat({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-0.5 rounded-2xl border border-border/60 bg-secondary/40 px-2 py-2 text-center",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-heading text-sm font-extrabold leading-tight text-foreground sm:text-xl">
        {value}
      </span>
      {hint ? <span className="text-[10px] leading-tight text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/** Lista con viñetas de verificación o numeradas. */
function Checklist({
  icon: Icon,
  title,
  items,
  numbered = false,
}: {
  icon: LucideIcon;
  title: string;
  items?: string[];
  numbered?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-2.5 sm:p-3">
      <h4 className="mb-1.5 flex items-center gap-2 font-heading text-[13px] font-bold text-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {title}
      </h4>
      <ol className="space-y-1">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground"
          >
            {numbered ? (
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-extrabold text-primary">
                {i + 1}
              </span>
            ) : (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            )}
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Aviso con cabecera iconada (meteorología, cancelación). */
function Note({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  if (!text) return null;
  return (
    <section className="min-w-0 rounded-2xl border border-border/60 bg-secondary/30 p-2.5 sm:p-3">
      <h4 className="mb-1 flex items-center gap-2 font-heading text-[13px] font-bold text-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {title}
      </h4>
      <p className="text-[12px] leading-snug text-muted-foreground">{text}</p>
    </section>
  );
}

/** Preguntas y respuestas de la actividad. */
function Faqs({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div
      className={cn(
        "space-y-1.5",
        columns && "grid grid-cols-1 gap-1.5 space-y-0 sm:grid-cols-2",
      )}
    >
      {items.map((f, i) => (
        <div key={`${f.question}-${i}`} className="rounded-xl border border-border/60 bg-card/60 p-2">
          <p className="flex items-start gap-1.5 font-heading text-[11px] font-bold leading-snug text-foreground">
            <span className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[8px] font-extrabold text-primary">
              ?
            </span>
            {f.question}
          </p>
          <p className="mt-0.5 pl-4 text-[11px] leading-snug text-muted-foreground">{f.answer}</p>
        </div>
      ))}
    </div>
  );
}

/** Parte la descripción en bloques de lectura de un tamaño parecido. */
function packGroups(text: string, maxChars: number): string[][] {
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const groups: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const s of sentences) {
    if (current.length && size + s.length > maxChars) {
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push(s);
    size += s.length + 1;
  }
  if (current.length) groups.push(current);
  return groups;
}

/** Descripción de la ficha, maquetada en bloques cortos y etiquetados. */
function Description({ groups, labels = [] }: { groups: string[][]; labels?: string[] }) {
  if (groups.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {groups.map((group, i) => (
        <section
          key={`${group[0]}-${i}`}
          className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-2.5 sm:p-3"
        >
          {labels[i] ? (
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
              {labels[i]}
            </p>
          ) : null}
          <p
            className={cn(
              "mt-0.5 text-[12px] leading-snug text-muted-foreground sm:text-[13px]",
              i === 0 && "text-foreground",
            )}
          >
            {group.join(" ")}
          </p>
        </section>
      ))}
    </div>
  );
}

export function EventTechSheet({
  event,
  bookingUrl,
  trigger,
}: {
  event: ActivityEvent;
  bookingUrl: string;
  /** Elemento que abre la ficha. Por defecto, un botón «Ver ficha y reservar». */
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const wide = useIsWide();
  const { override } = useCatalogForOuting(event.category, event.slug);
  const sheet = mergeOutingSheet(event, event.profile, override);
  const p = event.profile;
  const image = p ? getActivityCatalogImage(event.category, event.slug) ?? undefined : undefined;
  const Icon = CATEGORY_ICON[event.category] ?? CalendarDays;
  const fit = FITNESS[sheet.fitness.toLowerCase()] ?? 1;
  const dateLabel = event.startDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const priceLabel = sheet.price ? `${sheet.price} €` : "Consultar";
  const dateShort = event.startDate.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  /* ---- Descripción: tres bloques en portada y el resto en «Con detalle» ---- */
  const descGroups = packGroups(sheet.description, wide ? 460 : 380);
  const descShown = descGroups.slice(0, 3);
  const descRest = descGroups.slice(3).flat().join(" ");

  /* ---- Diapositivas: se arman según la pantalla y los datos que existen ---- */
  const faqGroups = chunk(sheet.faqs, wide ? FAQ_PER_SLIDE.wide : FAQ_PER_SLIDE.compact);

  const slides: Slide[] = [
    {
      key: "portada",
      eyebrow: "Salida programada",
      title: "Ficha de la actividad",
      blocks: wide ? ["stats", "descripcion", "highlights"] : ["stats", "descripcion"],
    },
    ...(descRest
      ? [
          {
            key: "detalle",
            eyebrow: "La actividad",
            title: "Con detalle",
            blocks: ["detalle"],
          },
        ]
      : []),
    {
      key: "nivel",
      eyebrow: "Dificultad",
      title: "Nivel y condiciones",
      blocks: wide ? ["nivelBig", "experience"] : ["nivelBig", "experience", "highlights"],
    },
    { key: "salida", eyebrow: "Logística", title: "La salida", blocks: ["salidaTiles"] },
    {
      key: "recorrido",
      eyebrow: "Itinerario",
      title: "Recorrido",
      blocks: sheet.technicalElements.length > 0 ? ["steps", "elements"] : ["steps"],
    },
    { key: "material", eyebrow: "Material", title: "Incluye y qué llevar", blocks: ["prepGrid"] },
    {
      key: "seguridad",
      eyebrow: "Seguridad",
      title: "Requisitos, seguros y normas",
      blocks: wide ? ["securityGrid", "rules"] : ["securityPanels", "policies", "rules"],
    },
    ...faqGroups.map((_, i) => ({
      key: `dudas-${i}`,
      eyebrow: "Preguntas",
      title:
        faqGroups.length > 1
          ? `Dudas frecuentes ${i + 1} de ${faqGroups.length}`
          : "Dudas frecuentes",
      blocks: [`dudas-${i}`],
    })),
  ];

  const last = slides.length - 1;
  const current = slides[Math.min(page, last)];

  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) setPage(0);
  };

  const BLOCKS: Record<string, ReactNode> = {
    stats: (
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={CalendarDays} label="Fecha" value={<span className="capitalize">{dateShort}</span>} />
        <Stat icon={Waves} label="Precio" value={priceLabel} hint="por persona · señal del 30 %" />
        <Stat
          icon={Users}
          label="Plazas libres"
          value={event.isFull ? "Sin plazas" : event.freeSeats}
          hint={event.isFull ? undefined : `grupo: ${sheet.group || "consultar"}`}
        />
      </div>
    ),

    descripcion: <Description groups={descShown} labels={DESC_LABELS} />,

    detalle: <Description groups={packGroups(descRest, wide ? 1500 : 1000)} />,

    highlights:
      sheet.highlights.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {sheet.highlights.map((h, i) => (
            <li
              key={`${h}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      ) : null,

    nivelBig: (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          icon={Gauge}
          label="Nivel"
          value={sheet.levelLabel || LEVEL_NAME[sheet.level - 1]}
          hint={
            <span className="mt-1 block">
              <Meter value={sheet.level} />
            </span>
          }
        />
        <Stat icon={Mountain} label="Grado técnico" value={sheet.grade || "—"} />
        <Stat icon={Baby} label="Edad mínima" value={sheet.minAge || "—"} />
        <Stat
          icon={Activity}
          label="Condición física"
          value={sheet.fitness || "—"}
          hint={
            <span className="mt-1 block">
              <Meter value={fit} />
            </span>
          }
        />
      </div>
    ),

    experience: sheet.experience && (
      <p className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-secondary/30 px-3 py-3 text-center text-sm font-semibold text-foreground">
        <Award className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {sheet.experience}
      </p>
    ),

    salidaTiles: (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          icon={MapPin}
          label="Punto de encuentro"
          value={<span className="text-base sm:text-lg">{sheet.meetingPoint || "—"}</span>}
          className="col-span-2"
        />
        <Stat icon={Clock} label="Duración total" value={sheet.duration || "—"} />
        <Stat icon={Timer} label="Actividad efectiva" value={sheet.effectiveDuration || "—"} />
        <Stat icon={CalendarRange} label="Temporada" value={sheet.season || "—"} className="col-span-2" />
        <Stat icon={Users} label="Grupo" value={<span className="text-base">{sheet.group || "—"}</span>} />
        <Stat
          icon={UserCheck}
          label="Ratio guía"
          value={<span className="text-base">{sheet.guideRatio || "—"}</span>}
        />
        <Stat
          icon={Compass}
          label="Aproximación"
          value={<span className="text-base">{sheet.approachReturn || "—"}</span>}
        />
      </div>
    ),

    steps: <Checklist icon={Compass} title="Pasos del recorrido" items={sheet.itinerary} numbered />,

    elements: (
      <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-3 sm:p-4">
        <h4 className="mb-2 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
          <Cable className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Elementos técnicos
        </h4>
        <ul className="flex flex-wrap gap-2">
          {sheet.technicalElements.map((e, i) => (
            <li
              key={`${e}-${i}`}
              className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              {e}
            </li>
          ))}
        </ul>
      </section>
    ),

    prepGrid: (
      <div className="grid gap-3 sm:grid-cols-2">
        <Checklist icon={PackageCheck} title="Incluye" items={sheet.includes} />
        <Checklist icon={Backpack} title="Qué llevar" items={sheet.bring} />
      </div>
    ),

    securityGrid: (
      <div className="grid gap-3 sm:grid-cols-2">
        <Checklist icon={ShieldCheck} title="Requisitos de seguridad" items={sheet.requirements} />
        <Checklist icon={FileCheck2} title="Seguros y permisos" items={sheet.insurancePermits} />
        <Note icon={CloudRain} title="Meteorología" text={sheet.weatherPolicy} />
        <Note icon={CalendarDays} title="Cancelación" text={sheet.cancellationPolicy} />
      </div>
    ),

    securityPanels: (
      <div className="space-y-3">
        <Checklist icon={ShieldCheck} title="Requisitos de seguridad" items={sheet.requirements} />
        <Checklist icon={FileCheck2} title="Seguros y permisos" items={sheet.insurancePermits} />
      </div>
    ),

    policies: (
      <div className="space-y-3">
        <Note icon={CloudRain} title="Meteorología" text={sheet.weatherPolicy} />
        <Note icon={CalendarDays} title="Cancelación" text={sheet.cancellationPolicy} />
      </div>
    ),

    rules: <OutingInstructions rules={event.rules} steps={event.steps} />,

    ...Object.fromEntries(
      faqGroups.map((group, i) => [`dudas-${i}`, <Faqs items={group} />]),
    ),
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="transition-all duration-300 active:scale-95">
            Ver ficha y reservar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[min(96vw,920px)] max-w-none gap-0 overflow-hidden rounded-none p-0 sm:rounded-2xl">
        <div className="flex max-h-[92vh] flex-col">
          {/* Portada fija: foto, disciplina y título */}
          <div className="relative shrink-0 overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary/60" />
            {image ? (
              <img
                src={image}
                alt={p?.imageAlt ?? sheet.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/45" />
            <div className="relative px-4 pb-2 pt-6 sm:px-6 sm:pb-3 sm:pt-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary sm:px-2.5 sm:text-[10px]">
                <Icon className="h-3 w-3" aria-hidden="true" />
                {p?.categoryLabel ?? event.category}
              </span>
              <DialogTitle className="mt-1 font-heading text-base font-extrabold leading-tight text-foreground sm:text-xl">
                {sheet.title}
              </DialogTitle>
              {sheet.summary && (
                <DialogDescription className="mt-0.5 line-clamp-2 hidden text-[12px] text-muted-foreground sm:block">
                  {sheet.summary}
                </DialogDescription>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar ficha"
              className="absolute right-3 top-3 z-10 rounded-full border border-border/60 bg-card/80 p-2 text-foreground transition-all duration-300 hover:border-primary/60 active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Diapositiva actual */}
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              key={current.key}
              className="animate-in fade-in-0 slide-in-from-right-2 space-y-2 px-4 py-3 duration-300 sm:px-6 sm:py-4"
            >
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[10px]">
                    {current.eyebrow}
                  </p>
                  <h3 className="mt-0.5 font-heading text-lg font-extrabold leading-tight text-foreground sm:text-xl">
                    {current.title}
                  </h3>
                </div>
                <span className="shrink-0 font-heading text-xs font-bold text-muted-foreground/60">
                  {String(page + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>
              {current.blocks.map((b) => (
                <div key={b}>{BLOCKS[b]}</div>
              ))}
            </div>
          </div>

          {/* Pie: datos de decisión + navegación entre diapositivas */}
          <div className="flex shrink-0 flex-col gap-1.5 border-t border-border bg-background px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-muted-foreground sm:text-sm">
              <span className="capitalize">{dateLabel}</span>
              <span className="mx-1.5 text-muted-foreground/40">·</span>
              <span className="font-heading text-base font-bold text-primary sm:text-lg">
                {priceLabel}
              </span>{" "}
              <span className="text-[11px]">/ persona · señal del 30 %</span>
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              <div className="mr-1 flex items-center gap-1">
                {slides.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-label={`Ver diapositiva ${s.title}`}
                    aria-current={i === page ? "step" : undefined}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === page ? "w-5 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-primary/50",
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {page > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((v) => Math.max(0, v - 1))}
                    className="transition-all duration-300 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Anterior
                  </Button>
                )}
                {page < last && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((v) => Math.min(last, v + 1))}
                    className="transition-all duration-300 active:scale-95"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {/* La reserva está disponible desde cualquier diapositiva. */}
                {event.isFull ? (
                  <Button size="sm" disabled>
                    Sin plazas
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="transition-all duration-300 active:scale-95"
                  >
                    <Link to={bookingUrl}>Reservar plaza</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
