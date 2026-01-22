import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Sparkles, Mountain, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivitiesData, UnifiedActivity } from '@/hooks/useActivitiesData';
import { Pack, PackDesignerState, SelectedActivity, initialState } from './types';
import { PackStepIndicator } from './PackStepIndicator';
import { PackStep1Activities } from './PackStep1Activities';
import { PackStep2Dates } from './PackStep2Dates';
import { PackStep3Participants } from './PackStep3Participants';
import { PackStep4Summary } from './PackStep4Summary';

// Pack definitions with validation criteria
const packConfigs: Omit<Pack, 'icon'>[] = [
  {
    id: 'aventura-completa',
    name: 'AVENTURA COMPLETA',
    subtitle: 'La experiencia definitiva',
    description: '4 actividades diferentes para descubrir todas las disciplinas verticales',
    activities: 4,
    types: ['Espeleología', 'Barranquismo', 'Escalada', 'Vía Ferrata'],
    price: '180€',
    originalPrice: '220€',
    savings: '40€',
    color: 'from-primary to-primary/60',
    features: [
      '1 salida de cada actividad',
      'Material incluido siempre',
      'Guías profesionales',
      'Fotos de todas las salidas',
      'Válido 6 meses',
    ],
    validityMonths: 6,
    requiredActivityTypes: ['espeleologia', 'barranquismo', 'escalada', 'ferratas'],
    levelRestriction: 'any',
  },
  {
    id: 'vertical-integral',
    name: 'VERTICAL INTEGRAL',
    subtitle: 'Para amantes de la altura',
    description: '3 actividades verticales para dominar la progresión en altura',
    activities: 3,
    types: ['Espeleología Vertical', 'Escalada', 'Vía Ferrata'],
    price: '165€',
    originalPrice: '195€',
    savings: '30€',
    color: 'from-emerald-500 to-emerald-500/60',
    features: [
      '1 sima vertical',
      '1 jornada de escalada',
      '1 vía ferrata técnica',
      'Curso de progresión incluido',
      'Válido 4 meses',
    ],
    validityMonths: 4,
    requiredActivityTypes: ['espeleologia', 'escalada', 'ferratas'],
    levelRestriction: 'any',
  },
  {
    id: 'experto-total',
    name: 'EXPERTO TOTAL',
    subtitle: 'El desafío máximo',
    description: '5 actividades de nivel alto para los más experimentados',
    activities: 4,
    types: ['Espeleología Avanzada', 'Barranquismo Técnico', 'Escalada Deportiva', 'Ferratas K4+'],
    price: '240€',
    originalPrice: '290€',
    savings: '50€',
    color: 'from-amber-500 to-amber-500/60',
    features: [
      'Solo actividades nivel alto',
      'Acceso a salidas exclusivas',
      'Grupo reducido (máx. 4)',
      'Sesión de técnica incluida',
      'Válido 12 meses',
    ],
    validityMonths: 12,
    requiredActivityTypes: ['espeleologia', 'barranquismo', 'escalada', 'ferratas'],
    levelRestriction: 'high',
    minGroupSize: 2,
  },
];

const packIcons: Record<string, React.ElementType> = {
  'aventura-completa': Sparkles,
  'vertical-integral': Mountain,
  'experto-total': Trophy,
};

interface PackDesignerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packId: string;
}

