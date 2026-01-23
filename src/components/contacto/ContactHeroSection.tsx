import { motion } from 'framer-motion';
import { ArrowDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import founderImage from '@/assets/founder-antonio.png';
import heroBg from '@/assets/hero-canyoning.jpg';

export function ContactHeroSection() {
  const scrollToPathways = () => {
    document.getElementById('que-buscas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Montaña" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Hablemos de tu próxima{' '}
            <span className="text-primary">aventura</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Cada persona, grupo y objetivo es distinto. Por eso el contacto es directo: 
            te escucho, te hago 2–3 preguntas clave y diseñamos juntos la experiencia 
            o el proceso de entrenamiento que mejor encaje contigo.
          </motion.p>

          {/* Founder image with badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4 mb-10"
          >
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl">
                <img 
                  src={founderImage} 
                  alt="Antonio - Naturaleza Sin Límites" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                <MessageCircle className="inline-block w-3 h-3 mr-1" />
                Trato personal
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Trato personal desde el minuto 1
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              variant="hero" 
              size="lg" 
              onClick={scrollToPathways}
              className="gap-2"
            >
              Elige qué buscas
              <ArrowDown className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
