import { ArrowDown, ArrowRight, Check, ClipboardList, LineChart, Mountain, Repeat, Waves, X, CalendarDays, Dumbbell, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { OnlineRequestForm } from './OnlineRequestForm';

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">{children}</p>
);
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function OnlineHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background pb-16 pt-44 sm:pt-48 md:pt-40">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
      <div className="container relative mx-auto max-w-5xl px-4">
        <Eyebrow>Entrenamiento online para deportes verticales</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Entrena para la aventura que tienes por delante.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Preparación física online para barranquismo, espeleología y actividades verticales. Un plan guiado de 8 semanas adaptado a tu nivel, tu tiempo y tu objetivo.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="hero" size="xl" onClick={() => go('solicitud')}>Solicitar evaluación inicial <ArrowRight /></Button>
          <Button variant="heroOutline" size="xl" onClick={() => go('como-funciona')}>Cómo funciona <ArrowDown /></Button>
        </div>
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Características">
          {['Online', '8 semanas', 'Fuerza + resistencia + movilidad'].map((s) => (
            <li key={s} className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold">{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OnlineProblem() {
  const items = [
    { t: 'Aproximaciones que agotan', d: 'Llegar a la cabecera de un barranco o a la boca de una cueva ya cansado resta margen para el resto de la jornada.' },
    { t: 'Fuerza para progresar', d: 'Subir por cuerda, trepar un resalte o sostenerte en una vía ferrata exige fuerza funcional de tracción, agarre y tronco.' },
    { t: 'Constancia, no picos', d: 'Una rutina genérica de gimnasio no se organiza alrededor de tu actividad. Lo que marca la diferencia es entrenar con un plan y sostenerlo semana a semana.' },
  ];
  return (
    <section className="bg-card/40 py-16 sm:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">La montaña no se prepara con una rutina genérica</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.t} className="rounded-lg border border-border bg-background p-6">
              <h3 className="text-lg font-bold">{i.t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">No prometemos resultados garantizados ni prevención de lesiones: te damos un plan estructurado y seguimiento para entrenar con criterio.</p>
      </div>
    </section>
  );
}

export function OnlineAudience() {
  const p = [
    { icon: Waves, t: 'Barranquismo', d: 'Aproximaciones largas, destrepes, saltos y trabajo en agua fría: resistencia, piernas y estabilidad.' },
    { icon: Mountain, t: 'Espeleología', d: 'Progresión por cuerda, gateras y jornadas largas bajo tierra: tracción, tronco y movilidad.' },
    { icon: Dumbbell, t: 'Actividades verticales', d: 'Vías ferratas o escalada recreativa: agarre, tracción y resistencia en exposición.' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <Eyebrow>Para quién es</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-4xl">Cada disciplina pide un entrenamiento distinto</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {p.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-lg border border-border bg-card p-6">
              <I className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg font-bold">Si practicas {t.toLowerCase()}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">No es un único plan idéntico para todos: el programa se adapta a tu disciplina, tu nivel inicial, tu tiempo y el material que tienes.</p>
      </div>
    </section>
  );
}

export function OnlineMethod() {
  const steps = [
    { icon: ClipboardList, t: 'Evaluación inicial', coach: 'Antonio revisa tu cuestionario, nivel y objetivo.', app: 'Cuestionario a distancia.' },
    { icon: CalendarDays, t: 'Planificación semanal', coach: 'Antonio diseña tu plan según disciplina, tiempo y material.', app: 'Plan semanal y vídeos explicativos de ejercicios.' },
    { icon: Repeat, t: 'Entrenamiento y registro', coach: 'Revisa hasta 2 vídeos de tus ejercicios al mes.', app: 'Registro semanal de entrenamiento.' },
    { icon: LineChart, t: 'Revisión y ajustes', coach: 'Revisión de progreso cada dos semanas y revisión final.', app: 'Histórico de tus registros.' },
  ];
  return (
    <section id="como-funciona" className="scroll-mt-32 bg-card/40 py-16 sm:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <Eyebrow>Método</Eyebrow>
        <h2 className="text-3xl font-extrabold sm:text-4xl">Cómo funciona</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map(({ icon: I, t, coach, app }, i) => (
            <li key={t} className="rounded-lg border border-border bg-background p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary"><I className="h-5 w-5" aria-hidden /></span>
                <h3 className="text-lg font-bold"><span className="text-primary">{i + 1}.</span> {t}</h3>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div><dt className="inline font-semibold text-foreground">Entrenador: </dt><dd className="inline text-muted-foreground">{coach}</dd></div>
                <div><dt className="inline font-semibold text-foreground">Plataforma: </dt><dd className="inline text-muted-foreground">{app}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function OnlineProgram() {
  const inc = [
    'Cuestionario y evaluación inicial a distancia (al inicio)',
    'Plan semanal adaptado (cada semana)',
    'Vídeos explicativos de los ejercicios',
    'Registro semanal de entrenamiento',
    'Revisión de progreso cada dos semanas',
    'Revisión de hasta 2 vídeos de ejercicios al mes',
    'Revisión final del bloque de 8 semanas',
  ];
  const exc = [
    'Sesiones presenciales en Málaga',
    'Salidas outdoor',
    'Asesoramiento nutricional',
    'Disponibilidad ilimitada por mensajería',
    'Cursos técnicos, formación en maniobras o evaluación profesional de seguridad en montaña',
  ];
  return (
    <section id="programa" className="py-16 sm:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="rounded-xl border-2 border-primary/50 bg-card p-6 shadow-lg sm:p-10">
          <Eyebrow>Programa piloto</Eyebrow>
          <h2 className="text-3xl font-extrabold">Vértigo Sapiens Online · 8 semanas</h2>
          <p className="mt-4 text-3xl font-extrabold text-primary">179 € <span className="text-base font-semibold text-muted-foreground">/ 8 semanas · pago único propuesto</span></p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-bold">Incluye</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {inc.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{i}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">No incluye</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {exc.map((i) => <li key={i} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{i}</li>)}
              </ul>
            </div>
          </div>
          <p className="mt-8 rounded-md border border-border bg-background p-4 text-sm text-foreground">
            Solicitud de información sin pago ni compromiso. El precio final y la disponibilidad se confirmarán antes de contratar.
          </p>
          <Button variant="hero" size="lg" className="mt-6 w-full" onClick={() => go('solicitud')}>Solicitar evaluación inicial</Button>
        </div>
      </div>
    </section>
  );
}

export function OnlineCoach() {
  return (
    <section className="bg-card/40 py-16 sm:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <Eyebrow>Entrenador</Eyebrow>
        <h2 className="text-3xl font-extrabold">Antonio Ruiz Aguilera</h2>
        <ul className="mt-6 space-y-3">
          <li className="flex gap-3"><Award className="h-5 w-5 shrink-0 text-primary" aria-hidden />Máster en Entrenamiento Deportivo-Físico.</li>
          <li className="flex gap-3"><Award className="h-5 w-5 shrink-0 text-primary" aria-hidden />Técnico Deportivo en Espeleología (TD2).</li>
        </ul>
        <p className="mt-6 leading-7 text-muted-foreground">
          Diseña programas de fuerza funcional, resistencia y movilidad y conoce desde dentro lo que exigen el barranquismo y la espeleología. Es quien revisa tu evaluación, tus vídeos y tu progreso.
        </p>
      </div>
    </section>
  );
}

const faqs = [
  { q: '¿Es 100 % online?', a: 'Sí. La evaluación, el plan, los vídeos y las revisiones se hacen a distancia. No incluye sesiones presenciales.' },
  { q: '¿Necesito ir a un gimnasio?', a: 'No necesariamente. El plan se adapta al material al que tengas acceso, sea un gimnasio, material en casa o un parque.' },
  { q: '¿Qué material necesito?', a: 'Depende de tu disciplina y objetivo; lo concretamos en la evaluación inicial. La lista de material mínimo recomendado está pendiente de confirmar.' },
  { q: '¿Incluye salidas o sesiones presenciales?', a: 'No. El programa online no incluye salidas outdoor ni sesiones presenciales en Málaga. Las actividades guiadas se reservan aparte en la web.' },
  { q: '¿Cómo funciona la revisión de vídeos?', a: 'Puedes enviar hasta 2 vídeos de ejercicios al mes para recibir correcciones. El canal concreto de envío se confirmará antes de contratar.' },
  { q: '¿Qué ocurre al terminar las 8 semanas?', a: 'Recibes una revisión final del bloque. Las opciones de continuidad todavía no están definidas; te las explicaremos antes de que termine el programa.' },
];

export function OnlineFAQ() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-extrabold">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function OnlineFinalCTA() {
  return (
    <section id="solicitud" className="scroll-mt-32 border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Solicitar evaluación inicial</h2>
        <p className="mt-3 text-muted-foreground">Cuéntanos qué practicas y qué quieres conseguir. Es una solicitud: no es una reserva confirmada ni un pago.</p>
        <div className="mt-8"><OnlineRequestForm /></div>
      </div>
    </section>
  );
}
