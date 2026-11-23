import { ArrowDown, ArrowRight, Award, Check, ClipboardCheck, Dumbbell, LineChart, Mountain, ShieldCheck, SlidersHorizontal, Timer, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { OnlineRequestForm } from './OnlineRequestForm';

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
    <span aria-hidden className="h-px w-8 bg-primary" />{children}
  </p>
);

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function OnlineHero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden border-b border-border pt-36 lg:min-h-[860px]">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="container relative mx-auto px-4 pb-12 sm:pb-20 lg:pb-24">
        <div className="max-w-4xl">
          <Eyebrow>Vértigo Sapiens · online</Eyebrow>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            Más fuerza<br />Más movilidad<br />Más resistencia<br /><span className="text-primary">La montaña te espera</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-foreground/85 sm:text-xl">
            Entrenamiento online adaptado a tu disciplina, tu nivel y tu objetivo.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" onClick={() => go('punto-de-partida')}>Encontrar mi punto de partida <ArrowRight /></Button>
            <Button variant="heroOutline" size="xl" onClick={() => go('programa')}>Ver el programa <ArrowDown /></Button>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wider text-foreground/80 sm:text-sm" aria-label="Características del programa">
            {['8 semanas', 'Plan personalizado', 'Seguimiento de Antonio'].map((item) => (
              <li key={item} className="flex items-center gap-2"><span aria-hidden className="h-1.5 w-1.5 bg-primary" />{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const benefits = [
  { icon: Timer, title: 'Resistencia', text: 'Llega entero al final de la jornada: aproximaciones largas, desniveles y horas de actividad sin perder energía.' },
  { icon: Dumbbell, title: 'Fuerza funcional', text: 'Tracción, piernas, core y agarre para trepar, cargar la mochila y moverte con seguridad en cuerda.' },
  { icon: Mountain, title: 'Movilidad y estabilidad', text: 'Articulaciones preparadas para pasos amplios, apoyos inestables y posturas exigentes en roca o cueva.' },
  { icon: LineChart, title: 'Progreso con criterio', text: 'Cada sesión queda registrada para ver tu evolución y ajustar el plan semana a semana.' },
];

const capacityPaths = [
  // Endurance: continuous ascent with successive contour lines.
  ['M12 100 52 74 78 84 122 35 155 55 205 12', 'M12 118 52 92 78 102 122 53 155 73 205 30', 'M12 136 52 110 78 120 122 71 155 91 205 48'],
  // Functional strength: tension through a central grip and two anchors.
  ['M24 18 88 60 M152 18 88 60 M88 60 88 132', 'M64 68 64 94 78 108 100 108 114 94 114 68', 'M24 8v20 M14 18h20 M152 8v20 M142 18h20'],
  // Mobility: articulated movement around a stable triangular base.
  ['M100 18 78 58 110 88 140 126 M78 58 48 90 28 126', 'M28 126h112 M64 126 110 88', 'M124 24a52 52 0 0 1 42 54 M28 48a60 60 0 0 0-10 52'],
  // Progress: a measured staircase with an ascending trajectory.
  ['M18 130h36v-28h38V74h38V46h38V18h32', 'M18 82 54 64 92 48 130 28 168 10', 'M18 144h182'],
];

function CapacityMotif({ index }: { index: number }) {
  return (
    <div aria-hidden="true" className="relative mb-6 flex h-36 items-center justify-center border-b border-primary/25 pb-4">
      <svg viewBox="0 0 220 160" fill="none" className="h-full w-full max-w-56 text-primary transition-transform duration-700 motion-safe:group-hover:-translate-y-1">
        <path d="M8 8h18M8 8v18M212 152h-18M212 152v-18" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        {capacityPaths[index]?.map((d, n) => <path key={d} d={d} stroke="currentColor" strokeWidth={n === 0 ? 3 : 1.5} strokeLinecap="round" strokeLinejoin="round" opacity={n === 0 ? 1 : 0.5} />)}
      </svg>
      <span className="absolute bottom-3 right-0 font-heading text-xs font-bold text-primary/70">0{index + 1}</span>
    </div>
  );
}

export function OnlineBenefits() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <Eyebrow>Qué entrenamos</Eyebrow>
        <h2 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">Lo que la montaña te pide.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-6">
              <div className="relative">
                <CapacityMotif index={index} />
                <Icon className="h-9 w-9 text-primary" aria-hidden />
                <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/80">{text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">Objetivos del entrenamiento; los resultados dependen de cada persona.</p>
      </div>
    </section>
  );
}

const pillars = [
  { icon: Mountain, title: 'Tu disciplina', text: 'Barranquismo, espeleología, escalada, ferratas o montaña.' },
  { icon: SlidersHorizontal, title: 'Tu realidad', text: 'Plan adaptado a tu nivel, tiempo y material.' },
  { icon: User, title: 'Tu seguimiento', text: 'Revisiones personales para ajustar el trabajo.' },
];

export function OnlineValue() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card py-20 sm:py-28">
      <div className="container relative mx-auto px-4">
        <h2 className="mx-auto max-w-4xl text-center text-3xl font-extrabold leading-tight sm:text-6xl">
          Tu entrenamiento empieza en <span className="text-primary">lo que te exige la montaña.</span>
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-background/90 p-7 text-center sm:p-10">
              <Icon className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <h3 className="mt-5 text-xl font-extrabold uppercase">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const included = [
  { text: 'Evaluación inicial', icon: ClipboardCheck },
  { text: 'Plan semanal', icon: Dumbbell },
  { text: 'Vídeos de ejercicios', icon: Mountain },
  { text: 'Registro semanal', icon: LineChart },
  { text: 'Revisión quincenal', icon: SlidersHorizontal },
  { text: 'Evaluación final', icon: Award },
];
const excluded = ['Sesiones presenciales', 'Salidas outdoor', 'Asesoramiento nutricional', 'Mensajería ilimitada', 'Cursos técnicos o evaluación de seguridad'];
const details = [
  { q: '¿Necesito gimnasio?', a: 'No necesariamente. El plan se adapta al material que tengas en gimnasio, casa o parque.' },
  { q: '¿Cómo se revisan los ejercicios?', a: 'Puedes enviar hasta 2 vídeos al mes. El canal de envío se confirma antes de contratar.' },
  { q: '¿Qué ocurre tras las 8 semanas?', a: 'Recibes una evaluación final. Cualquier continuidad se explicará antes de terminar.' },
];

export function OnlineProgram() {
  return (
    <section id="programa" className="relative isolate scroll-mt-28 overflow-hidden py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4 text-center">
        <Eyebrow>El programa</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-5xl">Vértigo Sapiens <span className="text-primary">Online</span></h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Claves del programa">
          {['8 semanas', '100 % online', 'Seguimiento 1 a 1'].map((item) => (
            <li key={item} className="rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">{item}</li>
          ))}
        </ul>
        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
          {included.map(({ text, icon: Icon }) => (
            <li key={text} className="flex flex-col items-center gap-3 bg-card/90 p-6 transition-all duration-300 hover:bg-card">
              <Icon className="h-8 w-8 text-primary" aria-hidden />
              <span className="text-sm font-bold uppercase tracking-wide">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button variant="hero" size="lg" className="transition-all duration-300 active:scale-95" onClick={() => go('punto-de-partida')}>Solicitar mi evaluación <ArrowRight /></Button>
          <p className="text-xs text-muted-foreground">Sin pago ni compromiso</p>
        </div>
        <Accordion type="single" collapsible className="mx-auto mt-8 max-w-2xl text-left">
          <AccordionItem value="detalles" className="border-border">
            <AccordionTrigger className="py-4 text-sm font-bold">Detalles y qué no incluye</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {excluded.map((item) => <li key={item} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />No incluye: {item.toLowerCase()}</li>)}
              </ul>
              <dl className="mt-5 space-y-3 text-sm">
                {details.map((d) => <div key={d.q}><dt className="font-bold">{d.q}</dt><dd className="text-muted-foreground">{d.a}</dd></div>)}
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

const methodSteps = [
  { n: '01', icon: ClipboardCheck, title: 'Evalúa', text: 'Partimos de tu nivel y tu objetivo.' },
  { n: '02', icon: Dumbbell, title: 'Entrena', text: 'Sigues tu plan semanal adaptado.' },
  { n: '03', icon: LineChart, title: 'Registra', text: 'Anotas cada sesión y cómo te sientes.' },
  { n: '04', icon: SlidersHorizontal, title: 'Ajusta', text: 'Revisamos y afinamos el trabajo.' },
];

export function OnlineMethod() {
  return (
    <section id="metodo" className="scroll-mt-28 border-y border-border bg-card py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <Eyebrow>Cómo funciona</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-5xl">Cuatro pasos. Ocho semanas.</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {methodSteps.map(({ n, icon: Icon, title, text }) => (
            <li key={n} className="flex gap-5 lg:block">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-primary text-lg font-extrabold text-primary-foreground">{n}</span>
              <div className="lg:mt-6">
                <h3 className="flex items-center gap-2 text-xl font-extrabold uppercase"><Icon className="h-5 w-5 text-primary" aria-hidden />{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function OnlineCoach() {
  return (
    <section className="overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[420px] md:min-h-[600px]">
          <img src="/images/guia-retrato.png" alt="Antonio Ruiz Aguilera con casco y frontal en la entrada de una cueva" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background" />
        </div>
        <div className="flex items-center px-4 py-16 sm:px-10 lg:px-16">
          <div className="max-w-lg">
            <Eyebrow>Tu entrenador</Eyebrow>
            <h2 className="text-3xl font-extrabold sm:text-5xl">Antonio Ruiz Aguilera</h2>
            <p className="mt-5 text-xl font-bold leading-8 text-primary">Preparación física desde la experiencia en montaña.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex gap-3"><Award className="h-6 w-6 shrink-0 text-primary" aria-hidden /><span>Máster en Entrenamiento Deportivo-Físico</span></li>
              <li className="flex gap-3"><ShieldCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden /><span>Técnico Deportivo en Espeleología (TD2)</span></li>
              <li className="flex gap-3"><Mountain className="h-6 w-6 shrink-0 text-primary" aria-hidden /><span>Experiencia en montaña y actividades verticales</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OnlineStart() {
  return (
    <section id="punto-de-partida" className="scroll-mt-28 border-t border-border bg-card py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center">
          <Eyebrow>Solicita tu evaluación</Eyebrow>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Encuentra tu punto de partida</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">Cuéntame qué practicas y qué quieres mejorar. Revisaré personalmente tu caso.</p>
        </div>
        <div id="solicitud" className="mx-auto mt-10 max-w-3xl scroll-mt-28">
          <OnlineRequestForm />
        </div>
      </div>
    </section>
  );
}
