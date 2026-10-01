import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  MessageCircle,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { climbingLevels, climbingPath, climbingPractices, type ClimbingLevel } from "@/data/climbingTraining";

const WHATSAPP_NUMBER = "34685609542";

const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

function LevelCard({ level }: { level: ClimbingLevel }) {
  const message = `Hola, quiero consultar la formación propia NSL ${level.code}: ${level.title}. Me gustaría conocer próximas fechas, precio y valoración inicial.`;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-xl font-extrabold text-primary-foreground">
            {level.code}
          </span>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-right text-xs font-semibold text-secondary-foreground">
            Fechas y precio bajo consulta
          </span>
        </div>
        <h3 className="font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">{level.title}</h3>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />Duración orientativa: {level.duration}</span>
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Máximo 6 · ajustado al contenido</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="mb-3 text-xs font-bold uppercase text-primary">Al terminar podrás</p>
        <ul className="space-y-3">
          {level.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-3 text-sm leading-6 text-card-foreground">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-md bg-secondary p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Acceso</p>
          <p className="mt-1 text-sm leading-6 text-secondary-foreground">{level.access}</p>
        </div>

        <Accordion type="multiple" className="mt-4 border-t border-border">
          <AccordionItem value="programa">
            <AccordionTrigger className="text-left text-sm">Programa</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-muted-foreground">
                {level.contents.map((content) => <li key={content}>• {content}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="evaluacion">
            <AccordionTrigger className="text-left text-sm">Evaluación y continuidad</AccordionTrigger>
            <AccordionContent className="space-y-2 text-muted-foreground">
              <p>{level.assessment}</p>
              <p><strong className="text-foreground">Siguiente:</strong> {level.next}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="organizacion">
            <AccordionTrigger className="text-left text-sm">Material y organización</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Se concretan en la propuesta del curso.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button variant="hero" className="mt-5 w-full gap-2" asChild>
          <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Consultar {level.code}
          </a>
        </Button>
      </div>
    </article>
  );
}

const experienceOptions = [
  { value: "primera-vez", label: "Es mi primera vez" },
  { value: "supervision", label: "He escalado con supervisión" },
  { value: "primero", label: "Escalo de primero y aseguro" },
  { value: "perfeccionar", label: "Quiero perfeccionar" },
] as const;

const goalOptions = [
  { value: "experiencia", label: "Experiencia guiada" },
  { value: "formacion", label: "Formación" },
  { value: "practicas", label: "Prácticas" },
] as const;

export function ClimbingOrientation() {
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");

  const recommendation = useMemo(() => {
    if (!experience || !goal) return null;
    if (goal === "experiencia") return "Una experiencia guiada es el punto de partida más directo.";
    if (goal === "practicas") return "Una sesión tutorizada puede ayudarte a practicar con un objetivo concreto.";
    if (experience === "primera-vez" || experience === "supervision") return "E1 es la referencia inicial más prudente.";
    if (experience === "primero") return "E2 podría encajar, siempre con valoración práctica previa.";
    return "E3 podría encajar, siempre con experiencia reciente y valoración práctica previa.";
  }, [experience, goal]);

  const experienceLabel = experienceOptions.find((option) => option.value === experience)?.label;
  const goalLabel = goalOptions.find((option) => option.value === goal)?.label;
  const message = `Hola, busco orientación en escalada deportiva. Experiencia: ${experienceLabel ?? "sin seleccionar"}. Objetivo: ${goalLabel ?? "sin seleccionar"}. Nivel de interés orientativo: ${recommendation ?? "por valorar"}.`;

  return (
    <section id="orientacion" className="scroll-mt-28 border-y border-border bg-secondary py-16 sm:py-20" aria-labelledby="orientation-title">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-primary">Orientación inicial</p>
          <h2 id="orientation-title" className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Encuentra tu punto de partida</h2>
          <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
            Dos elecciones bastan para proponerte un siguiente paso. No es una asignación de nivel ni una certificación.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">No solicitamos datos de salud ni información personal.</p>
        </div>

        <div className="rounded-md border border-border bg-card p-5 sm:p-7">
          <fieldset>
            <legend className="font-heading text-lg font-bold text-card-foreground">1. Tu experiencia</legend>
            <RadioGroup value={experience} onValueChange={setExperience} className="mt-4 grid gap-3 sm:grid-cols-2">
              {experienceOptions.map((option) => (
                <Label key={option.value} htmlFor={`experience-${option.value}`} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-4 text-sm text-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                  <RadioGroupItem id={`experience-${option.value}`} value={option.value} />{option.label}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="font-heading text-lg font-bold text-card-foreground">2. Tu objetivo</legend>
            <RadioGroup value={goal} onValueChange={setGoal} className="mt-4 grid gap-3 sm:grid-cols-3">
              {goalOptions.map((option) => (
                <Label key={option.value} htmlFor={`goal-${option.value}`} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-4 text-sm text-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                  <RadioGroupItem id={`goal-${option.value}`} value={option.value} />{option.label}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {recommendation && (
            <div role="status" className="mt-6 border-l-4 border-primary bg-primary/10 p-4">
              <p className="text-xs font-bold uppercase text-primary">Recomendación orientativa</p>
              <p className="mt-1 font-semibold leading-6 text-foreground">{recommendation}</p>
              <p className="mt-2 text-sm text-muted-foreground">E2 y E3 requieren siempre valoración práctica.</p>
            </div>
          )}

          <Button variant="hero" className="mt-6 w-full gap-2 sm:w-auto" disabled={!recommendation} asChild={Boolean(recommendation)}>
            {recommendation ? (
              <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Comentar mi orientación</a>
            ) : (
              <span><Target className="h-4 w-4" />Elige las dos opciones</span>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ClimbingTrainingPath() {
  return (
    <section id="formacion" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="training-title">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase text-primary">Formación propia NSL</p>
          <h2 id="training-title" className="font-heading text-3xl font-extrabold text-foreground sm:text-5xl">Aprende paso a paso</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Un recorrido progresivo para vías equipadas de un largo, con práctica entre niveles y avance basado en competencias observadas.
          </p>
        </div>

        <ol aria-label="Itinerario formativo" className="mt-9 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {climbingPath.map((step, index) => (
            <li key={`${step}-${index}`} className="relative flex min-h-20 items-center justify-center rounded-md border border-border bg-secondary px-3 text-center font-heading text-sm font-bold text-secondary-foreground">
              <span>{step}</span>
              {index < climbingPath.length - 1 && <ChevronRight className="absolute -right-3 z-10 hidden h-5 w-5 text-primary lg:block" />}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {climbingLevels.map((level) => <LevelCard key={level.code} level={level} />)}
        </div>

        <div className="mt-8 grid gap-5 border-y border-border py-7 md:grid-cols-3">
          <div className="flex gap-3"><ClipboardCheck className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-heading font-bold">Progreso por competencias</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Se observa lo que haces y cómo aplicas los protocolos, no solo las horas o el grado.</p></div></div>
          <div className="flex gap-3"><RefreshCw className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-heading font-bold">Práctica entre niveles</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Consolidar antes de avanzar forma parte del itinerario.</p></div></div>
          <div className="flex gap-3"><Award className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-heading font-bold">Alcance claro</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Puede documentarse asistencia y competencias observadas; no es una certificación profesional, federativa u homologada.</p></div></div>
        </div>

        <div className="mt-8 rounded-md border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">Itinerarios adicionales</p>
              <h3 className="mt-2 font-heading text-xl font-bold">Varios largos equipados y autoprotección</h3>
              <p className="mt-2 leading-7 text-muted-foreground">Se estudian aparte, bajo consulta y con profesorado específico. No forman parte automática de E3.</p>
            </div>
            <Button variant="outline" className="shrink-0 gap-2" asChild>
              <a href={whatsappUrl("Hola, quiero consultar un itinerario adicional de escalada: varios largos equipados o autoprotección.")} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Consultar itinerario</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClimbingPractices() {
  return (
    <section id="practicas" className="scroll-mt-24 bg-secondary py-16 sm:py-24" aria-labelledby="practices-title">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase text-primary">Sesiones tutorizadas</p>
          <h2 id="practices-title" className="font-heading text-3xl font-extrabold text-foreground sm:text-5xl">Practica y perfecciona</h2>
          <p className="mt-4 leading-7 text-muted-foreground">Sesiones con un objetivo concreto para consolidar, reciclar o seguir progresando.</p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {climbingPractices.map((practice, index) => {
            const Icon = [Sparkles, Users, ShieldCheck][index];
            return (
              <article key={practice.title} className="rounded-md border border-border bg-card p-6">
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-5 font-heading text-xl font-bold text-card-foreground">{practice.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{practice.description}</p>
                <Button variant="outline" className="mt-6 w-full gap-2" asChild>
                  <a href={whatsappUrl(`Hola, quiero consultar una sesión de ${practice.title.toLowerCase()} en escalada deportiva.`)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Consultar sesión</a>
                </Button>
              </article>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-heading font-bold text-foreground">Preparación física complementaria</p><p className="mt-1 text-sm text-muted-foreground">Vértigo Sapiens puede complementar tu preparación, pero no es un requisito.</p></div>
          <Button variant="ghost" className="justify-start gap-2 text-primary" asChild><Link to="/vertigo-sapiens">Conocer Vértigo Sapiens <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </section>
  );
}

export function ClimbingSectionNav() {
  const links = [
    { href: "#experiencias", icon: Route, eyebrow: "Vive", title: "Experiencias guiadas", text: "Encuentra una escuela y una salida para tu nivel." },
    { href: "#formacion", icon: Award, eyebrow: "Aprende", title: "Itinerario E1–E3", text: "Avanza por competencias con práctica entre niveles." },
    { href: "#practicas", icon: Target, eyebrow: "Progresa", title: "Prácticas tutorizadas", text: "Consolida técnica, cordada y maniobras." },
  ];
  return (
    <nav aria-label="Secciones de escalada" className="relative z-20 -mt-12">
      <div className="container mx-auto grid gap-3 px-4 md:grid-cols-3">
        {links.map(({ href, icon: Icon, eyebrow, title, text }) => (
          <a key={href} href={href} className="group flex min-h-36 items-start gap-4 rounded-md border border-border bg-card p-5 shadow-card hover:-translate-y-1 hover:border-primary">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
            <span><span className="text-xs font-bold uppercase text-primary">{eyebrow}</span><strong className="mt-1 block font-heading text-lg text-card-foreground">{title}</strong><span className="mt-2 block text-sm leading-5 text-muted-foreground">{text}</span></span>
          </a>
        ))}
      </div>
    </nav>
  );
}