import { Award, HeartHandshake, ShieldCheck, Users } from 'lucide-react';

const differentiators = [
  { icon: ShieldCheck, title: 'Seguridad aplicada', description: 'Material homologado, revisión previa y decisiones adaptadas a las condiciones del terreno.' },
  { icon: Award, title: 'Criterio técnico', description: 'Formación TD2 y acompañamiento centrado en progresar con control.' },
  { icon: Users, title: 'Grupos reducidos', description: 'Máximo 6 personas para mantener atención directa y adaptar el ritmo.' },
  { icon: HeartHandshake, title: 'Trato cercano', description: 'Hablas directamente con quien valora y prepara tu experiencia.' },
];

export function WhyChooseUs() {
  return (
    <section id="nosotros" className="border-y border-border bg-secondary/30 py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 block text-sm font-bold uppercase text-primary">Por qué Naturaleza Sin Límites</span>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Técnica cuando importa. Cercanía en todo momento.</h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {differentiators.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-card p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-5 text-base font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}