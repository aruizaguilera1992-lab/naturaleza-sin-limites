import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain, ChevronDown, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LevelOffersSection } from "@/components/shared/LevelOffersSection";
import { media } from "@/data/media";

const ViasFerratas = () => {
  // Scroll to top on page load; with a URL hash, scroll to the target section instead.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const scrollToHash = () => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" });
    };
    const frame = window.requestAnimationFrame(scrollToHash);
    const settledLayout = window.setTimeout(scrollToHash, 450);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settledLayout);
    };
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Vías ferratas en Málaga y Andalucía | Naturaleza Sin Límites"
        description="Vías ferratas guiadas en Málaga y Andalucía en tres niveles: iniciación (K1–K2), intermedio (K3–K4) y avanzado (K5–K6). Grupos reducidos."
        path="/vias-ferratas"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src={media.ferrata.src}
          alt={media.ferrata.alt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center pt-56 pb-28 md:pt-60 md:pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6">
              Vías Ferratas: <span className="text-gradient">Adrenalina en las Alturas</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-6">
              Vive la emoción de la pared vertical con total seguridad. Puentes tibetanos, tirolinas y paisajes
              espectaculares te esperan.
            </p>

            {/* BOTÓN VERDE */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  Actividad apta para principiantes con equipo de seguridad
                </span>
              </div>
            </div>

            {/* Flecha para hacer scroll al cuestionario */}
            <motion.a
              href="#experiencias"
              className="inline-flex items-center gap-2 text-white/80 hover:text-primary transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Ver niveles</span>
              <ChevronDown className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      <LevelOffersSection
        discipline="ferratas"
        title="Nuestras salidas de vía ferrata"
        intro="Tres niveles según tu experiencia y tu tolerancia a la altura. La vía concreta se confirma al cerrar la salida."
      />

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
