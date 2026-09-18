import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ValueProposition } from '@/components/ValueProposition';
import { ActivitiesGrid } from '@/components/ActivitiesGrid';
import { VertigoSapiens } from '@/components/VertigoSapiens';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { BookingForm } from '@/components/BookingForm';
// La newsletter permanece desactivada hasta que exista una suscripción real
// (y una promesa de descuento que podamos cumplir). El componente se conserva.
// import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { TrustBar } from '@/components/TrustBar';


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />

        <ValueProposition />
        <ActivitiesGrid />
        <VertigoSapiens />
        <WhyChooseUs />
        <BookingForm />
        {/* <Newsletter /> desactivada temporalmente */}
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default Index;
