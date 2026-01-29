import { motion } from 'framer-motion';
import { Check, Euro, Clock, Gift, MessageCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanComponent {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface PricingOption {
  sessions: string;
  total: string;
  price: string;
  note?: string;
}

interface PlanDetailCardProps {
  profile: string;
  components: PlanComponent[];
  pricingOptions: PricingOption[];
  commitment: string;
  discount: string;
  benefits: string[];
  motivationalQuote: string;
  isPopular?: boolean;
  planName: string;
  onClose: () => void;
}

export function PlanDetailCard({
  profile,
  components,
  pricingOptions,
  commitment,
  discount,
  benefits,
  motivationalQuote,
  isPopular = false,
  planName,
  onClose,
}: PlanDetailCardProps) {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Estoy interesado en el plan "${planName}" de Vértigo Sapiens. ¿Podrían darme más información?`
    );
    window.open(`https://wa.me/34685609542?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`bg-card/80 backdrop-blur-sm border rounded-2xl p-6 mt-6 relative ${
        isPopular ? 'border-primary shadow-glow' : 'border-border'
      }`}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Header with Motivational Quote */}
      <div className="mb-6 pr-8">
        <h3 className="text-2xl font-heading font-bold text-gradient mb-3">{planName}</h3>
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground font-medium italic">
              "{motivationalQuote}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Column 1: What's Included */}
        <div className="space-y-4">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Qué incluye
          </h5>
          <ul className="space-y-3">
            {components.map((component, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                  <component.icon className="h-4 w-4 text-primary" />
                </div>
                <span>{component.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Pricing & Terms */}
        <div className="space-y-4">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Precios y condiciones
          </h5>
          
          <div className="space-y-2">
            {pricingOptions.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  index === 0 && isPopular 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{option.sessions}</span>
                  <span className="text-sm font-bold text-primary">{option.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">{option.total}</p>
                {option.note && (
                  <p className="text-xs text-muted-foreground/80 italic mt-1">{option.note}</p>
                )}
              </div>
            ))}
          </div>

          {/* Commitment & Discount */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Compromiso</span>
              </div>
              <span className="text-sm font-medium text-foreground">{commitment}</span>
            </div>
            <div className="bg-accent/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-muted-foreground">Descuento</span>
              </div>
              <span className="text-sm font-medium text-accent">{discount}</span>
            </div>
          </div>
        </div>

        {/* Column 3: Benefits & CTA */}
        <div className="space-y-4">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Beneficios clave
          </h5>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* WhatsApp CTA */}
          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2 mt-auto"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-5 w-5" />
            Reservar por WhatsApp
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
