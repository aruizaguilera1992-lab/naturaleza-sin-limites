import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Euro, Clock, Gift, MessageCircle, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

interface PlanDetailSheetProps {
  profile: string;
  components: PlanComponent[];
  pricingOptions: PricingOption[];
  commitment: string;
  discount: string;
  benefits: string[];
  motivationalQuote: string;
  isPopular?: boolean;
  ctaLabel: string;
  planName: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function PlanDetailSheet({
  profile,
  components,
  pricingOptions,
  commitment,
  discount,
  benefits,
  motivationalQuote,
  isPopular = false,
  ctaLabel,
  planName,
  isOpen,
  onToggle,
}: PlanDetailSheetProps) {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Estoy interesado en el plan "${planName}" de Vértigo Sapiens. ¿Podrían darme más información?`
    );
    window.open(`https://wa.me/34685609542?text=${message}`, '_blank');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant={isPopular ? 'hero' : 'outline'}
          size="lg"
          className="w-full gap-2"
        >
          <span>{ctaLabel}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4 space-y-4"
            >
              {/* Motivational Quote */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground font-medium italic">
                    "{motivationalQuote}"
                  </p>
                </div>
              </div>

              {/* Components */}
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Qué incluye
                </h5>
                <ul className="space-y-2">
                  {components.map((component, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                      <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                        <component.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span>{component.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing Options */}
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Precios
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
                className="w-full gap-2 mt-2"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-5 w-5" />
                Reservar por WhatsApp
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}
