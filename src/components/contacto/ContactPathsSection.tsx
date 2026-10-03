import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { media } from '@/data/media';

const pathways = [
  {
    id: 'adventure',
    eyebrow: 'Experiencias',
    title: 'Quiero vivir una experiencia de aventura',
    description: 'Ideal si buscas una salida de barranquismo, escalada, vía ferrata u otra actividad puntual para ti, tu pareja, tus amigos o tu familia.',
    image: media.canyoning,
    ctaShort: 'Propuesta de aventura',
    ctaLong: 'Quiero una propuesta de aventura',
    whatsappMessage: 'Hola, me interesa una experiencia de aventura. ¿Podrías darme más información?',
  },
  {
    id: 'training',
    eyebrow: 'Rendimiento',
    title: 'Quiero mejorar mi rendimiento en montaña',
    description: 'Pensado si quieres dar un salto de nivel, entrenar con estructura y aprovechar la experiencia y resultados en competición para avanzar con seguridad.',
    image: media.functionalTraining,
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
          className="mb-16"
        >
          <p className="text-primary font-heading font-bold uppercase tracking-[0.2em] mb-2">
            Dos caminos
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-foreground">
            ¿Qué estás buscando ahora mismo?
          </h2>
          <p className="text-muted-foreground max-w-xl mt-4">
            Elige el camino que mejor se adapte a lo que necesitas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto">
          {pathways.map((pathway, index) => (
            <motion.div
              key={pathway.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative bg-card border border-primary/20 overflow-hidden transition-all duration-300 hover:border-primary active:scale-95"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={pathway.image.src}
                  alt={pathway.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute pointer-events-none w-full h-full bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>

              <div className="p-6 sm:p-8">
                <span className="text-primary font-heading font-bold uppercase tracking-[0.2em] text-sm mb-3 block">
                  {pathway.eyebrow}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground mb-4 leading-tight">
                  {pathway.title}
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {pathway.description}
                </p>
                <button
                  onClick={() => handleWhatsApp(pathway.whatsappMessage)}
                  className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 px-6 transition-all duration-300 uppercase text-sm tracking-widest active:scale-95 w-full justify-center sm:w-auto"
                >
                  <span className="sm:hidden">{pathway.ctaShort}</span>
                  <span className="hidden sm:inline">{pathway.ctaLong}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
