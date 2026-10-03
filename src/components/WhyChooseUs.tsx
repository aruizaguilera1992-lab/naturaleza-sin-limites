import { Award, HeartHandshake, ShieldCheck, Users } from 'lucide-react';

const differentiators = [
  { icon: ShieldCheck, number: '01', title: 'Seguridad aplicada', description: 'Material homologado, revisión previa y decisiones adaptadas a las condiciones del terreno.' },
  { icon: Award, number: '02', title: 'Criterio técnico', description: 'Formación TD2 y acompañamiento centrado en progresar con control.' },
  { icon: Users, number: '03', title: 'Grupos reducidos', description: 'Máximo 6 personas para mantener atención directa y adaptar el ritmo.' },
  { icon: HeartHandshake, number: '04', title: 'Trato cercano', description: 'Hablas directamente con quien valora y prepara tu experiencia.' },
];

export function WhyChooseUs() {
  return (
    <section id="nosotros" className="border-y border-border bg-secondary/30 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="mb-4 block text-base font-bold uppercase tracking-widest text-primary sm:text-lg">
            Por qué Naturaleza Sin Límites
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Técnica cuando importa. Cercanía en todo momento.
          </h2>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-primary" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {differentiators.map(({ icon: Icon, number, title, description }) => (
            <article
              key={title}
              className="group relative overflow-hidden border-t-4 border-primary bg-card p-7 transition-all duration-300 hover:-translate-y-2 hover:bg-accent/40 sm:p-8"
            >
              <span
                className="pointer-events-none absolute -right-3 -top-6 select-none text-7xl font-extrabold text-foreground/5 transition-colors duration-300 group-hover:text-primary/15"
                aria-hidden="true"
              >
                {number}
              </span>
              <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
