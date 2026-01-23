import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ContactHeroSection } from '@/components/contacto/ContactHeroSection';
import { ContactPathsSection } from '@/components/contacto/ContactPathsSection';
import { ContactInfoSection } from '@/components/contacto/ContactInfoSection';
import { ContactFormSection } from '@/components/contacto/ContactFormSection';
import { ContactClosingSection } from '@/components/contacto/ContactClosingSection';

export default function Contacto() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      <main>
        <ContactHeroSection />
        <ContactPathsSection />
        <ContactInfoSection />
        <ContactFormSection />
        <ContactClosingSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
