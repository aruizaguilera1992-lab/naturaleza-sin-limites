import { useState } from 'react';
import { ArrowDown, ArrowRight, Award, Check, ClipboardCheck, Dumbbell, LineChart, Mountain, ShieldCheck, SlidersHorizontal, Timer, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
            Más fuerza. Más resistencia.<br /><span className="text-primary">Mejor preparado para la montaña.</span>
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
  { icon: Timer, title: 'Resistencia', text: 'Sostener el esfuerzo en jornadas largas.', img: '/images/functional-training-documentary.jpg' },
  { icon: Dumbbell, title: 'Fuerza útil', text: 'Trabajar tracción, piernas y agarre.', img: '/images/rope-detail-documentary.jpg' },
  { icon: Mountain, title: 'Movilidad y estabilidad', text: 'Preparar movimientos y apoyos exigentes.', img: null },
  { icon: LineChart, title: 'Progreso con criterio', text: 'Registrar el entrenamiento y revisar su evolución.', img: null },
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

const included = ['Evaluación inicial', 'Plan semanal adaptado', 'Vídeos de ejercicios', 'Registro semanal', 'Revisión quincenal', 'Hasta 2 vídeos al mes y evaluación final'];
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
        <div className="overflow-hidden border border-primary/40 bg-card shadow-card md:grid md:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between bg-primary p-7 text-primary-foreground sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">El programa</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Vértigo Sapiens Online</h2>
            </div>
            <div className="mt-10">
              <p className="text-5xl font-extrabold">179 €</p>
              <p className="mt-2 font-semibold">8 semanas · precio orientativo, pendiente de confirmación</p>
            </div>
          </div>
          <div className="p-6 sm:p-10">
            <ul className="grid gap-3 sm:grid-cols-2">
              {included.map((item) => <li key={item} className="flex gap-2 font-semibold"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />{item}</li>)}
            </ul>
            <Button variant="hero" size="lg" className="mt-8 w-full sm:w-auto" onClick={() => go('punto-de-partida')}>Solicitar mi evaluación <ArrowRight /></Button>
            <p className="mt-4 text-sm text-foreground/80">Sin pago ni compromiso. Confirmamos precio y disponibilidad antes de contratar.</p>
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


export function OnlineStart() {
  const [answers, setAnswers] = useState<VertigoAssessment>({ disciplina: '', limitacion: '', disponibilidad: '' });
  const complete = Boolean(answers.disciplina && answers.limitacion && answers.disponibilidad);
  const update = (key: keyof VertigoAssessment, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const finish = () => {
    if (!complete) return;
    saveVertigoAssessment(answers);
    go('solicitud');
  };

  return (
    <section id="punto-de-partida" className="scroll-mt-28 border-t border-border bg-card py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center">
          <Eyebrow>Paso 1 de 2</Eyebrow>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Encuentra tu punto de partida</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">Cuéntame qué practicas y qué quieres mejorar. Revisaré personalmente tu caso.</p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl border-t-4 border-primary bg-background p-5 shadow-card sm:p-8">
          <div className="space-y-7">
            <ChoiceGroup legend="1. Disciplina principal" value={answers.disciplina} options={disciplines} onChange={(value) => update('disciplina', value)} />
            <ChoiceGroup legend="2. Qué quieres mejorar" value={answers.limitacion} options={limitations} onChange={(value) => update('limitacion', value)} />
            <ChoiceGroup legend="3. Días disponibles por semana" value={answers.disponibilidad} options={availability} onChange={(value) => update('disponibilidad', value)} />
          </div>
          <Button type="button" variant="hero" size="lg" className="mt-8 w-full" disabled={!complete} onClick={finish}>
            Continuar <ArrowRight />
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">No es una prueba física ni un diagnóstico médico.</p>
        </div>
        <div id="solicitud" className="mx-auto mt-16 max-w-3xl scroll-mt-28">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">Paso 2 de 2 · Tus datos</p>
          <OnlineRequestForm />
        </div>
      </div>
    </section>
  );
}
