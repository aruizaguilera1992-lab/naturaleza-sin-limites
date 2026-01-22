import { motion } from 'framer-motion';
import { Check, ArrowLeft, Rocket, Calendar, Users, Package, Phone, Mail, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Pack, SelectedActivity, PackDesignerState } from './types';

interface PackStep4SummaryProps {
  pack: Pack;
  selectedActivities: {
    espeleologia?: SelectedActivity;
    barranquismo?: SelectedActivity;
    escalada?: SelectedActivity;
    ferratas?: SelectedActivity;
  };
  participants: number;
  coordinator: PackDesignerState['coordinator'];
  termsAccepted: boolean;
  onToggleTerms: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

const activityEmojis: Record<string, string> = {
  espeleologia: '🕳️',
  barranquismo: '🌊',
  escalada: '🧗',
  ferratas: '🪜',
};

export function PackStep4Summary({
  pack,
  selectedActivities,
  participants,
  coordinator,
  termsAccepted,
  onToggleTerms,
  onBack,
  onConfirm,
}: PackStep4SummaryProps) {
  const activities = Object.entries(selectedActivities).filter(([_, v]) => v?.activity) as [
    'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas',
    SelectedActivity
  ][];
  
  const subtotal = activities.reduce((sum, [_, s]) => sum + s.activity.priceValue, 0);
  const packPrice = parseInt(pack.price.replace('€', ''));
  const discount = subtotal - packPrice;
  
  // Check if group discount applies
  const groupDiscount = participants >= 6 ? 0.05 : 0;
  const totalWithDiscount = Math.round(packPrice * (1 - groupDiscount));
  const pricePerPerson = Math.round(totalWithDiscount / participants);

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
          4️⃣ Resumen de tu pack
        </h3>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{pack.name}</span>
        </div>
      </div>

      {/* Activities Summary */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Actividades seleccionadas:
          </h4>
        </div>
        
        <div className="divide-y divide-border">
          {activities.map(([type, selected]) => (
            <div key={type} className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {activityEmojis[type]} {selected.activity.name}
                </span>
              </div>
              <div className="pl-6 text-sm text-muted-foreground space-y-0.5">
                {selected.date && selected.time && (
                  <p className="flex items-center gap-1">
                    📅 {format(selected.date, "d MMM yyyy", { locale: es })}, {selected.time}h
                  </p>
                )}
                <p className="flex items-center gap-1">
                  👥 {participants} personas
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="border border-border rounded-xl p-4 bg-card space-y-3">
        <h4 className="font-semibold text-foreground">💰 Desglose de precio:</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal actividades:</span>
            <span className="text-foreground">{subtotal}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Descuento pack:</span>
            <span className="text-primary">-{discount}€</span>
          </div>
          {groupDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descuento grupo (+6):</span>
              <span className="text-primary">-{Math.round(packPrice * groupDiscount)}€</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
            <span className="text-foreground">TOTAL:</span>
            <span className="text-foreground">{totalWithDiscount}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio por persona (÷{participants}):</span>
            <span className="text-foreground font-medium">{pricePerPerson}€</span>
          </div>
        </div>
      </div>

      {/* Included Features */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <h4 className="font-semibold text-foreground mb-3">📦 Incluido en tu pack:</h4>
        <div className="grid grid-cols-2 gap-2">
          {pack.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-3 w-3 text-primary" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Coordinator Info */}
      <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{coordinator.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{coordinator.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{coordinator.phone}</span>
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-center gap-3">
        <Checkbox 
          id="terms" 
          checked={termsAccepted}
          onCheckedChange={onToggleTerms}
        />
        <label 
          htmlFor="terms" 
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Acepto los términos y condiciones
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          MODIFICAR
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          disabled={!termsAccepted}
          onClick={onConfirm}
        >
          RESERVAR PACK
          <Rocket className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
