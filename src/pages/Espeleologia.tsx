import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Mountain, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SpeleologyQuestionnaire, type FilterAnswers } from '@/components/espeleologia/SpeleologyQuestionnaire';
import { CaveResults } from '@/components/espeleologia/CaveResults';
import { InitiationCourseCard } from '@/components/espeleologia/InitiationCourseCard';
import speleologyHero from '@/assets/activity-speleology.jpg';

export default function Espeleologia() {
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<FilterAnswers>({
    nivel: '',
    tipo: '',
    duracion: '',
    provincia: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleQuestionnaireComplete = (answers: FilterAnswers) => {
    setFilters(answers);
    setShowResults(true);
    setTimeout(() => {
      const resultsSection = document.getElementById('resultados');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
    setFilters({ nivel: '', tipo: '', duracion: '', provincia: '' });
    setTimeout(() => {
      const questionnaireSection = document.getElementById('cuestionario');
      if (questionnaireSection) {
        questionnaireSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const scrollToCourse = () => {
    const courseSection = document.getElementById('curso-iniciacion');
    if (courseSection) {
      courseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToQuestionnaire = () => {
    const section = document.getElementById('cuestionario');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={speleologyHero}
            alt="Espeleología en Andalucía"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/20 backdrop-blur-sm rounded-full text-primary mb-4 sm:mb-6">
              <Mountain className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">Explora el mundo subterráneo</span>
            </div>
            
            <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              Explora el Mundo
              <span className="text-primary block">Subterráneo</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Descubre cuevas y simas en los mejores sistemas kársticos de Andalucía. 
              Desde cuevas horizontales para iniciación hasta simas verticales para expertos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                onClick={scrollToQuestionnaire}
              >
                Encontrar mi cueva ideal
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                onClick={scrollToCourse}
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Curso de Iniciación
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8 sm:mt-12"
            >
              <button
                onClick={scrollToCourse}
                className="flex flex-col items-center text-white/60 hover:text-white transition-colors mx-auto"
              >
                <span className="text-sm mb-2">Descubre más</span>
                <ChevronDown className="h-6 w-6 animate-bounce" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Initiation Course Section */}
      <section id="curso-iniciacion" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Formación Obligatoria
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Para acceder a simas verticales y cavidades técnicas, necesitas completar el 
              Curso de Iniciación a la Espeleología
            </p>
          </motion.div>

          <InitiationCourseCard 
            onViewDetails={scrollToCourse}
            onEnroll={() => {}}
          />
        </div>
      </section>

      {/* Questionnaire Section */}
      <section id="cuestionario" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {!showResults && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Encuentra tu cueva ideal
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Responde estas preguntas y te recomendaremos las mejores cavidades 
                  según tu experiencia y preferencias
                </p>
              </motion.div>

              <SpeleologyQuestionnaire onComplete={handleQuestionnaireComplete} />
            </>
          )}
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section id="resultados" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CaveResults filters={filters} onReset={handleReset} />
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-emerald-900/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Necesitas ayuda para elegir?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Nuestros guías espeleólogos profesionales te asesorarán para encontrar 
              la cavidad perfecta según tu nivel y objetivos
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              asChild
            >
              <a
                href="https://wa.me/34685609542?text=¡Hola! Quiero información sobre espeleología. ¿Me pueden asesorar?"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contactar por WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
