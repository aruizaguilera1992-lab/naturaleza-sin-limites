import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, ChevronDown } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { CanyoningQuestionnaire } from '@/components/barranquismo/CanyoningQuestionnaire';
import { CanyonCatalog } from '@/components/barranquismo/CanyonCatalog';
import type { LevelFilter, ProvinceFilter } from '@/data/canyonCatalog';
import type { NivelExperiencia, DuracionPreferida, Caracteristica, Provincia } from '@/data/barrancos';

interface FilterAnswers {
  nivel: NivelExperiencia | null;
  duracion: DuracionPreferida | null;
  caracteristica: Caracteristica | null;
  provincia: Provincia | null;
}

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

const Barranquismo = () => {
  const [provincia, setProvincia] = useState<ProvinceFilter>('todas');
  const [nivel, setNivel] = useState<LevelFilter>('todos');

  // Scroll to top on page load; with a URL hash, scroll to the target section instead.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const scrollToHash = () => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
    };
    const frame = window.requestAnimationFrame(scrollToHash);
    const settledLayout = window.setTimeout(scrollToHash, 450);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settledLayout);
    };
  }, [hash]);

  // El cuestionario es una ayuda opcional: solo preajusta los filtros del catálogo.
  const handleQuestionnaireComplete = (answers: FilterAnswers) => {
    setNivel(answers.nivel === 'principiante' ? 'iniciacion' : answers.nivel === 'intermedio' ? 'intermedio' : 'todos');
    setProvincia(answers.provincia === 'Málaga' || answers.provincia === 'Granada' ? answers.provincia : 'todas');
    setTimeout(() => {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setProvincia('todas');
    setNivel('todos');
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <Seo
        title="Barranquismo en Málaga y Granada | Naturaleza Sin Límites"
        description="Barrancos guiados de iniciación e intermedio en Málaga y Granada. Filtra por provincia y experiencia; grupos de hasta 6 personas."
        path="/barranquismo"
      />

      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Fondo gráfico sin fotografía: no hay foto con procedencia y licencia libre verificada */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-adventure-dark via-background to-background" />
        <svg aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 w-full text-primary/15" viewBox="0 0 1440 400" preserveAspectRatio="none" fill="currentColor">
          <path d="M0 400 L0 220 L240 90 L420 260 L600 40 L760 300 L940 120 L1120 280 L1300 70 L1440 200 L1440 400 Z" />
        </svg>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center pt-44 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6">
              Barranquismo en{' '}
              <span className="text-gradient">Málaga y Granada</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Recorridos de iniciación e intermedio, en grupos de hasta 6 personas.
            </p>
            
            <motion.a
              href="#catalogo"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Ver barrancos</span>
              <ChevronDown className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalogo" className="scroll-mt-32 py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Barrancos de Málaga y Granada
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Iniciación e intermedio. El nivel de experiencia es orientativo y va aparte del grado técnico.
            </p>
          </div>
          <CanyonCatalog provincia={provincia} nivel={nivel} onProvinciaChange={setProvincia} onNivelChange={setNivel} />
        </div>
      </section>

      {/* Optional questionnaire */}
      <section id="cuestionario" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              ¿Te ayudamos a elegir?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Responde unas preguntas y ajustaremos los filtros del catálogo.
            </p>
          </div>
          <CanyoningQuestionnaire onComplete={handleQuestionnaireComplete} onReset={handleReset} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-adventure-dark to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Cuéntame qué tipo de experiencia te gustaría vivir y te ayudaré a encontrar 
              el barranco perfecto para ti.
            </p>
            <a
              href="https://wa.me/34685609542?text=¡Hola!%20Me%20gustaría%20información%20sobre%20barranquismo%20en%20Andalucía."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
            >
              <Waves className="h-5 w-5" />
              Contactar por WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      </motion.main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </motion.div>
  );
};

export default Barranquismo;
