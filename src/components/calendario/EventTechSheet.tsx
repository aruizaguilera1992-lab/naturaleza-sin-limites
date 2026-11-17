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
/** Preguntas por diapositiva: caben enteras sin desplazar. */
const FAQ_PER_SLIDE = { wide: 4, compact: 2 };

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
        "flex min-w-0 flex-col items-center gap-1 rounded-2xl border border-border/60 bg-secondary/40 px-3 py-3 text-center",
        className,
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-heading text-lg font-extrabold leading-tight text-foreground sm:text-2xl">
        {value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
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
    <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-3 sm:p-4">
      <h4 className="mb-2 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {title}
      </h4>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
            {numbered ? (
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-extrabold text-primary">
                {i + 1}
              </span>
            ) : (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
    <section className="min-w-0 rounded-2xl border border-border/60 bg-secondary/30 p-3 sm:p-4">
      <h4 className="mb-1 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {title}
      </h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </section>
  );
}

/** Preguntas y respuestas de la actividad. */
function Faqs({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((f, i) => (
        <div key={`${f.question}-${i}`} className="rounded-xl border border-border/60 bg-card/60 p-2.5">
          <p className="flex items-start gap-2 font-heading text-[13px] font-bold leading-snug text-foreground">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-extrabold text-primary">
              ?
            </span>
            {f.question}
          </p>
          <p className="mt-1 pl-6 text-[13px] leading-snug text-muted-foreground">{f.answer}</p>
        </div>
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

  /* ---- Diapositivas: se arman según la pantalla y los datos que existen ---- */
  const slides: Slide[] = [
    {
      key: "portada",
      eyebrow: "Salida programada",
      title: "Ficha de la actividad",
      blocks: wide ? ["stats", "highlights"] : ["stats"],
    },
  ];
  if (!wide && sheet.summary)
    slides.push({
      key: "resumen",
      eyebrow: "La salida",
      title: "En qué consiste",
      blocks: ["resumen", "highlights"],
    });
  slides.push({
    key: "nivel",
    eyebrow: "Dificultad",
    title: "Nivel y condiciones",
    blocks: ["nivelBig", "experience"],
  });
  if (wide) {
    slides.push({ key: "salida", eyebrow: "Logística", title: "La salida", blocks: ["salidaTiles"] });
  } else {
    slides.push({
      key: "salida-a",
      eyebrow: "Logística",
      title: "Dónde y cuándo",
      blocks: ["salidaA"],
    });
    slides.push({
      key: "salida-b",
      eyebrow: "Logística",
      title: "Grupo y acceso",
      blocks: ["salidaB"],
    });
  }
  slides.push({ key: "recorrido", eyebrow: "Itinerario", title: "Recorrido", blocks: ["steps"] });
  if (sheet.technicalElements.length > 0)
    slides.push({
      key: "elementos",
      eyebrow: "Técnica",
      title: "Elementos de la actividad",
      blocks: ["elements"],
    });
  if (wide) {
    slides.push({
      key: "material",
      eyebrow: "Material",
      title: "Incluye y qué llevar",
      blocks: ["prepGrid"],
    });
  } else {
    slides.push({ key: "incluye", eyebrow: "Material", title: "Qué incluye", blocks: ["includesOnly"] });
    slides.push({ key: "llevar", eyebrow: "Material", title: "Qué llevar", blocks: ["bringOnly"] });
  }
  if (wide) {
    slides.push({
      key: "seguridad",
      eyebrow: "Seguridad",
      title: "Requisitos y seguros",
      blocks: ["securityGrid"],
    });
  } else {
    slides.push({
      key: "seguridad",
      eyebrow: "Seguridad",
      title: "Requisitos y seguros",
      blocks: ["securityPanels"],
    });
    slides.push({
      key: "politicas",
      eyebrow: "Seguridad",
      title: "Tiempo y cancelación",
      blocks: ["policies"],
    });
  }
  if (event.rules || event.steps)
    slides.push({
      key: "normas",
      eyebrow: "Participación",
      title: "Normas y pasos",
      blocks: ["rules"],
    });
  const faqGroups = chunk(sheet.faqs, wide ? FAQ_PER_SLIDE.wide : FAQ_PER_SLIDE.compact);
  faqGroups.forEach((group, i) =>
    slides.push({
      key: `dudas-${i}`,
      eyebrow: "Preguntas",
      title: faqGroups.length > 1 ? `Dudas frecuentes ${i + 1} de ${faqGroups.length}` : "Dudas frecuentes",
      blocks: [`dudas-${i}`],
    }),
  );

  const last = slides.length - 1;
  const current = slides[Math.min(page, last)];

  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) setPage(0);
  };

  const BLOCKS: Record<string, ReactNode> = {
    stats: (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat icon={CalendarDays} label="Fecha" value={<span className="capitalize">{dateLabel}</span>} />
        <Stat icon={Waves} label="Precio" value={priceLabel} hint="por persona · señal del 30 %" />
        <Stat
          icon={Users}
          label="Plazas libres"
          value={event.isFull ? "Sin plazas" : event.freeSeats}
          hint={event.isFull ? undefined : `grupo: ${sheet.group || "consultar"}`}
        />
      </div>
    ),

    resumen: sheet.summary && (
      <p className="rounded-2xl border border-border/60 bg-card/60 p-3 text-sm leading-relaxed text-muted-foreground sm:p-4">
        {sheet.summary}
      </p>
    ),

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

    salidaA: (
      <div className="grid grid-cols-2 gap-2">
        <Stat
          icon={MapPin}
          label="Punto de encuentro"
          value={<span className="text-base">{sheet.meetingPoint || "—"}</span>}
          className="col-span-2"
        />
        <Stat icon={Clock} label="Duración total" value={sheet.duration || "—"} />
        <Stat icon={Timer} label="Actividad efectiva" value={sheet.effectiveDuration || "—"} />
      </div>
    ),

    salidaB: (
      <div className="grid grid-cols-2 gap-2">
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
          className="col-span-2"
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

    includesOnly: <Checklist icon={PackageCheck} title="Incluye" items={sheet.includes} />,
    bringOnly: <Checklist icon={Backpack} title="Qué llevar" items={sheet.bring} />,

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
            <div className="relative px-4 pb-3 pt-8 sm:px-6 sm:pb-4 sm:pt-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:px-3 sm:py-1 sm:text-[11px]">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {p?.categoryLabel ?? event.category}
              </span>
              <DialogTitle className="mt-1.5 font-heading text-lg font-extrabold leading-tight text-foreground sm:text-2xl">
                {sheet.title}
              </DialogTitle>
              {sheet.summary && (
                <DialogDescription className="mt-1 hidden text-sm text-muted-foreground sm:block">
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
              className="animate-in fade-in-0 slide-in-from-right-2 space-y-3 px-4 py-4 duration-300 sm:px-6 sm:py-5"
            >
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
                    {current.eyebrow}
                  </p>
                  <h3 className="mt-0.5 font-heading text-xl font-extrabold leading-tight text-foreground sm:text-2xl">
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
          <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
              <div className="flex items-center gap-2">
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
                {page < last ? (
                  <Button
                    size="sm"
                    onClick={() => setPage((v) => Math.min(last, v + 1))}
                    className="transition-all duration-300 active:scale-95"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                      Cerrar
                    </Button>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
