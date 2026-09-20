import { Seo } from '@/components/Seo';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { QSHeroSection } from '@/components/quienes-somos/QSHeroSection';
import { QSPathsSection } from '@/components/quienes-somos/QSPathsSection';
import { QSValuesSection } from '@/components/quienes-somos/QSValuesSection';
import { QSExperienceSection } from '@/components/quienes-somos/QSExperienceSection';
import { QSCTASection } from '@/components/quienes-somos/QSCTASection';

const QuienesSomos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Quiénes somos | Naturaleza Sin Límites"
        description="Guía titulado TD2 con experiencia en barrancos, escalada y vías ferratas en Málaga. Grupos reducidos, material homologado y seguridad primero."
        path="/quienes-somos"
      />
      <Navbar />
      <main className="pt-36 md:pt-28 lg:pt-20">
        <QSHeroSection />
        <QSPathsSection />
        <QSValuesSection />
        <QSExperienceSection />
        <QSCTASection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default QuienesSomos;
