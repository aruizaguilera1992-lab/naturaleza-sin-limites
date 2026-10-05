import { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  Gauge,
  Grip,
  LineChart,
  Mountain,
  Route,
  ShieldCheck,
  Target,
  Timer,
  TrendingUp,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import athleteImage from '@/assets/atleta-reto-naturaleza.jpg';
import coachImage from '@/assets/founder-antonio.png';
import { OnlineRequestForm } from './OnlineRequestForm';
import { saveVertigoAssessment, type VertigoAssessment } from './assessment';

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
    <span aria-hidden className="h-px w-8 bg-primary" />{children}
  </p>
);

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function OnlineHero() {
  return (
    <section className="relative flex min-h-[760px] items-end overflow-hidden border-b border-border pt-40 sm:min-h-[820px] sm:pt-44 lg:min-h-[900px]">
      <img
        src={athleteImage}
        alt="Deportista progresando por terreno de montaña al atardecer"
        width={1408}
        height={1008}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center] motion-safe:animate-[nsl-hero-drift_18s_ease-in-out_infinite_alternate]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      <div className="container relative mx-auto px-4 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-4xl">
          <Eyebrow>Vértigo Sapiens · preparación física online</Eyebrow>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.04] sm:text-6xl lg:text-7xl">
            Entrena para la montaña.<br /><span className="text-primary">No solo para el gimnasio.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/80 sm:text-xl sm:leading-8">
            Preparación física para deportes verticales. Evalúa tu nivel, entrena tus limitantes y mide tu progreso.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" onClick={() => go('test-vertigo')}>Evaluar mi nivel <ArrowRight /></Button>
            <Button variant="heroOutline" size="xl" onClick={() => go('metodo')}>Ver cómo funciona <ArrowDown /></Button>
          </div>
          <ul className="mt-9 flex flex-wrap gap-2" aria-label="Características del programa">
            {['Online', '8 semanas', 'Fuerza + resistencia + movilidad'].map((item) => (
              <li key={item} className="border border-foreground/20 bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md sm:text-sm">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const problemItems = [
  { icon: Timer, text: 'Te falta resistencia antes de terminar.' },
  { icon: Grip, text: 'Los brazos se congestionan demasiado pronto.' },
  { icon: TrendingUp, text: 'Las piernas no responden en desniveles.' },
  { icon: Dumbbell, text: 'Tu fuerza de gimnasio no llega al terreno.' },
  { icon: Route, text: 'La progresión vertical te fatiga demasiado.' },
  { icon: Gauge, text: 'Entrenas, pero no sabes si mejoras.' },
];

export function OnlineProblem() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <Eyebrow>¿Te pasa esto en montaña?</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Tu limitante aparece cuando el terreno exige más.</h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {problemItems.map(({ icon: Icon, text }) => (
              <article key={text} className="min-h-36 bg-card p-5 sm:p-6">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <p className="mt-5 font-semibold leading-6">{text}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-10 border-l-4 border-primary pl-5 text-xl font-bold sm:ml-auto sm:max-w-3xl sm:text-2xl">
          No necesitas entrenar más. Necesitas entrenar lo que realmente limita tu rendimiento.
        </p>
      </div>
    </section>
  );
}

const disciplines = ['Barranquismo', 'Espeleología', 'Escalada', 'Vías ferratas', 'Montaña'];
const limitations = ['Resistencia', 'Agarre y brazos', 'Piernas y desnivel', 'Movilidad', 'Core y estabilidad', 'No lo tengo claro'];
const availability = ['2 días por semana', '3 días por semana', '4 o más días por semana', 'Aún no lo sé'];

function ChoiceGroup({ legend, value, options, onChange }: { legend: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={value === option ? 'default' : 'secondary'}
            size="sm"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className="normal-case tracking-normal"
          >
            {value === option && <Check className="h-4 w-4" />}{option}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export function VertigoTest() {
  const [answers, setAnswers] = useState<VertigoAssessment>({ disciplina: '', limitacion: '', disponibilidad: '' });
  const complete = Boolean(answers.disciplina && answers.limitacion && answers.disponibilidad);

  const update = (key: keyof VertigoAssessment, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const finish = () => {
    if (!complete) return;
    saveVertigoAssessment(answers);
    go('solicitud');
  };

  return (
    <section id="test-vertigo" className="scroll-mt-28 border-y border-border bg-card py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <Eyebrow>Test Vértigo</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Descubre qué está limitando tu rendimiento en montaña.</h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">Una primera orientación para ordenar tu punto de partida antes de solicitar la evaluación.</p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-foreground/70">
              {['Fuerza relativa', 'Agarre', 'Resistencia muscular', 'Pierna', 'Core', 'Movilidad', 'Capacidad aeróbica', 'Objetivo'].map((item) => (
                <span key={item} className="border border-border px-3 py-1.5">{item}</span>
              ))}
            </div>
            <p className="mt-6 text-xs leading-5 text-muted-foreground">Orientación física inicial. No es un diagnóstico médico ni una evaluación de seguridad en montaña.</p>
          </div>
          <div className="border-t-4 border-primary bg-background p-5 shadow-card sm:p-8">
            <div className="space-y-7">
              <ChoiceGroup legend="1. Disciplina principal" value={answers.disciplina} options={disciplines} onChange={(value) => update('disciplina', value)} />
              <ChoiceGroup legend="2. Principal limitación percibida" value={answers.limitacion} options={limitations} onChange={(value) => update('limitacion', value)} />
              <ChoiceGroup legend="3. Días disponibles por semana" value={answers.disponibilidad} options={availability} onChange={(value) => update('disponibilidad', value)} />
            </div>
            <Button type="button" variant="hero" size="lg" className="mt-8 w-full" disabled={!complete} onClick={finish}>
              Solicitar mi evaluación <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const methodSteps = [
  { n: '01', icon: ClipboardCheck, title: 'Evalúa', text: 'Punto de partida, disciplina y objetivo.' },
  { n: '02', icon: Target, title: 'Programa', text: 'Plan según nivel, tiempo y material.' },
  { n: '03', icon: LineChart, title: 'Mide', text: 'Registro, revisiones y seguimiento.' },
  { n: '04', icon: Mountain, title: 'Transfiere', text: 'Entrenamiento pensado desde la montaña.' },
];

export function OnlineMethod() {
  return (
    <section id="metodo" className="scroll-mt-28 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <Eyebrow>El método</Eyebrow>
          <h2 className="text-3xl font-extrabold sm:text-5xl">Del punto de partida al terreno real.</h2>
        </div>
        <ol className="relative mt-12 grid gap-4 md:grid-cols-4 md:gap-0">
          <div aria-hidden className="absolute left-0 right-0 top-8 hidden h-px bg-border md:block" />
          {methodSteps.map(({ n, icon: Icon, title, text }) => (
            <li key={n} className="relative border border-border bg-background p-6 md:border-r-0 md:last:border-r">
              <span className="relative z-10 flex h-16 w-16 items-center justify-center bg-primary text-lg font-extrabold text-primary-foreground">{n}</span>
              <Icon className="mt-8 h-7 w-7 text-primary" aria-hidden />
              <h3 className="mt-4 text-xl font-extrabold uppercase">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">El programa es online y no incluye salidas ni sesiones presenciales.</p>
      </div>
    </section>
  );
}

const transferItems = [
  ['Tracción y progresión', 'Fuerza útil cuando el terreno se vuelve vertical.'],
  ['Jornadas largas', 'Resistencia para sostener el esfuerzo.'],
  ['Posiciones exigentes', 'Movilidad para moverte con más recursos.'],
  ['Terreno irregular', 'Core y estabilidad para controlar cada apoyo.'],
];

export function OnlineTransfer() {
  return (
    <section className="overflow-hidden border-y border-border bg-card">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[680px]">
          <img src="/images/rope-detail-documentary.jpg" alt="Manos controlando una cuerda durante una maniobra vertical" width={1200} height={1800} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 max-w-sm text-2xl font-extrabold sm:bottom-10 sm:left-10 sm:text-4xl">Lo que entrenas debe aparecer cuando lo necesitas.</p>
        </div>
        <div className="flex items-center px-4 py-16 sm:px-10 lg:px-16 lg:py-24">
          <div className="max-w-xl">
            <Eyebrow>Del gimnasio a la montaña</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Entrenar capacidades. Transferirlas al terreno.</h2>
            <div className="mt-10 divide-y divide-border border-y border-border">
              {transferItems.map(([title, text], index) => (
                <div key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                  <span className="font-extrabold text-primary">0{index + 1}</span>
                  <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
                </div>
              ))}
            </div>
            <p className="mt-7 text-sm leading-6 text-muted-foreground">Adaptado a barranquismo, espeleología, vías ferratas, escalada recreativa y montaña.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const disciplineData = [
  { id: 'barranquismo', label: 'Barranquismo', icon: Waves, demands: ['Piernas', 'Resistencia', 'Estabilidad', 'Aproximaciones'] },
  { id: 'espeleologia', label: 'Espeleología', icon: Mountain, demands: ['Tracción', 'Agarre', 'Progresión por cuerda', 'Movilidad', 'Jornadas largas'] },
  { id: 'escalada', label: 'Escalada', icon: Grip, demands: ['Fuerza relativa', 'Agarre', 'Tracción', 'Movilidad', 'Resistencia específica'] },
  { id: 'ferratas', label: 'Vías ferratas', icon: Zap, demands: ['Agarre', 'Tracción', 'Resistencia', 'Exposición'] },
  { id: 'montana', label: 'Montaña', icon: Route, demands: ['Capacidad aeróbica', 'Piernas', 'Estabilidad', 'Desnivel'] },
];

export function OnlineDisciplines() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <Eyebrow>Un sistema, distintas demandas</Eyebrow>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Tu disciplina marca el rumbo.</h2>
          <p className="mt-4 text-muted-foreground">Vértigo Sapiens no son cinco productos: es un sistema que se adapta a lo que practicas.</p>
        </div>
        <Tabs defaultValue="barranquismo" className="mt-10">
          <TabsList aria-label="Disciplinas" className="grid h-auto w-full grid-cols-2 gap-1 bg-card p-1 sm:grid-cols-5">
            {disciplineData.map((item) => <TabsTrigger key={item.id} value={item.id} className="min-h-12 whitespace-normal px-2 py-3">{item.label}</TabsTrigger>)}
          </TabsList>
          {disciplineData.map(({ id, label, icon: Icon, demands }) => (
            <TabsContent key={id} value={id} className="mt-4 border border-border bg-card p-6 sm:p-10">
              <div className="grid gap-8 sm:grid-cols-[0.55fr_1.45fr] sm:items-center">
                <div><Icon className="h-10 w-10 text-primary" aria-hidden /><h3 className="mt-4 text-2xl font-extrabold">{label}</h3></div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {demands.map((demand) => <li key={demand} className="flex items-center gap-3 border-b border-border pb-3 font-semibold"><ChevronRight className="h-4 w-4 text-primary" aria-hidden />{demand}</li>)}
                </ul>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

const profileBars = [
  ['Fuerza', 'w-[78%]'], ['Resistencia', 'w-[66%]'], ['Movilidad', 'w-[54%]'], ['Agarre', 'w-[72%]'], ['Core / estabilidad', 'w-[82%]'], ['Capacidad aeróbica', 'w-[62%]'],
];

export function VertigoProfile() {
  return (
    <section className="border-y border-border bg-card py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Perfil Vértigo</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Lo que observas, lo puedes entrenar con más criterio.</h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">El seguimiento ayuda a ver qué dimensiones necesitan atención y cómo evoluciona el bloque de trabajo.</p>
          </div>
          <div className="border border-border bg-background p-5 sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Perfil Vértigo</p><p className="mt-1 text-sm text-muted-foreground">Ejemplo visual del seguimiento</p></div>
              <Activity className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <div className="mt-7 space-y-5">
              {profileBars.map(([label, widthClass]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm font-semibold"><span>{label}</span><span aria-hidden className="text-muted-foreground">Referencia visual</span></div>
                  <div className="h-2 overflow-hidden bg-muted"><div className={`h-full bg-primary ${widthClass}`} /></div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Datos ilustrativos: no representan a una persona ni prometen un resultado.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const included = [
  'Evaluación inicial a distancia', 'Plan semanal adaptado', 'Vídeos explicativos', 'Registro semanal', 'Revisión quincenal', 'Hasta 2 vídeos al mes', 'Revisión final',
];
const excluded = ['Sesiones presenciales', 'Salidas outdoor', 'Asesoramiento nutricional', 'Mensajería ilimitada', 'Cursos técnicos o evaluación de seguridad'];

export function OnlineProgram() {
  return (
    <section id="programa" className="py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="overflow-hidden border border-primary/40 bg-card shadow-card lg:grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between bg-primary p-7 text-primary-foreground sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Programa online</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Vértigo Sapiens Online · 8 semanas</h2>
            </div>
            <div className="mt-10">
              <p className="text-5xl font-extrabold">179 €</p>
              <p className="mt-2 font-semibold">8 semanas · pago único propuesto</p>
            </div>
          </div>
          <div className="p-6 sm:p-10">
            <div className="grid gap-8 sm:grid-cols-2">
              <div><h3 className="font-bold">Incluye</h3><ul className="mt-4 space-y-3 text-sm">{included.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{item}</li>)}</ul></div>
              <div><h3 className="font-bold">No incluye</h3><ul className="mt-4 space-y-3 text-sm text-muted-foreground">{excluded.map((item) => <li key={item} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{item}</li>)}</ul></div>
            </div>
            <p className="mt-8 border-l-2 border-primary pl-4 text-sm leading-6">Solicitud de información sin pago ni compromiso. El precio final y la disponibilidad se confirmarán antes de contratar.</p>
            <Button variant="hero" size="lg" className="mt-7 w-full sm:w-auto" onClick={() => go('solicitud')}>Solicitar mi evaluación <ArrowRight /></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OnlineCoach() {
  return (
    <section className="overflow-hidden border-y border-border bg-card">
      <div className="container mx-auto px-4 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden border border-border bg-background">
            <img src={coachImage} alt="Antonio Ruiz Aguilera en una pared de roca durante una actividad vertical" width={625} height={691} loading="lazy" className="h-full w-full object-cover object-center" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>
          <div>
            <Eyebrow>Entrenador</Eyebrow>
            <h2 className="text-3xl font-extrabold sm:text-5xl">Antonio Ruiz Aguilera</h2>
            <p className="mt-6 max-w-2xl text-xl font-bold leading-8">Preparación diseñada desde las exigencias reales de la montaña.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex gap-3"><Award className="h-6 w-6 shrink-0 text-primary" aria-hidden /><span><strong>Máster</strong> en Entrenamiento Deportivo-Físico.</span></li>
              <li className="flex gap-3"><ShieldCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden /><span><strong>Técnico Deportivo</strong> en Espeleología (TD2).</span></li>
              <li className="flex gap-3"><Mountain className="h-6 w-6 shrink-0 text-primary" aria-hidden /><span>Experiencia real en montaña y actividades verticales.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: '¿Es completamente online?', a: 'Sí. Evaluación, planificación y revisiones se realizan a distancia. No incluye sesiones presenciales.' },
  { q: '¿Necesito gimnasio?', a: 'No necesariamente. El plan se adapta al material disponible en gimnasio, casa o parque.' },
  { q: '¿Qué material necesito?', a: 'Depende de tu disciplina y objetivo. Se concreta en la evaluación inicial antes de empezar.' },
  { q: '¿Incluye salidas o formación técnica?', a: 'No. Las salidas guiadas, cursos y maniobras técnicas quedan fuera del programa online.' },
  { q: '¿Cómo se revisan los ejercicios?', a: 'Puedes enviar hasta 2 vídeos al mes. El canal de envío se confirma antes de contratar.' },
  { q: '¿Qué ocurre después de 8 semanas?', a: 'Recibes una revisión final. Cualquier opción de continuidad se explicará antes de terminar.' },
];

export function OnlineFAQ() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto max-w-4xl px-4">
        <Eyebrow>Antes de empezar</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-5xl">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="mt-10 border-t border-border">
          {faqs.map((faq, index) => <AccordionItem key={faq.q} value={`faq-${index}`}><AccordionTrigger className="py-5 text-left text-base sm:text-lg">{faq.q}</AccordionTrigger><AccordionContent className="max-w-2xl pb-5 leading-7 text-muted-foreground">{faq.a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </div>
    </section>
  );
}

export function OnlineFinalCTA() {
  return (
    <section id="solicitud" className="scroll-mt-28 border-t border-border bg-card py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <Eyebrow>Tu punto de partida</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Empieza por saber qué te limita.</h2>
            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">Cuéntame qué practicas, cuál es tu objetivo y cuánto tiempo puedes entrenar. Revisaré tu caso antes de proponerte el siguiente paso.</p>
            <div className="mt-8 flex items-start gap-3 border-l-2 border-primary pl-4 text-sm text-foreground/80"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden /><span>Sin pago ni compromiso. Primero revisamos si el programa encaja contigo.</span></div>
          </div>
          <OnlineRequestForm />
        </div>
      </div>
    </section>
  );
}