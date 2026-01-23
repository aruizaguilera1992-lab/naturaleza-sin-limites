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
      <Navbar />
      <main className="pt-20">
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
