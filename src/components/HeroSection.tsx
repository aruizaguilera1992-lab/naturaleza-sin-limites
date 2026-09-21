import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, ChevronDown, MessageCircle, Mountain, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroVideoAsset from '@/assets/photography/naturaleza-sin-limites-hero.mp4.asset.json';

export function HeroSection() {
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(motionPreference.matches);

    motionPreference.addEventListener('change', updatePreference);
    return () => motionPreference.removeEventListener('change', updatePreference);
  }, []);

  return <section id="inicio" className="homepage-hero relative min-h-[680px] lg:min-h-[78vh] flex items-center overflow-hidden">
      {/* Animated background; the section background remains as the loading/reduced-motion poster. */}
      {!reduceMotion && (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/__l5e/assets-v1/18d2a0f6-1ce5-4188-8343-5fa989142533/fondo-web-home-v2.webp"
          aria-hidden="true"
        >
          <source src={heroVideoAsset.url} type="video/mp4" />
        </video>
      )}
      <div className="homepage-hero-overlay absolute inset-0 z-[1]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-44 md:pt-36 pb-20">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="max-w-4xl my-8 lg:my-12">
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
        }} className="inline-flex items-center gap-2 bg-background/70 backdrop-blur-md border border-primary/40 rounded-full px-4 py-2 mb-7">
            <Mountain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground/90">Turismo activo guiado · Málaga y Andalucía</span>
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
        }} className="max-w-4xl text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-7xl font-heading mb-6">
            Aventura guiada con
            <span className="block text-gradient mt-2">criterio técnico y grupos reducidos</span>
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
        }} className="text-base leading-7 text-foreground/85 max-w-2xl mb-9 sm:text-xl sm:leading-8">
            Barranquismo, escalada y vías ferratas en Málaga y Andalucía, con acompañamiento cercano y recorridos adaptados a tu nivel.
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
        }} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Button variant="hero" size="lg" className="group min-h-14" asChild>
              <Link to="/actividades">
              <Mountain className="h-5 w-5 mr-2" />
              Ver experiencias
              <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" className="min-h-14" asChild>
              <a href="https://wa.me/34685609542?text=Hola%2C%20quiero%20consultar%20disponibilidad%20para%20una%20actividad%20de%20aventura." target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              Consultar disponibilidad
              </a>
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
        }} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-foreground/80">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Máx. 6 personas</span></div>
            <div className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Guía TD2</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Material homologado</span></div>
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
    }} className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-foreground/60 hover:text-primary transition-colors cursor-pointer">
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