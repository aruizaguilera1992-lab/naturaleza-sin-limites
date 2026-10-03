import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { media } from '@/data/media';

const guideMask = {
  maskImage:
    'linear-gradient(to top, black 45%, transparent 92%), linear-gradient(to right, transparent 0%, black 30%)',
  WebkitMaskImage:
    'linear-gradient(to top, black 45%, transparent 92%), linear-gradient(to right, transparent 0%, black 30%)',
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} as React.CSSProperties;

export function ContactHeroSection() {
  const scrollToPathways = () => {
    document.getElementById('que-buscas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] md:h-screen flex items-center overflow-hidden bg-background">
      {/* Escena: paisaje */}
      <div className="absolute inset-0 z-0">
        <img
          src={media.caminito.src}
          alt={media.caminito.alt}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
      </div>

      {/* Escena: el guía integrado en el paisaje */}
      <div className="absolute bottom-0 right-0 z-10 h-full w-full md:w-3/5 flex items-end justify-end pointer-events-none">
        <div className="relative h-full w-full md:w-auto flex items-end justify-end overflow-hidden opacity-60 md:opacity-100">
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/15 blur-[150px] rounded-full" />
          <motion.img
            src="/images/guia-retrato-corte.png"
            alt="Guía de Naturaleza Sin Límites"
            loading="eager"
            decoding="async"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="h-[68%] md:h-[72%] w-auto max-w-none object-contain object-bottom translate-x-4 drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 pt-32 md:pt-40 pb-24 relative z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
              Trato personal
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-5xl sm:text-6xl md:text-8xl font-extrabold uppercase tracking-tighter text-foreground leading-[0.9] mb-8"
          >
            Hablemos
            <br />
            de tu próxima
            <br />
            <span className="text-primary italic">Aventura</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/80 max-w-lg leading-relaxed mb-10"
          >
            Me escribes y te respondo yo, personalmente:{' '}
            <span className="relative inline-block text-foreground font-semibold">
              juntos diseñamos la salida perfecta
              <span
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"
                aria-hidden="true"
              />
            </span>{' '}
            para ti.
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
              className="gap-3 uppercase tracking-widest group"
            >
              Elige qué buscas
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Transición de escena hacia la página */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background to-transparent z-[15] pointer-events-none" />
    </section>
  );
}
