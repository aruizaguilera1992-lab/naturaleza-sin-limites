import { Check, MessageCircle, ArrowRight, Compass, GraduationCap, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cavingLevels, cavingPractices, cavingPath, cavingWhatsapp, CAVING_PENDING } from "@/data/cavingTraining";

export function CavingSectionNav() {
  const items = [
    { href: "#experiencias", title: "Vive la experiencia", icon: Compass },
    { href: "#formacion", title: "Aprende paso a paso", icon: GraduationCap },
    { href: "#practicas", title: "Practica y perfecciona", icon: Repeat },
  ];
  return (
    <nav aria-label="Secciones de espeleología" className="mt-8 grid gap-3 sm:grid-cols-3">
      {items.map((i) => (
        <a key={i.href} href={i.href} className="flex items-center gap-3 rounded-lg border border-border bg-card/80 p-4 transition-all duration-300 hover:border-primary active:scale-95">
          <i.icon className="h-5 w-5 shrink-0 text-primary" />
          <span className="font-heading font-semibold text-foreground">{i.title}</span>
        </a>
      ))}
    </nav>
  );
}

export function CavingTrainingPath() {
  return (
    <section id="formacion" className="scroll-mt-32 bg-muted/20 py-16" aria-labelledby="formacion-title">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Formación propia NSL</p>
        <h2 id="formacion-title" className="mt-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">Aprende paso a paso</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Itinerario propio de Naturaleza Sin Límites. No es un curso federativo ni otorga titulación.</p>

        <ol className="mt-8 flex flex-wrap gap-2" aria-label="Itinerario formativo">
          {cavingPath.map((step, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${step.startsWith("E") ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>{step}</span>
              {i < cavingPath.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {cavingLevels.map((l) => (
            <article key={l.code} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <span className="w-fit rounded-md bg-primary px-2.5 py-1 font-heading text-sm font-bold text-primary-foreground">{l.code}</span>
              <h3 className="mt-3 font-heading text-xl font-bold text-foreground">{l.title}</h3>
              <p className="mt-1 text-sm text-primary">{CAVING_PENDING}</p>
              <ul className="mt-4 space-y-2">
                {l.outcomes.map((o) => (
                  <li key={o} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{o}</li>
                ))}
              </ul>
              <Accordion type="multiple" className="mt-4 flex-1">
                <AccordionItem value="dest"><AccordionTrigger className="text-left text-sm">Destinatarios</AccordionTrigger><AccordionContent className="text-muted-foreground">{l.audience}</AccordionContent></AccordionItem>
                <AccordionItem value="cont"><AccordionTrigger className="text-left text-sm">Contenidos</AccordionTrigger><AccordionContent><ul className="list-disc space-y-1 pl-5 text-muted-foreground">{l.contents.map((c) => <li key={c}>{c}</li>)}</ul></AccordionContent></AccordionItem>
                <AccordionItem value="req"><AccordionTrigger className="text-left text-sm">Requisitos</AccordionTrigger><AccordionContent className="text-muted-foreground">{l.access}</AccordionContent></AccordionItem>
                <AccordionItem value="eval"><AccordionTrigger className="text-left text-sm">Evaluación práctica</AccordionTrigger><AccordionContent className="text-muted-foreground">{l.assessment}</AccordionContent></AccordionItem>
                <AccordionItem value="next"><AccordionTrigger className="text-left text-sm">Siguiente paso</AccordionTrigger><AccordionContent className="text-muted-foreground">{l.next}</AccordionContent></AccordionItem>
              </Accordion>
              <Button variant="hero" className="mt-5" asChild>
                <a href={cavingWhatsapp(`nivel ${l.code} ${l.title}`)} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Consultar {l.code}</a>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Cómo se progresa:</strong> por competencias observadas en la práctica, no solo por tiempo. Entre niveles se recomiendan prácticas y el acceso a E2 y E3 requiere siempre valoración práctica.
        </div>
      </div>
    </section>
  );
}

export function CavingPractices() {
  return (
    <section id="practicas" className="scroll-mt-32 py-16" aria-labelledby="practicas-title">
      <div className="container mx-auto px-4">
        <h2 id="practicas-title" className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Practica y perfecciona</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Propuestas diferenciadas, sin ediciones confirmadas. {CAVING_PENDING}.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cavingPractices.map((p) => (
            <article key={p.title} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-bold text-foreground">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
              <Button variant="outline" className="mt-5" asChild>
                <a href={cavingWhatsapp(p.title)} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Consultar</a>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          ¿Quieres llegar con mejor forma física? <Link to="/vertigo-sapiens" className="text-primary underline">Vértigo Sapiens</Link> es un complemento opcional, no un requisito.
        </p>
      </div>
    </section>
  );
}
