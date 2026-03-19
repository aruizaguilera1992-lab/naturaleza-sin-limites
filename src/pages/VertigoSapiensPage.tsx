import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { VSHeroSection } from '@/components/vertigo-sapiens/VSHeroSection';
import { VSWhatIsSection } from '@/components/vertigo-sapiens/VSWhatIsSection';
import { VSFunctionalStrengthCard } from '@/components/vertigo-sapiens/VSFunctionalStrengthCard';
import { VSMethodologySection } from '@/components/vertigo-sapiens/VSMethodologySection';
import { VSComponentsSection } from '@/components/vertigo-sapiens/VSComponentsSection';
import { VSPlansSection } from '@/components/vertigo-sapiens/VSPlansSection';
import { VSCalendarSection } from '@/components/vertigo-sapiens/VSCalendarSection';
import { VSTestimonialsSection } from '@/components/vertigo-sapiens/VSTestimonialsSection';
import { VSFacilitiesSection } from '@/components/vertigo-sapiens/VSFacilitiesSection';
import { VSTrainersSection } from '@/components/vertigo-sapiens/VSTrainersSection';
import { VSEnrollmentSection } from '@/components/vertigo-sapiens/VSEnrollmentSection';
import { VSFAQSection } from '@/components/vertigo-sapiens/VSFAQSection';
import { VSTrialFormSection } from '@/components/vertigo-sapiens/VSTrialFormSection';

const VertigoSapiensPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <VSHeroSection />
        <VSWhatIsSection />
        <VSFunctionalStrengthCard />
        <VSMethodologySection />
        <VSComponentsSection />
        <VSPlansSection />
        <VSCalendarSection />
        <VSTestimonialsSection />
        <VSFacilitiesSection />
        <VSTrainersSection />
        <VSEnrollmentSection />
        <VSFAQSection />
        <VSTrialFormSection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default VertigoSapiensPage;
