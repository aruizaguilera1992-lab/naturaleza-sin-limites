import { Seo } from '@/components/Seo';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ActivitiesGrid } from '@/components/ActivitiesGrid';
import { GuideAuthority } from '@/components/GuideAuthority';
import { VertigoSapiens } from '@/components/VertigoSapiens';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { BookingForm } from '@/components/BookingForm';
// La newsletter permanece desactivada hasta que exista una suscripción real
// (y una promesa de descuento que podamos cumplir). El componente se conserva.
// import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { HomeCalendarSection } from '@/components/home/HomeCalendarSection';
import { SafetyAssuranceSection } from '@/components/home/SafetyAssuranceSection';


const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Seo
        title="Barranquismo, escalada y vías ferratas en Málaga | Naturaleza Sin Límites"
        description="Vive la aventura en Málaga: barrancos, escalada y vías ferratas con guía titulado TD2. Grupos reducidos de máximo 6 personas y todo el material incluido. ¡Reserva tu plaza!"
        path="/"
      />
      <Navbar />
      <main>
        <HeroSection />
        <SafetyAssuranceSection />
        <ActivitiesGrid />
        <HomeCalendarSection />

        <GuideAuthority />
        <WhyChooseUs />
        <VertigoSapiens />
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
