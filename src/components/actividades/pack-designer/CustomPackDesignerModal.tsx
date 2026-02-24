import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, X, Plus, Trash2, Rocket, 
  Calendar as CalendarIcon, Clock, Users, User, Mail, Phone,
  Check, Sparkles, Mountain, Waves, Pickaxe, Route
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivitiesData, UnifiedActivity } from '@/hooks/useActivitiesData';

interface SelectedCustomActivity {
  activity: UnifiedActivity;
  date?: Date;
  time?: string;
}

interface CustomPackState {
  step: number;
  selectedActivities: SelectedCustomActivity[];
  participants: number;
  coordinator: {
    name: string;
    email: string;
    phone: string;
  };
  termsAccepted: boolean;
}

const initialState: CustomPackState = {
  step: 1,
  selectedActivities: [],
  participants: 4,
  coordinator: {
    name: '',
    email: '',
    phone: '',
  },
  termsAccepted: false,
};

const activityTypeConfig: Record<string, { icon: React.ElementType; label: string; emoji: string; color: string }> = {
  barranquismo: { icon: Waves, label: 'Barranquismo', emoji: '🌊', color: 'bg-blue-500' },
  escalada: { icon: Pickaxe, label: 'Escalada', emoji: '🧗', color: 'bg-emerald-500' },
  ferratas: { icon: Route, label: 'Vía Ferrata', emoji: '🪜', color: 'bg-purple-500' },
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '14:00', '15:00', '16:00'
];

