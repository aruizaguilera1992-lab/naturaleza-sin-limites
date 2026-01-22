import { motion } from 'framer-motion';
import { Users, Minus, Plus, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pack, PackDesignerState } from './types';

interface PackStep3ParticipantsProps {
  pack: Pack;
  participants: number;
  coordinator: PackDesignerState['coordinator'];
  packPrice: number;
  onUpdateParticipants: (count: number) => void;
  onUpdateCoordinator: (coordinator: PackDesignerState['coordinator']) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PackStep3Participants({
  pack,
  participants,
  coordinator,
  packPrice,
  onUpdateParticipants,
  onUpdateCoordinator,
  onContinue,
  onBack,
}: PackStep3ParticipantsProps) {
  // packPrice is the price PER PERSON
  const pricePerPerson = packPrice;
  const minParticipants = pack.minGroupSize || 1;
  const maxParticipants = 20;
  
  // Calculate group total
  const subtotalGroup = pricePerPerson * participants;
  
  // Check if group discount applies (5% off for 6+ people)
  const groupDiscount = participants >= 6 ? 0.05 : 0;
  const discountAmount = Math.round(subtotalGroup * groupDiscount);
  const totalWithDiscount = subtotalGroup - discountAmount;
  
  const isValid = 
    coordinator.name.trim().length >= 2 &&
    coordinator.email.includes('@') &&
    coordinator.phone.replace(/\D/g, '').length >= 9;

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
          3️⃣ ¿Cuántos sois?
        </h3>
        <p className="text-sm text-muted-foreground">
          Indica el número de participantes y los datos del coordinador
        </p>
      </div>

      {/* Participants Counter */}
      <div className="border border-border rounded-xl p-6 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Número de participantes</span>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateParticipants(Math.max(minParticipants, participants - 1))}
            disabled={participants <= minParticipants}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="text-4xl font-bold text-foreground min-w-[3ch] text-center">
            {participants}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateParticipants(Math.min(maxParticipants, participants + 1))}
            disabled={participants >= maxParticipants}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Precio por persona: <span className="text-foreground font-semibold">{pricePerPerson}€</span>
          </p>
          {groupDiscount > 0 && (
            <p className="text-sm text-primary">
              ✓ Descuento grupo (+6 personas): -{discountAmount}€
            </p>
          )}
          <p className="text-lg font-bold text-foreground">
            Total grupo ({participants} personas): {totalWithDiscount}€
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Grupo mínimo por salida: 4 personas</p>
          <p>• Si sois menos, podéis uniros a grupo</p>
          <p>• Descuento grupo (+6): -5% adicional</p>
        </div>
      </div>

      {/* Coordinator Form */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h4 className="font-semibold text-foreground">Datos del coordinador del grupo:</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coordinator-name">Nombre completo *</Label>
            <Input
              id="coordinator-name"
              placeholder="Tu nombre completo"
              value={coordinator.name}
              onChange={(e) => onUpdateCoordinator({ ...coordinator, name: e.target.value })}
              className="bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coordinator-email">Email *</Label>
            <Input
              id="coordinator-email"
              type="email"
              placeholder="tu@email.com"
              value={coordinator.email}
              onChange={(e) => onUpdateCoordinator({ ...coordinator, email: e.target.value })}
              className="bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coordinator-phone">Teléfono *</Label>
            <Input
              id="coordinator-phone"
              type="tel"
              placeholder="+34 600 000 000"
              value={coordinator.phone}
              onChange={(e) => onUpdateCoordinator({ ...coordinator, phone: e.target.value })}
              className="bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          ATRÁS
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          disabled={!isValid}
          onClick={onContinue}
        >
          CONTINUAR
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {!isValid && (
        <p className="text-center text-sm text-muted-foreground">
          Completa todos los datos del coordinador
        </p>
      )}
    </motion.div>
  );
}
