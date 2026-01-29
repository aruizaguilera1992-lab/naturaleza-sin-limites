import { motion } from 'framer-motion';
import { Check, AlertTriangle, Euro, Clock, Gift, MessageCircle, X } from 'lucide-react';
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
  solves: string[];
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
  solves,
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
      className={`bg-card/80 backdrop-blur-sm border rounded-2xl p-6 relative ${
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

      {/* Header */}
      <div className="mb-6 pr-8">
        <h3 className="text-2xl font-heading font-bold text-gradient mb-2">{planName}</h3>
        <p className="text-sm text-muted-foreground italic">"{profile}"</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Components */}
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Qué incluye
            </h5>
            <ul className="space-y-2">
              {components.map((component, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                  <component.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{component.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Options */}
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Opciones de precio
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
                    <div>
                      <span className="text-sm font-medium text-foreground">{option.sessions}</span>
                      <span className="text-xs text-muted-foreground ml-2">({option.total})</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{option.price}</span>
                  </div>
                  {option.note && (
                    <p className="text-xs text-muted-foreground italic">{option.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Commitment & Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Compromiso</span>
              </div>
              <span className="text-sm font-medium text-foreground">{commitment}</span>
            </div>
            <div className="bg-accent/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground">Descuento</span>
              </div>
              <span className="text-sm font-medium text-accent">{discount}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Benefits */}
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
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
          </div>

          {/* WhatsApp CTA */}
          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2"
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
