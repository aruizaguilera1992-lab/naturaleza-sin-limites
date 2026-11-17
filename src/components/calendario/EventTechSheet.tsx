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
import { MeetingPointActions, MeetingPointLabel } from "@/components/shared/MeetingPoint";
import { useMeetingPointTarget } from "@/hooks/useMeetingPointTarget";
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

/** Etiqueta del párrafo de apertura de la descripción. */
const DESC_LABELS = ["La salida"];

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

const chunkEven = <T,>(items: T[], maxPer: number): T[][] => {
  const groups = Math.max(1, Math.ceil(items.length / maxPer));
  const out: T[][] = [];
  let at = 0;
  for (let g = 0; g < groups; g++) {
    const size = Math.ceil((items.length - at) / (groups - g));
    out.push(items.slice(at, at + size));
    at += size;
  }
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
        "flex min-w-0 flex-col items-center gap-0.5 rounded-2xl border border-border/60 bg-secondary/40 px-2 py-0.5 text-center sm:py-1",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-heading text-[12px] font-extrabold leading-tight text-foreground sm:text-xl">
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
    <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-2 sm:p-2.5">
      <h4 className="mb-1 flex items-center gap-2 font-heading text-[12px] font-bold text-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        {title}
      </h4>
      <ol className="space-y-0.5">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground"
          >
            {numbered ? (
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-extrabold text-primary">
                {i + 1}
              </span>
            ) : (
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
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
    <section className="min-w-0 rounded-2xl border border-border/60 bg-secondary/30 p-2 sm:p-2.5">
      <h4 className="mb-0.5 flex items-center gap-2 font-heading text-[12px] font-bold text-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        {title}
      </h4>
      <p className="text-[11px] leading-snug text-muted-foreground">{text}</p>
    </section>
  );
}

/** Preguntas y respuestas de la actividad. */
function Faqs({
  items,
  columns,
}: {
  items: { question: string; answer: string }[];
  columns?: boolean;
}) {
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

/** Párrafos de lectura de un tamaño parecido. */
function packParagraphs(text: string, maxChars: number): string[] {
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  let current = "";
  for (const s of sentences) {
    if (current && current.length + s.length > maxChars) {
      out.push(current);
      current = "";
    }
    current = current ? `${current} ${s}` : s;
  }
  if (current) out.push(current);
  return out;
}

type ListBlock = {
  kind: "list";
  label?: string;
  intro?: string;
  items: { title: string; body: string }[];
};
type DescBlock = { kind: "text"; text: string } | ListBlock;

/** Separa la descripción en párrafos cortos y una lista de características. */
function readDescription(
  text: string,
  maxChars: number,
): { paragraphs: string[]; list?: ListBlock } {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { paragraphs: [] };

  const chunks = clean.split("•").map((c) => c.trim()).filter(Boolean);
  const hasBullets = chunks.length > 1;
  let lead = hasBullets ? chunks[0] : clean;
  let listLabel: string | undefined;

  if (hasBullets) {
    const m = lead.match(/\s*([^.•:]{2,40}):\s*$/);
    if (m) {
      listLabel = m[1].trim();
      lead = lead.slice(0, m.index).trim();
    }
  }

  const paragraphs = packParagraphs(lead, maxChars);

  const list: ListBlock | undefined = hasBullets
    ? {
        kind: "list",
        label: listLabel,
        items: chunks.slice(1).map((raw) => {
          const t = raw.trim();
          const dot = t.search(/\.\s/);
          const title = dot > 0 && dot <= 45 ? t.slice(0, dot).trim() : "";
          return { title, body: title ? t.slice(dot + 1).trim() : t };
        }),
      }
    : undefined;

  return { paragraphs, list };
}

/** Descripción de la ficha, maquetada en bloques cortos y etiquetados. */
function Description({ blocks, labels = [] }: { blocks: DescBlock[]; labels?: string[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {blocks.map((b, i) => {
        const label = labels[i] ?? (b.kind === "list" ? b.label : undefined);
        return (
          <section
            key={`${b.kind}-${i}`}
            className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-2 sm:p-3"
          >
            {label ? (
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
                {label}
              </p>
            ) : null}
            {b.kind === "text" ? (
              <p
                className={cn(
                  "mt-0.5 max-w-[80ch] text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]",
                  i === 0 && "text-foreground",
                )}
              >
                {b.text}
              </p>
            ) : (
              <>
                {b.intro ? (
                  <p className="mt-0.5 max-w-[80ch] text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                    {b.intro}
                  </p>
                ) : null}
                <ul className="mt-1 space-y-1">
                  {b.items.map((it, j) => (
                    <li
                      key={`${it.title}-${j}`}
                      className="flex gap-1.5 text-[12px] leading-snug text-muted-foreground sm:text-[13px]"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span className="max-w-[80ch]">
                        {it.title ? (
                          <b className="font-semibold text-foreground">{it.title}. </b>
                        ) : null}
                        {it.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Punto de encuentro visible, con acceso directo a Google Maps y Apple Maps. */
function MeetingSpot({ text }: { text: string }) {
  const target = useMeetingPointTarget(text);
  if (!text.trim()) return null;
  return (
    <section className="min-w-0 rounded-2xl border border-primary/25 bg-primary/5 p-2 sm:p-2.5">
      <p className="flex items-start gap-1.5">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
            Punto de encuentro
          </span>
          <span className="mt-0.5 block text-[12px] font-semibold leading-snug text-foreground sm:text-[13px]">
            <MeetingPointLabel text={text} target={target} />
          </span>
        </span>
      </p>
      <MeetingPointActions text={text} target={target} className="mt-1.5 flex flex-wrap gap-1.5 pl-5" />
    </section>
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
  const desc = readDescription(sheet.description, wide ? 200 : 200);
  const listMax = wide ? 2 : 2;
  const listShown = desc.list
    ? { ...desc.list, items: desc.list.items.slice(0, listMax) }
    : undefined;
  const listRest =
    desc.list && desc.list.items.length > listMax
      ? { ...desc.list, items: desc.list.items.slice(listMax) }
      : undefined;
  const descShown: DescBlock[] = [
    ...(desc.paragraphs[0] ? [{ kind: "text", text: desc.paragraphs[0] } as DescBlock] : []),
    ...(listShown ? [listShown] : []),
  ];
  const extraParas = desc.paragraphs.slice(1);
  const descRest: DescBlock[] = listRest
    ? [
        { ...listRest, intro: extraParas[0] },
        ...extraParas.slice(1).map((t) => ({ kind: "text", text: t }) as DescBlock),
      ]
    : extraParas.map((t) => ({ kind: "text", text: t }) as DescBlock);

  /* ---- Diapositivas: se arman según la pantalla y los datos que existen ---- */
  const faqGroups = chunkEven(sheet.faqs, wide ? FAQ_PER_SLIDE.wide : FAQ_PER_SLIDE.compact);

  const slides: Slide[] = [
    {
      key: "portada",
      eyebrow: "Salida programada",
      title: "Ficha de la actividad",
      blocks: ["stats", "meeting", "descripcion"],
    },
    ...(descRest.length > 0
      ? [
          {
            key: "detalle",
            eyebrow: "La actividad",
            title: "En detalle",
            blocks: ["detalle"],
          },
        ]
      : []),
    {
      key: "nivel",
      eyebrow: "Dificultad",
      title: "Nivel y condiciones",
      blocks: ["nivelBig", "experience", "highlights"],
    },
    { key: "salida", eyebrow: "Logística", title: "La salida", blocks: ["meeting", "salidaTiles"] },
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
          hint={
            event.isFull || !wide
              ? undefined
              : `grupo: ${sheet.group || "consultar"}`
          }
        />
      </div>
    ),

    descripcion: <Description blocks={descShown} labels={DESC_LABELS} />,

    meeting: <MeetingSpot text={sheet.meetingPoint} />,

    detalle: <Description blocks={descRest} />,

    highlights:
      sheet.highlights.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {sheet.highlights.map((h, i) => (
            <li
              key={`${h}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-foreground sm:px-3 sm:py-1.5 sm:text-xs"
            >
              <Sparkles className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" aria-hidden="true" />
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
      <p className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-secondary/30 px-3 py-2 text-center text-[12px] font-semibold text-foreground sm:py-3 sm:text-sm">
        <Award className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {sheet.experience}
      </p>
    ),

    salidaTiles: (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat icon={Clock} label="Duración total" value={sheet.duration || "—"} />
        <Stat icon={Timer} label="Actividad efectiva" value={sheet.effectiveDuration || "—"} />
        <Stat icon={CalendarRange} label="Temporada" value={sheet.season || "—"} className="col-span-2" />
        <Stat icon={Users} label="Grupo" value={<span className="text-[13px]">{sheet.group || "—"}</span>} />
        <Stat
          icon={UserCheck}
          label="Ratio guía"
          value={<span className="text-[13px]">{sheet.guideRatio || "—"}</span>}
        />
        <Stat
          icon={Compass}
          label="Aproximación"
          value={<span className="text-[13px]">{sheet.approachReturn || "—"}</span>}
        />
      </div>
    ),

    steps: <Checklist icon={Compass} title="Pasos del recorrido" items={sheet.itinerary} numbered />,

    elements: (
      <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 p-2.5 sm:p-3">
        <h4 className="mb-1.5 flex items-center gap-2 font-heading text-[13px] font-bold text-foreground">
          <Cable className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Elementos técnicos
        </h4>
        <ul className="flex flex-wrap gap-1.5">
          {sheet.technicalElements.map((e, i) => (
            <li
              key={`${e}-${i}`}
              className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold text-foreground sm:px-3 sm:py-1.5 sm:text-xs"
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
      <div className="space-y-1.5">
        <Checklist icon={ShieldCheck} title="Requisitos de seguridad" items={sheet.requirements} />
        <Checklist icon={FileCheck2} title="Seguros y permisos" items={sheet.insurancePermits} />
      </div>
    ),

    policies: (
      <div className="space-y-1.5">
        <Note icon={CloudRain} title="Meteorología" text={sheet.weatherPolicy} />
        <Note icon={CalendarDays} title="Cancelación" text={sheet.cancellationPolicy} />
      </div>
    ),

    rules: <OutingInstructions rules={event.rules} steps={event.steps} />,

    ...Object.fromEntries(
      faqGroups.map((group, i) => [`dudas-${i}`, <Faqs items={group} columns={wide} />]),
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
        <div className="relative flex max-h-[96vh] flex-col">
          {/* Portada fija: foto, disciplina y título */}
          <div className="relative flex min-h-[124px] shrink-0 items-end overflow-hidden border-b border-border sm:min-h-[150px]">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary/60" />
            {image ? (
              <img
                src={image}
                alt={p?.imageAlt ?? sheet.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
            <div className="relative w-full px-4 pb-2 pt-6 sm:px-6 sm:pb-3 sm:pt-7">
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
              className="animate-in fade-in-0 slide-in-from-right-2 space-y-1.5 px-10 py-2 duration-300 sm:space-y-1.5 sm:px-11 sm:py-2.5"
            >
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[10px]">
                    {current.eyebrow}
                  </p>
                  <h3 className="mt-0.5 font-heading text-base font-extrabold leading-tight text-foreground sm:text-xl">
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

          {/* Avance y retroceso en los laterales de la ficha */}
          {page > 0 && (
            <button
              type="button"
              onClick={() => setPage((v) => Math.max(0, v - 1))}
              aria-label="Diapositiva anterior"
              className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border/60 bg-card/85 p-1.5 text-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/60 active:scale-95 sm:left-2"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          )}
          {page < last && (
            <button
              type="button"
              onClick={() => setPage((v) => Math.min(last, v + 1))}
              aria-label="Diapositiva siguiente"
              className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border/60 bg-card/85 p-1.5 text-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/60 active:scale-95 sm:right-2"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          )}

          {/* Pie: datos de decisión + navegación entre diapositivas */}
          <div className="flex shrink-0 flex-col gap-1.5 border-t border-border bg-background px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-muted-foreground sm:text-sm">
              <span className="capitalize sm:hidden">{dateShort}</span>
              <span className="capitalize hidden sm:inline">{dateLabel}</span>
              <span className="mx-1.5 text-muted-foreground/40">·</span>
              <span className="font-heading text-base font-bold text-primary sm:text-lg">
                {priceLabel}
              </span>{" "}
              <span className="whitespace-nowrap text-[11px]">/ persona · señal del 30 %</span>
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
