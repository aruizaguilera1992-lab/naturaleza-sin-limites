import { ArrowDown, ArrowRight, Award, Check, ClipboardCheck, Dumbbell, LineChart, Mountain, ShieldCheck, SlidersHorizontal, Timer, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import athleteImage from '@/assets/atleta-reto-naturaleza.jpg';
import coachImage from '@/assets/founder-antonio.png';
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
      <img
        src={athleteImage}
        alt="Deportista progresando por terreno de montaña al atardecer"
        width={1408}
        height={1008}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center] motion-safe:animate-[nsl-hero-drift_18s_ease-in-out_infinite_alternate]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/10" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
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
  { icon: Timer, title: 'Resistencia', text: 'Llega entero al final de la jornada: aproximaciones largas, desniveles y horas de actividad sin perder energía.', img: '/images/functional-training-documentary.jpg' },
  { icon: Dumbbell, title: 'Fuerza funcional', text: 'Tracción, piernas, core y agarre para trepar, cargar la mochila y moverte con seguridad en cuerda.', img: '/images/rope-detail-documentary.jpg' },
  { icon: Mountain, title: 'Movilidad y estabilidad', text: 'Articulaciones preparadas para pasos amplios, apoyos inestables y posturas exigentes en roca o cueva.', img: null },
  { icon: LineChart, title: 'Progreso con criterio', text: 'Cada sesión queda registrada para ver tu evolución y ajustar el plan semana a semana.', img: null },
];

export function OnlineBenefits() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <Eyebrow>Qué entrenamos</Eyebrow>
        <h2 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">Lo que la montaña te pide.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text, img }) => (
            <article key={title} className="group relative flex min-h-64 flex-col justify-end overflow-hidden border border-border bg-card p-6">
              {img && (
                <>
                  <img src={img} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 motion-safe:group-hover:scale-105" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </>
              )}
              <div className="relative">
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
      <img src="/images/rope-detail-documentary.jpg" alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-card via-card/80 to-card" />
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
  { text: 'Evaluación inicial' },
  { text: 'Plan semanal adaptado' },
  { text: 'Vídeos de ejercicios' },
  { text: 'Registro semanal' },
  { text: 'Revisión quincenal' },
  { text: 'Hasta 2 vídeos al mes y evaluación final' },
];
const excluded = ['Sesiones presenciales', 'Salidas outdoor', 'Asesoramiento nutricional', 'Mensajería ilimitada', 'Cursos técnicos o evaluación de seguridad'];
const details = [
  { q: '¿Necesito gimnasio?', a: 'No necesariamente. El plan se adapta al material que tengas en gimnasio, casa o parque.' },
  { q: '¿Cómo se revisan los ejercicios?', a: 'Puedes enviar hasta 2 vídeos al mes. El canal de envío se confirma antes de contratar.' },
  { q: '¿Qué ocurre tras las 8 semanas?', a: 'Recibes una evaluación final. Cualquier continuidad se explicará antes de terminar.' },
];

export function OnlineProgram() {
  return (
    <section id="programa" className="scroll-mt-28 py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="overflow-hidden border border-primary/40 bg-card shadow-card md:grid md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative flex flex-col justify-between overflow-hidden bg-primary p-7 text-primary-foreground sm:p-10">
            <img src="/images/vias-ferratas.webp" alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_28%] brightness-[.55] saturate-[.9]" />
            <div aria-hidden className="absolute inset-0 bg-primary/55" />
            <div aria-hidden className="absolute inset-0 bg-background/25" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">El programa</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] sm:text-6xl">Vértigo<br />Sapiens<br />Online</h2>
              <p className="mt-6 max-w-sm text-base font-semibold leading-7">
                Ocho semanas de entrenamiento personalizado para llegar a la montaña más fuerte, más móvil y más entero.
              </p>
            </div>
            <div className="relative mt-10 border-t border-primary-foreground/30 pt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Para quién es</p>
              <p className="mt-2 max-w-xs text-sm font-semibold leading-6">Barranquismo, espeleología, escalada, ferratas o montaña.</p>
            </div>
            <ul className="relative mt-8 flex flex-wrap gap-2" aria-label="Claves del programa">
              {['8 semanas', '100 % online', 'Seguimiento de Antonio'].map((item) => (
                <li key={item} className="border border-primary-foreground/55 bg-background/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider">{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Qué incluye</p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {included.map(({ text }) => (
                <li key={text} className="flex items-center gap-3 border border-border bg-background/60 p-3.5 text-sm font-semibold leading-5 transition-all duration-300 hover:border-primary/60">
                  <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary"><Check className="h-4 w-4 text-primary-foreground" /></span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="hero" size="lg" className="w-full shrink-0 sm:w-auto" onClick={() => go('punto-de-partida')}>Solicitar mi evaluación <ArrowRight /></Button>
              <p className="max-w-xs text-sm leading-6 text-foreground/80">Sin pago ni compromiso. Confirmamos precio y disponibilidad antes de contratar.</p>
            </div>
            <Accordion type="single" collapsible className="mt-6 border-t border-border">
              <AccordionItem value="detalles" className="border-b-0">
                <AccordionTrigger className="py-4 text-left text-sm font-bold">Detalles y qué no incluye</AccordionTrigger>
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
        </div>
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
          <img src={coachImage} alt="Antonio Ruiz Aguilera en una pared de roca durante una actividad vertical" width={625} height={691} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
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
