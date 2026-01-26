import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarViewMode } from './calendar/types';
import { CalendarDayView } from './calendar/CalendarDayView';
import { CalendarWeekView } from './calendar/CalendarWeekView';
import { CalendarMonthView } from './calendar/CalendarMonthView';

export function VSCalendarSection() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 1)); // February 2026
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(subDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(subWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(addMonths(selectedDate, 1));
        break;
    }
  };

  const getNavigationLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, "d 'de' MMMM yyyy", { locale: es });
      case 'week':
        return format(selectedDate, "MMMM yyyy", { locale: es });
      case 'month':
        return format(selectedDate, "MMMM yyyy", { locale: es });
    }
  };

  const viewModes = [
    { id: 'day' as const, label: 'Día', icon: Calendar },
    { id: 'week' as const, label: 'Semana', icon: CalendarDays },
    { id: 'month' as const, label: 'Mes', icon: CalendarRange },
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)`
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground tracking-wide">
              Calendario de <span className="text-gradient">Actividades</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entrenamientos, salidas outdoor y eventos especiales
          </p>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex bg-card/50 backdrop-blur-sm border border-border rounded-xl p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === mode.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <mode.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="border-border hover:bg-primary hover:text-primary-foreground hover:border-primary h-10 w-10 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl px-6 py-3 min-w-[200px] text-center">
            <span className="text-foreground font-heading font-semibold text-lg capitalize">
              {getNavigationLabel()}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="border-border hover:bg-primary hover:text-primary-foreground hover:border-primary h-10 w-10 transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Calendar View */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {viewMode === 'day' && (
              <CalendarDayView key="day" selectedDate={selectedDate} />
            )}
            {viewMode === 'week' && (
              <CalendarWeekView key="week" selectedDate={selectedDate} />
            )}
            {viewMode === 'month' && (
              <CalendarMonthView 
                key="month" 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
