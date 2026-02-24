import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedActivity } from '@/hooks/useActivitiesData';
import { Pack, SelectedActivity } from './types';
import { PackActivitySelector } from './PackActivitySelector';

interface PackStep1ActivitiesProps {
  pack: Pack;
  activities: UnifiedActivity[];
  selectedActivities: {
    barranquismo?: SelectedActivity;
    escalada?: SelectedActivity;
    ferratas?: SelectedActivity;
  };
  onSelectActivity: (type: 'barranquismo' | 'escalada' | 'ferratas', activity: UnifiedActivity) => void;
  onContinue: () => void;
}

export function PackStep1Activities({
  pack,
  activities,
  selectedActivities,
  onSelectActivity,
  onContinue,
}: PackStep1ActivitiesProps) {
  // Calculate pricing
  const selectedList = Object.values(selectedActivities).filter(Boolean) as SelectedActivity[];
  const subtotal = selectedList.reduce((sum, s) => sum + s.activity.priceValue, 0);
  const packPrice = parseInt(pack.price.replace('€', ''));
  const discount = subtotal - packPrice;
  
  // Check if all required types are selected
  const isComplete = pack.requiredActivityTypes.every(
    type => selectedActivities[type]?.activity
  );

  const getActivitiesByType = (type: 'barranquismo' | 'escalada' | 'ferratas') => {
    return activities.filter(a => a.activityType === type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
          1️⃣ Selecciona tus {pack.activities} actividades
        </h3>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Criterio del pack:</p>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Check className="h-4 w-4" />
            <span>{pack.activities} actividades diferentes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Check className="h-4 w-4" />
            <span>1 de cada disciplina</span>
          </div>
        </div>
      </div>

      {/* Activity Selectors */}
      <div className="space-y-3">
        {pack.requiredActivityTypes.map((type) => (
          <PackActivitySelector
            key={type}
            activityType={type}
            activities={getActivitiesByType(type)}
            selected={selectedActivities[type]}
            onSelect={(activity) => onSelectActivity(type, activity)}
            levelRestriction={pack.levelRestriction}
          />
        ))}
      </div>

      {/* Pricing Summary */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Precio por persona (pack):</span>
          <span className="text-foreground font-semibold">{packPrice}€</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ahorro vs. individual:</span>
            <span className="text-primary font-semibold">-{discount}€/persona</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground pt-2">
          * El precio final se calculará según el número de participantes
        </p>
      </div>

      {/* Continue Button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        disabled={!isComplete}
        onClick={onContinue}
      >
        CONTINUAR
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
      
      {!isComplete && (
        <p className="text-center text-sm text-muted-foreground">
          Selecciona una actividad de cada tipo para continuar
        </p>
      )}
    </motion.div>
  );
}
