import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, AlertTriangle, Euro, Clock, Gift } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PlanComponent {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface PricingOption {
  sessions: string;
  total: string;
  price: string;
}

interface PlanDetailSheetProps {
  profile: string;
  components: PlanComponent[];
  pricingOptions: PricingOption[];
  commitment: string;
  discount: string;
  benefits: string[];
  solves: string[];
  isPopular?: boolean;
}

export function PlanDetailSheet({
  profile,
  components,
  pricingOptions,
  commitment,
  discount,
  benefits,
  solves,
  isPopular = false,
}: PlanDetailSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mt-4">
      <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors py-2">
        <span>{isOpen ? 'Ocultar detalles' : 'Ver todos los detalles'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4 space-y-5"
            >
              {/* Profile */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground italic">
                  "{profile}"
                </p>
              </div>

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
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 && isPopular 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-muted/20'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium text-foreground">{option.sessions}</span>
                        <span className="text-xs text-muted-foreground ml-2">({option.total})</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{option.price}</span>
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

              {/* Problems Solved */}
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  Problemas que resuelve
                </h5>
                <ul className="space-y-2">
                  {solves.map((problem, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="text-accent">✓</span>
                      <span>{problem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}