export function PackDesignerModal({ open, onOpenChange, packId }: PackDesignerModalProps) {
  const { activities: allActivities } = useActivitiesData();
  const [state, setState] = useState<PackDesignerState>({ ...initialState });
  
  // Get pack config
  const pack = useMemo(() => {
    const config = packConfigs.find(p => p.id === packId);
    if (!config) return null;
    return { ...config, icon: packIcons[packId] || Sparkles } as Pack;
  }, [packId]);

  // Reset state when modal opens with new pack
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setState({ ...initialState });
    }
    onOpenChange(open);
  };

  if (!pack) return null;

  const stepLabels = ['Actividades', 'Fechas', 'Participantes', 'Confirmación'];
  const packPrice = parseInt(pack.price.replace('€', ''));

  // Handlers
  const handleSelectActivity = (
    type: 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas',
    activity: UnifiedActivity
  ) => {
    setState(prev => ({
      ...prev,
      selectedActivities: {
        ...prev.selectedActivities,
        [type]: { activity },
      },
    }));
  };

  const handleUpdateActivity = (
    type: 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas',
    updates: Partial<SelectedActivity>
  ) => {
    setState(prev => ({
      ...prev,
      selectedActivities: {
        ...prev.selectedActivities,
        [type]: { ...prev.selectedActivities[type], ...updates },
      },
    }));
  };

  const handleConfirm = () => {
    // Build WhatsApp message
    const activities = Object.entries(state.selectedActivities)
      .filter(([_, v]) => v?.activity)
      .map(([type, selected]) => {
        const sel = selected as SelectedActivity;
        const dateStr = sel.date ? format(sel.date, "d MMM yyyy", { locale: es }) : 'Por confirmar';
        return `- ${sel.activity.name}: ${dateStr} ${sel.time || ''}`;
      })
      .join('\n');

    const groupDiscount = state.participants >= 6 ? 0.05 : 0;
    const totalPrice = Math.round(packPrice * (1 - groupDiscount));

    const message = `🎒 *RESERVA PACK ${pack.name}*

📋 *Actividades:*
${activities}

👥 *Participantes:* ${state.participants} personas
💰 *Total:* ${totalPrice}€ (${Math.round(totalPrice / state.participants)}€/persona)

👤 *Coordinador:*
${state.coordinator.name}
📧 ${state.coordinator.email}
📱 ${state.coordinator.phone}

¡Esperamos confirmar fechas pronto!`;

    const whatsappUrl = `https://wa.me/34685609542?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className={`bg-gradient-to-r ${pack.color} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            {state.step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, step: prev.step - 1 }))}
                className="text-white hover:bg-white/20 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            )}
            <div className="flex-1" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <pack.icon className="h-6 w-6" />
                <h2 className="text-xl font-heading font-bold">{pack.name}</h2>
              </div>
              <p className="text-white/80 text-sm">{pack.subtitle}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white border-0 text-lg px-3 py-1">
                {pack.price}
              </Badge>
              <p className="text-white/80 text-xs mt-1">Ahorras {pack.savings}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-0 overflow-hidden">
          {/* Sidebar - Step Indicator */}
          <div className="md:w-48 p-6 bg-muted/30 border-r border-border hidden md:block">
            <PackStepIndicator 
              currentStep={state.step} 
              totalSteps={4} 
              labels={stepLabels}
            />
          </div>
          
          {/* Mobile Step Indicator */}
          <div className="md:hidden p-4 border-b border-border bg-muted/30 flex justify-center">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-all ${
                    step <= state.step ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
            <AnimatePresence mode="wait">
              {state.step === 1 && (
                <PackStep1Activities
                  key="step1"
                  pack={pack}
                  activities={allActivities}
                  selectedActivities={state.selectedActivities}
                  onSelectActivity={handleSelectActivity}
                  onContinue={() => setState(prev => ({ ...prev, step: 2 }))}
                />
              )}
              
              {state.step === 2 && (
                <PackStep2Dates
                  key="step2"
                  pack={pack}
                  selectedActivities={state.selectedActivities}
                  onUpdateActivity={handleUpdateActivity}
                  onContinue={() => setState(prev => ({ ...prev, step: 3 }))}
                  onBack={() => setState(prev => ({ ...prev, step: 1 }))}
                />
              )}
              
              {state.step === 3 && (
                <PackStep3Participants
                  key="step3"
                  pack={pack}
                  participants={state.participants}
                  coordinator={state.coordinator}
                  packPrice={packPrice}
                  onUpdateParticipants={(count) => setState(prev => ({ ...prev, participants: count }))}
                  onUpdateCoordinator={(coordinator) => setState(prev => ({ ...prev, coordinator }))}
                  onContinue={() => setState(prev => ({ ...prev, step: 4 }))}
                  onBack={() => setState(prev => ({ ...prev, step: 2 }))}
                />
              )}
              
              {state.step === 4 && (
                <PackStep4Summary
                  key="step4"
                  pack={pack}
                  selectedActivities={state.selectedActivities}
                  participants={state.participants}
                  coordinator={state.coordinator}
                  termsAccepted={state.termsAccepted}
                  onToggleTerms={() => setState(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}
                  onBack={() => setState(prev => ({ ...prev, step: 3 }))}
                  onConfirm={handleConfirm}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
