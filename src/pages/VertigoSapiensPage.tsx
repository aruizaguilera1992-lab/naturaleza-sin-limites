import { useEffect } from 'react';
import { Seo } from '@/components/Seo';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import {
  OnlineHero,
  OnlineProblem,
  OnlineAudience,
  OnlineMethod,
  OnlineProgram,
  OnlineCoach,
  OnlineFAQ,
  OnlineFinalCTA,
} from '@/components/vertigo-sapiens/online/OnlineSections';

// Las secciones de los planes presenciales (VSPlansSection, etc.) se conservan en el
// proyecto pero ya no se muestran: la oferta principal es Vértigo Sapiens Online.
const VertigoSapiensPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Vértigo Sapiens Online | Preparación física para barranquismo y espeleología"
        description="Programa online de 8 semanas de fuerza funcional, resistencia y movilidad para barranquismo, espeleología y actividades verticales. Solicita tu evaluación inicial."
        path="/vertigo-sapiens"
      />
      <Navbar />
      <main>
        <OnlineHero />
        <OnlineProblem />
        <OnlineAudience />
        <OnlineMethod />
        <OnlineProgram />
        <OnlineCoach />
        <OnlineFAQ />
        <OnlineFinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default VertigoSapiensPage;
