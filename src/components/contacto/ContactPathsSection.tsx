import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Dumbbell,
  HeartHandshake,
  LineChart,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { media } from '@/data/media';

const pathways = [
  {
    id: 'adventure',
    eyebrow: 'Experiencias',
    title: 'Quiero vivir una experiencia de aventura',
    image: media.canyoning,
    benefits: [
      { icon: Award, label: 'Guía titulado', detail: 'Formación TD2 y criterio en terreno' },
      { icon: ShieldCheck, label: 'Material y seguros', detail: 'Equipo técnico, accidentes y RC' },
      { icon: Users, label: 'Máximo 6 personas', detail: 'Atención directa y ritmo adaptado' },
      { icon: HeartHandshake, label: 'Trato directo', detail: 'Hablas con quien prepara tu salida' },
    ],
    ctaShort: 'Propuesta de aventura',
    ctaLong: 'Quiero una propuesta de aventura',
    whatsappMessage: 'Hola, me interesa una experiencia de aventura. ¿Podrías darme más información?',
  },
  {
    id: 'training',
    eyebrow: 'Rendimiento',
    title: 'Quiero mejorar mi rendimiento en montaña',
    image: media.functionalTraining,
    benefits: [
      { icon: SlidersHorizontal, label: 'Plan a tu medida', detail: 'Según disciplina, nivel y tiempo' },
      { icon: Dumbbell, label: 'Fuerza y resistencia', detail: 'En gimnasio, casa o parque' },
      { icon: LineChart, label: 'Progreso medido', detail: 'Registro semanal y revisión' },
      { icon: User, label: 'Seguimiento personal', detail: 'Lo revisa Antonio, no una plantilla' },
    ],
    ctaShort: 'Hablar de entrenamiento',
    ctaLong: 'Quiero hablar sobre entrenamiento',
    whatsappMessage: 'Hola, quiero mejorar mi rendimiento en montaña. ¿Podemos hablar sobre el programa Vértigo Sapiens?',
  },
];

export function ContactPathsSection() {
  const phone = '+34685609542';

  const handleWhatsApp = (message: string) => {
    const url = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="que-buscas" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-primary font-heading font-bold uppercase tracking-[0.2em] text-base sm:text-lg mb-3">
            Dos caminos
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-foreground">
            ¿Qué estás buscando ahora mismo?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pathways.map((pathway, index) => (
            <motion.div
              key={pathway.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative flex flex-col overflow-hidden border border-primary/25 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-card active:scale-95"
            >
              {/* Cabecera visual */}
              <div className="relative h-52 overflow-hidden sm:h-64">
                <img
                  src={pathway.image.src}
                  alt={pathway.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card via-card/65 to-card/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <span className="text-primary font-heading font-bold uppercase tracking-[0.22em] text-xs sm:text-sm">
                    {pathway.eyebrow}
                  </span>
                  <h3 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-[1.05] text-foreground">
                    {pathway.title}
                  </h3>
                </div>
              </div>

              {/* Beneficios */}
              <ul className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
                {pathway.benefits.map(({ icon: Icon, label, detail }) => (
                  <li key={label} className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-bold leading-tight text-foreground sm:text-lg">{label}</span>
                      <span className="block text-sm leading-snug text-muted-foreground">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Acción */}
              <div className="p-6 pt-2 sm:p-7 sm:pt-2">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => handleWhatsApp(pathway.whatsappMessage)}
                  className="w-full justify-center gap-3 uppercase tracking-widest"
                >
                  <span className="sm:hidden">{pathway.ctaShort}</span>
                  <span className="hidden sm:inline">{pathway.ctaLong}</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
