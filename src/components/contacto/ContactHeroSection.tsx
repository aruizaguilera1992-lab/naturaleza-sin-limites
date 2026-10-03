import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { media } from '@/data/media';

export function ContactHeroSection() {
  const scrollToPathways = () => {
    document.getElementById('que-buscas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed photo background */}
      <div className="absolute inset-0">
        <img
          src={media.caminito.src}
          alt={media.caminito.alt}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/80" />
      </div>

      <div className="container mx-auto px-4 pt-32 md:pt-40 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Founder image with orange ring and glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src="/images/guia-retrato.png"
                  alt="Guía de Naturaleza Sin Límites"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <span className="mt-4 inline-block bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
              Trato personal
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-foreground mb-6 leading-tight"
          >
            Hablemos de tu{' '}
            <span className="text-primary">próxima aventura</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Cada persona, grupo y objetivo es distinto. Por eso el contacto es directo:
            te escucho, te hago 2–3 preguntas clave y diseñamos juntos la experiencia
            o el proceso de entrenamiento que mejor encaje contigo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              variant="hero"
              size="lg"
              onClick={scrollToPathways}
              className="gap-2 uppercase tracking-widest"
            >
              Elige qué buscas
              <ArrowDown className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
