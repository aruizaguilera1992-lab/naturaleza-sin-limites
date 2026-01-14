import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ValueProposition } from '@/components/ValueProposition';
import { ActivitiesGrid } from '@/components/ActivitiesGrid';
import { VertigoSapiens } from '@/components/VertigoSapiens';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ValueProposition />
        <ActivitiesGrid />
        <VertigoSapiens />
        <WhyChooseUs />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
