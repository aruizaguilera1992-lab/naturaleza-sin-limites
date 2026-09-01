import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Waves, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { CanyoningQuestionnaire } from '@/components/barranquismo/CanyoningQuestionnaire';
import { CanyonResults } from '@/components/barranquismo/CanyonResults';
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
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<FilterAnswers>({
    nivel: null,
    duracion: null,
    caracteristica: null,
    provincia: null,
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuestionnaireComplete = (answers: FilterAnswers) => {
    setFilters(answers);
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };


  const handleShowAll = () => {
    setFilters({ nivel: null, duracion: null, caracteristica: null, provincia: null });
    setShowResults(true);
    setTimeout(() => {
      document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
    setFilters({
      nivel: null,
      duracion: null,
      caracteristica: null,
      provincia: null,
    });
    
    // Scroll to questionnaire
    setTimeout(() => {
      document.getElementById('cuestionario')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920')`,
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center pt-44 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 mb-6">
              <Waves className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium">Barranquismo en Andalucía</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6">
              Descubre tu{' '}
              <span className="text-gradient">barranco ideal</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
              Responde unas preguntas rápidas y te recomendaremos los mejores barrancos 
              de Málaga, Granada y Cádiz adaptados a tu nivel y preferencias.
            </p>
            
            <motion.a
              href="#cuestionario"
              className="inline-flex items-center gap-2 text-white/80 hover:text-primary transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Empezar</span>
              <ChevronDown className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Questionnaire Section */}
      <section id="cuestionario" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {!showResults ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  Encuentra tu aventura perfecta
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Solo 4 preguntas para recomendarte los barrancos que mejor se adaptan a ti
                </p>
              </motion.div>
              
              <CanyoningQuestionnaire 
                onComplete={handleQuestionnaireComplete}
                onReset={handleReset}
              />
            <div className="mt-6 text-center">
              <button
                onClick={handleShowAll}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary transition-colors duration-300 active:scale-95"
              >
                Prefiero ver todos los barrancos
              </button>
            </div>

            </>
          ) : null}
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section id="resultados" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <CanyonResults filters={filters} onReset={handleReset} />
          </div>
        </section>
      )}

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
