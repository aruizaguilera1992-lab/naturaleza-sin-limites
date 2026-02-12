import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mountain, ChevronDown, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FerrataQuestionnaire } from "@/components/ferratas/FerrataQuestionnaire";
import { FerrataResults } from "@/components/ferratas/FerrataResults";
import type { NivelExperiencia, ToleranciaVertigo, DuracionPreferida, ElementoPreferido } from "@/data/ferratas";

interface FilterAnswers {
  nivel: NivelExperiencia | null;
  vertigo: ToleranciaVertigo | null;
  duracion: DuracionPreferida | null;
  elemento: ElementoPreferido | null;
}

const ViasFerratas = () => {
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<FilterAnswers>({
    nivel: null,
    vertigo: null,
    duracion: null,
    elemento: null,
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleQuestionnaireComplete = (answers: FilterAnswers) => {
    setFilters(answers);
    setShowResults(true);

    // Scroll to results
    setTimeout(() => {
      document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
    setFilters({
      nivel: null,
      vertigo: null,
      duracion: null,
      elemento: null,
    });

    // Scroll to questionnaire
    setTimeout(() => {
      document.getElementById("cuestionario")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1920')`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center pt-44 md:pt-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 mb-6">
              <Mountain className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium">Vías Ferratas en Andalucía</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6">
              Vías Ferratas: <span className="text-gradient">Adrenalina en las Alturas</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-6">
              Vive la emoción de la pared vertical con total seguridad. Puentes tibetanos, tirolinas y paisajes
              espectaculares te esperan.
            </p>

            {/* BOTÓN VERDE */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30 mb-4">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">
                Actividad apta para principiantes con equipo de seguridad
              </span>
            </div>

            {/* APARTADO ENCUENTRA TU FERRATA DEBAJO DEL BOTÓN VERDE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 mb-6 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                Encuentra tu vía ferrata perfecta
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Solo 4 preguntas para recomendarte las ferratas que mejor se adaptan a tu nivel y preferencias
              </p>
            </motion.div>

            {/* Flecha para hacer scroll al cuestionario */}
            <motion.a
              href="#cuestionario"
              className="inline-flex items-center gap-2 text-white/80 hover:text-primary transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Ir al cuestionario</span>
              <ChevronDown className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Questionnaire Section */}
      <section id="cuestionario" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {!showResults ? (
            <FerrataQuestionnaire onComplete={handleQuestionnaireComplete} onReset={handleReset} />
          ) : null}
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section id="resultados" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <FerrataResults filters={filters} onReset={handleReset} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-adventure-dark to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Cuéntame qué tipo de experiencia te gustaría vivir y te ayudaré a encontrar la vía ferrata perfecta para
              ti.
            </p>
            <a
              href="https://wa.me/34685609542?text=¡Hola!%20Me%20gustaría%20información%20sobre%20vías%20ferratas%20en%20Andalucía."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
            >
              <Mountain className="h-5 w-5" />
              Contactar por WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default ViasFerratas;
