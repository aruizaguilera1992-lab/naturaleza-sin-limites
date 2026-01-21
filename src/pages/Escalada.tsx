import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mountain, MessageCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ClimbingQuestionnaire } from '@/components/escalada/ClimbingQuestionnaire';
import { CragResults } from '@/components/escalada/CragResults';

interface FilterAnswers {
  nivel: string;
  tipo: string;
  duracion: string;
  provincia: string;
}

export default function Escalada() {
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<FilterAnswers>({
    nivel: '',
    tipo: '',
    duracion: '',
    provincia: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuestionnaireComplete = (answers: FilterAnswers) => {
    setFilters(answers);
    setShowResults(true);
    setTimeout(() => {
      document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setFilters({ nivel: '', tipo: '', duracion: '', provincia: '' });
    setShowResults(false);
    setTimeout(() => {
      document.getElementById('cuestionario')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1920"
            alt="Escalada en Málaga"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full mb-6">
              <Mountain className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium">Escalada Deportiva y Clásica</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Descubre la Escalada en
              <span className="text-primary block mt-2">Málaga y Andalucía</span>
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Encuentra la escuela perfecta para tu nivel y estilo de escalada.
              Desde iniciación hasta vías de alto nivel en los mejores sectores.
            </p>

            <Button
              variant="hero"
              size="xl"
              className="gap-2"
              onClick={() => document.getElementById('cuestionario')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Encuentra tu escuela ideal
              <Mountain className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Questionnaire Section */}
      {!showResults && (
        <section id="cuestionario" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                ¿Qué tipo de escalada buscas?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Responde unas preguntas y te recomendaremos las mejores escuelas 
                de escalada según tu nivel y preferencias.
              </p>
            </motion.div>

            <ClimbingQuestionnaire
              onComplete={handleQuestionnaireComplete}
              onReset={handleReset}
            />
          </div>
        </section>
      )}

      {/* Results Section */}
      {showResults && (
        <section id="resultados" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <CragResults filters={filters} onReset={handleReset} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
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
              Contáctanos y te ayudaremos a encontrar la experiencia de escalada perfecta 
              para ti. Cursos personalizados, salidas en grupo y mucho más.
            </p>
            <Button variant="hero" size="lg" className="gap-2" asChild>
              <a
                href="https://wa.me/34685609542?text=¡Hola! Me gustaría información sobre escalada en Andalucía"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Contactar por WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