interface CustomPackDesignerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomPackDesignerModal({ open, onOpenChange }: CustomPackDesignerModalProps) {
  const { activities: allActivities } = useActivitiesData();
  const [state, setState] = useState<CustomPackState>({ ...initialState });
  const [activeCategory, setActiveCategory] = useState<string>('todas');

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setState({ ...initialState });
      setActiveCategory('todas');
    }
    onOpenChange(open);
  };

  // Filter activities by category
  const filteredActivities = useMemo(() => {
    if (activeCategory === 'todas') return allActivities;
    return allActivities.filter(a => a.activityType === activeCategory);
  }, [allActivities, activeCategory]);

  // Calculate pricing
  const subtotal = state.selectedActivities.reduce((sum, s) => sum + s.activity.priceValue, 0);
  const subtotalGroup = subtotal * state.participants;
  
  // Custom pack discount: 10% off for 3+ activities, 15% for 5+
  const activityDiscount = state.selectedActivities.length >= 5 ? 0.15 : 
                           state.selectedActivities.length >= 3 ? 0.10 : 0;
  const activityDiscountAmount = Math.round(subtotalGroup * activityDiscount);
  
  // Group discount: 5% for 6+ people
  const groupDiscount = state.participants >= 6 ? 0.05 : 0;
  const afterActivityDiscount = subtotalGroup - activityDiscountAmount;
  const groupDiscountAmount = Math.round(afterActivityDiscount * groupDiscount);
  
  const totalPrice = afterActivityDiscount - groupDiscountAmount;
  const pricePerPerson = state.selectedActivities.length > 0 ? Math.round(totalPrice / state.participants) : 0;

  // Add activity
  const handleAddActivity = (activity: UnifiedActivity) => {
    setState(prev => ({
      ...prev,
      selectedActivities: [...prev.selectedActivities, { activity }],
    }));
  };

  // Remove activity
  const handleRemoveActivity = (index: number) => {
    setState(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.filter((_, i) => i !== index),
    }));
  };

  // Update activity date/time
  const handleUpdateActivity = (index: number, updates: Partial<SelectedCustomActivity>) => {
    setState(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.map((a, i) => 
        i === index ? { ...a, ...updates } : a
      ),
    }));
  };

  // Check if activity is already selected
  const isActivitySelected = (activityId: string) => {
    return state.selectedActivities.some(s => s.activity.id === activityId);
  };

  // Validation
  const canProceedStep1 = state.selectedActivities.length >= 2;
  const canProceedStep2 = state.selectedActivities.every(s => s.date);
  const canProceedStep3 = 
    state.coordinator.name.trim().length >= 2 &&
    state.coordinator.email.includes('@') &&
    state.coordinator.phone.replace(/\D/g, '').length >= 9;

  const validityEndDate = addMonths(new Date(), 12);

  // Confirm and send to WhatsApp
  const handleConfirm = () => {
    const activitiesList = state.selectedActivities.map(s => {
      const dateStr = s.date ? format(s.date, "d MMM yyyy", { locale: es }) : 'Por confirmar';
      return `- ${s.activity.name}: ${dateStr}`;
    }).join('\n');

    const discounts = [];
    if (activityDiscount > 0) {
      discounts.push(`Descuento pack (${Math.round(activityDiscount * 100)}%): -${activityDiscountAmount}€`);
    }
    if (groupDiscount > 0) {
      discounts.push(`Descuento grupo (+6): -${groupDiscountAmount}€`);
    }

    const message = `✨ *PACK PERSONALIZADO*

📋 *Actividades seleccionadas (${state.selectedActivities.length}):*
${activitiesList}

👥 *Participantes:* ${state.participants} personas
${discounts.length > 0 ? `🎉 *Descuentos:*\n${discounts.join('\n')}\n` : ''}
💵 *TOTAL:* ${totalPrice}€ (${pricePerPerson}€/persona)

👤 *Coordinador:*
${state.coordinator.name}
📧 ${state.coordinator.email}
📱 ${state.coordinator.phone}

¡Esperamos confirmar fechas pronto!`;

    const whatsappUrl = `https://wa.me/34685609542?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    handleOpenChange(false);
  };

  const stepLabels = ['Actividades', 'Fechas', 'Participantes', 'Resumen'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/60 p-6 text-white">
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
                <Sparkles className="h-6 w-6" />
                <h2 className="text-xl font-heading font-bold">PACK PERSONALIZADO</h2>
              </div>
              <p className="text-white/80 text-sm">Crea tu aventura a medida</p>
            </div>
            {state.selectedActivities.length > 0 && (
              <div className="text-right">
                <Badge className="bg-white/20 text-white border-0 text-lg px-3 py-1">
                  {totalPrice}€
                </Badge>
                <p className="text-white/80 text-xs mt-1">
                  {state.selectedActivities.length} actividades
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-4 border-b border-border bg-muted/30 flex justify-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  step <= state.step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step}
              </div>
              <span className={cn(
                "text-sm hidden sm:inline",
                step <= state.step ? "text-foreground" : "text-muted-foreground"
              )}>
                {stepLabels[step - 1]}
              </span>
              {step < 4 && <div className="w-8 h-0.5 bg-border hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[55vh] p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Activities */}
            {state.step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    1️⃣ Elige tus actividades
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona al menos 2 actividades. ¡Cuantas más añadas, más ahorras!
                  </p>
                  <div className="flex gap-2 mt-3 text-xs">
                    <Badge variant="outline" className="text-primary border-primary">
                      3+ actividades: 10% dto
                    </Badge>
                    <Badge variant="outline" className="text-primary border-primary">
                      5+ actividades: 15% dto
                    </Badge>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeCategory === 'todas' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('todas')}
                  >
                    Todas
                  </Button>
                  {Object.entries(activityTypeConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={activeCategory === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(key)}
                    >
                      {config.emoji} {config.label}
                    </Button>
                  ))}
                </div>

                {/* Selected Activities */}
                {state.selectedActivities.length > 0 && (
                  <div className="border border-primary/30 rounded-xl p-4 bg-primary/5">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Seleccionadas ({state.selectedActivities.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {state.selectedActivities.map((selected, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {activityTypeConfig[selected.activity.activityType]?.emoji}
                          {selected.activity.name}
                          <span className="text-muted-foreground ml-1">
                            {selected.activity.price}
                          </span>
                          <button
                            onClick={() => handleRemoveActivity(index)}
                            className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity Grid */}
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                  {filteredActivities.map((activity) => {
                    const isSelected = isActivitySelected(activity.id);
                    const config = activityTypeConfig[activity.activityType];
                    
                    return (
                      <button
                        key={activity.id}
                        onClick={() => !isSelected && handleAddActivity(activity)}
                        disabled={isSelected}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          isSelected 
                            ? "border-primary/30 bg-primary/5 opacity-50 cursor-not-allowed"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white", config?.color)}>
                          <span>{config?.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{activity.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.province} · {activity.levelLabel}
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {activity.price}
                        </Badge>
                        {!isSelected && (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pricing */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal por persona:</span>
                    <span className="text-foreground">{subtotal}€</span>
                  </div>
                  {activityDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento pack ({Math.round(activityDiscount * 100)}%):</span>
                      <span className="text-primary font-semibold">-{Math.round(subtotal * activityDiscount)}€/persona</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!canProceedStep1}
                  onClick={() => setState(prev => ({ ...prev, step: 2 }))}
                >
                  CONTINUAR
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                {!canProceedStep1 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Selecciona al menos 2 actividades para continuar
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 2: Dates */}
            {state.step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    2️⃣ Programa tus salidas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona fecha para cada actividad
                  </p>
                </div>

                <div className="space-y-4">
                  {state.selectedActivities.map((selected, index) => {
                    const config = activityTypeConfig[selected.activity.activityType];
                    return (
                      <div 
                        key={index}
                        className="border border-border rounded-xl p-4 bg-card space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config?.emoji}</span>
                          <span className="font-semibold text-foreground">{selected.activity.name}</span>
                        </div>
                        
                        {/* Date Picker */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selected.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selected.date ? format(selected.date, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[100]" align="start">
                            <Calendar
                              mode="single"
                              selected={selected.date}
                              onSelect={(date) => date && handleUpdateActivity(index, { date })}
                              disabled={(date) => date < new Date() || date > validityEndDate}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Validez: <span className="text-foreground font-medium">12 meses</span> · 
                    Hasta {format(validityEndDate, "d MMMM yyyy", { locale: es })}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setState(prev => ({ ...prev, step: 1 }))}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ATRÁS
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={!canProceedStep2}
                    onClick={() => setState(prev => ({ ...prev, step: 3 }))}
                  >
                    CONTINUAR
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Participants */}
            {state.step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    3️⃣ ¿Cuántos sois?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Indica participantes y datos de contacto
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
                      onClick={() => setState(prev => ({ ...prev, participants: Math.max(1, prev.participants - 1) }))}
                      disabled={state.participants <= 1}
                    >
                      <span className="text-lg">−</span>
                    </Button>
                    <span className="text-4xl font-bold text-foreground min-w-[3ch] text-center">
                      {state.participants}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setState(prev => ({ ...prev, participants: Math.min(20, prev.participants + 1) }))}
                      disabled={state.participants >= 20}
                    >
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Precio por persona: <span className="text-foreground font-semibold">{pricePerPerson}€</span>
                    </p>
                    {groupDiscount > 0 && (
                      <p className="text-sm text-primary">
                        ✓ Descuento grupo aplicado: -{groupDiscountAmount}€
                      </p>
                    )}
                    <p className="text-lg font-bold text-foreground">
                      Total grupo: {totalPrice}€
                    </p>
                  </div>
                </div>

                {/* Coordinator Form */}
                <div className="border border-border rounded-xl p-6 bg-card space-y-4">
                  <h4 className="font-semibold text-foreground">Datos del coordinador:</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-name">Nombre completo *</Label>
                      <Input
                        id="custom-name"
                        placeholder="Tu nombre completo"
                        value={state.coordinator.name}
                        onChange={(e) => setState(prev => ({ 
                          ...prev, 
                          coordinator: { ...prev.coordinator, name: e.target.value } 
                        }))}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="custom-email">Email *</Label>
                      <Input
                        id="custom-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={state.coordinator.email}
                        onChange={(e) => setState(prev => ({ 
                          ...prev, 
                          coordinator: { ...prev.coordinator, email: e.target.value } 
                        }))}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="custom-phone">Teléfono *</Label>
                      <Input
                        id="custom-phone"
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={state.coordinator.phone}
                        onChange={(e) => setState(prev => ({ 
                          ...prev, 
                          coordinator: { ...prev.coordinator, phone: e.target.value } 
                        }))}
                        className="bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setState(prev => ({ ...prev, step: 2 }))}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ATRÁS
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={!canProceedStep3}
                    onClick={() => setState(prev => ({ ...prev, step: 4 }))}
                  >
                    CONTINUAR
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Summary */}
            {state.step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    4️⃣ Resumen de tu pack
                  </h3>
                </div>

                {/* Activities */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  <div className="p-4 bg-muted/30 border-b border-border">
                    <h4 className="font-semibold text-foreground">
                      📋 Actividades ({state.selectedActivities.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-border">
                    {state.selectedActivities.map((selected, index) => {
                      const config = activityTypeConfig[selected.activity.activityType];
                      return (
                        <div key={index} className="p-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">
                              {config?.emoji} {selected.activity.name}
                            </span>
                          </div>
                          <div className="pl-6 text-sm text-muted-foreground">
                            {selected.date && (
                              <p>📅 {format(selected.date, "d MMM yyyy", { locale: es })}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border border-border rounded-xl p-4 bg-card space-y-3">
                  <h4 className="font-semibold text-foreground">💰 Desglose de precio:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal por persona:</span>
                      <span className="text-foreground">{subtotal}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participantes:</span>
                      <span className="text-foreground">×{state.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal grupo:</span>
                      <span className="text-foreground">{subtotalGroup}€</span>
                    </div>
                    {activityDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Descuento pack ({Math.round(activityDiscount * 100)}%):</span>
                        <span className="text-primary">-{activityDiscountAmount}€</span>
                      </div>
                    )}
                    {groupDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Descuento grupo (+6):</span>
                        <span className="text-primary">-{groupDiscountAmount}€</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                      <span className="text-foreground">TOTAL:</span>
                      <span className="text-foreground">{totalPrice}€</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Por persona:</span>
                      <span className="text-foreground font-medium">{pricePerPerson}€</span>
                    </div>
                  </div>
                </div>

                {/* Coordinator */}
                <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{state.coordinator.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{state.coordinator.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{state.coordinator.phone}</span>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="custom-terms" 
                    checked={state.termsAccepted}
                    onCheckedChange={() => setState(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}
                  />
                  <label htmlFor="custom-terms" className="text-sm text-muted-foreground cursor-pointer">
                    Acepto los términos y condiciones
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setState(prev => ({ ...prev, step: 3 }))}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    MODIFICAR
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={!state.termsAccepted}
                    onClick={handleConfirm}
                  >
                    RESERVAR PACK
                    <Rocket className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
