import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ValueProposition } from '@/components/ValueProposition';
import { ActivitiesGrid } from '@/components/ActivitiesGrid';
import { VertigoSapiens } from '@/components/VertigoSapiens';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { BookingForm } from '@/components/BookingForm';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';

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
        <BookingForm />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default Index;
