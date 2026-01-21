import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { VSHeroSection } from '@/components/vertigo-sapiens/VSHeroSection';
import { VSWhatIsSection } from '@/components/vertigo-sapiens/VSWhatIsSection';
import { VSMethodologySection } from '@/components/vertigo-sapiens/VSMethodologySection';
import { VSComponentsSection } from '@/components/vertigo-sapiens/VSComponentsSection';
import { VSPlansSection } from '@/components/vertigo-sapiens/VSPlansSection';
import { VSCalendarSection } from '@/components/vertigo-sapiens/VSCalendarSection';
import { VSTestimonialsSection } from '@/components/vertigo-sapiens/VSTestimonialsSection';
import { VSFAQSection } from '@/components/vertigo-sapiens/VSFAQSection';
import { VSTrialFormSection } from '@/components/vertigo-sapiens/VSTrialFormSection';

const VertigoSapiensPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <VSHeroSection />
        <VSWhatIsSection />
        <VSMethodologySection />
        <VSComponentsSection />
        <VSPlansSection />
        <VSCalendarSection />
        <VSTestimonialsSection />
        <VSFAQSection />
        <VSTrialFormSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default VertigoSapiensPage;
