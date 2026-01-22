import { motion } from 'framer-motion';
import { CalendarIcon, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pack, SelectedActivity } from './types';

interface PackStep2DatesProps {
  pack: Pack;
  selectedActivities: {
    espeleologia?: SelectedActivity;
    barranquismo?: SelectedActivity;
    escalada?: SelectedActivity;
    ferratas?: SelectedActivity;
  };
  onUpdateActivity: (
    type: 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas',
    updates: Partial<SelectedActivity>
  ) => void;
  onContinue: () => void;
  onBack: () => void;
}

const activityEmojis: Record<string, string> = {
  espeleologia: '🕳️',
  barranquismo: '🌊',
  escalada: '🧗',
  ferratas: '🪜',
};

export function PackStep2Dates({
  pack,
  selectedActivities,
  onUpdateActivity,
  onContinue,
  onBack,
}: PackStep2DatesProps) {
  const activities = Object.entries(selectedActivities).filter(([_, v]) => v?.activity) as [
    'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas',
    SelectedActivity
  ][];
  
  const allDatesSelected = activities.every(([_, selected]) => selected.date);
  const validityEndDate = addMonths(new Date(), pack.validityMonths);

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
          2️⃣ Programa tus salidas
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecciona fechas para cada actividad
        </p>
      </div>

      {/* Date Selectors for each activity */}
      <div className="space-y-4">
        {activities.map(([type, selected]) => (
          <div 
            key={type} 
            className="border border-border rounded-xl p-4 bg-card space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{activityEmojis[type]}</span>
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
                  {selected.date ? (
                    format(selected.date, "dd/MM/yyyy", { locale: es })
                  ) : (
                    "Seleccionar fecha"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={selected.date}
                  onSelect={(date) => date && onUpdateActivity(type, { ...selected, date })}
                  disabled={(date) => 
                    date < new Date() || date > validityEndDate
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <p className="text-xs text-muted-foreground">
              Disponibilidad: Sábados y domingos
            </p>
          </div>
        ))}
      </div>

      {/* Validity Info */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">
          Validez del pack: <span className="text-foreground font-medium">{pack.validityMonths} meses</span>
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          Fecha límite: <span className="text-foreground font-medium">{format(validityEndDate, "d MMMM yyyy", { locale: es })}</span>
        </span>
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
          disabled={!allDatesSelected}
          onClick={onContinue}
        >
          CONTINUAR
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {!allDatesSelected && (
        <p className="text-center text-sm text-muted-foreground">
          Selecciona fecha para todas las actividades
        </p>
      )}
    </motion.div>
  );
}
