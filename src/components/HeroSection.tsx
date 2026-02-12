import { motion } from 'framer-motion';
import { ChevronDown, Mountain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-canyoning.jpg';
export function HeroSection() {
  return <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Barranquismo en Málaga" className="w-full h-full object-cover" />
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-44 md:pt-32 pb-20 text-center">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="max-w-4xl mx-auto my-[50px]">
          {/* Badge */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }} className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-8">
            <Mountain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground/90">Deportes de Montaña en Málaga</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3,
          duration: 0.6
        }} className="text-hero font-heading mb-6">
            Naturaleza Sin Límites
            <span className="block text-gradient mt-2">
              Vive la Aventura, Entrena Como un Pro
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5,
          duration: 0.6
        }} className="text-hero-sub text-foreground/80 max-w-2xl mx-auto mb-10">
            Guiado y entrenamiento en deportes de montaña.
            Espeleología, barranquismo, escalada y vías ferratas en los mejores escenarios de Andalucía.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.7,
          duration: 0.6
        }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" className="group" onClick={() => {
            document.getElementById('actividades')?.scrollIntoView({
              behavior: 'smooth'
            });
          }}>
              <Mountain className="h-5 w-5 mr-2" />
              ¡Reserva tu Aventura!
            </Button>
            <Button variant="heroOutline" size="xl" onClick={() => {
            window.location.href = '/vertigo-sapiens';
          }}>
              <Users className="h-5 w-5 mr-2" />
              Únete a Vértigo Sapiens
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 1,
          duration: 0.6
        }} className="mt-16 flex flex-wrap justify-center gap-8 text-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-sm">Formación técnica en montaña</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm">Pasión por la aventura</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-sm">Compromiso con la seguridad</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.a href="#propuesta" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.2,
      duration: 0.6
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/60 hover:text-primary transition-colors cursor-pointer">
        <motion.div animate={{
        y: [0, 10, 0]
      }} transition={{
        repeat: Infinity,
        duration: 1.5
      }}>
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </motion.a>
    </section>;
}