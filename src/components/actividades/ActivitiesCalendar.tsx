import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScheduledActivity {
  id: string;
  date: Date;
  type: 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas';
  title: string;
  time: string;
  location: string;
  spotsAvailable: number;
  price: string;
}

const activityIcons: Record<string, { emoji: string; color: string }> = {
  espeleologia: { emoji: '🕳️', color: 'bg-amber-500' },
  barranquismo: { emoji: '🌊', color: 'bg-cyan-500' },
  escalada: { emoji: '🧗', color: 'bg-emerald-500' },
  ferratas: { emoji: '🪜', color: 'bg-purple-500' },
};

// Sample scheduled activities
const generateSampleActivities = (): ScheduledActivity[] => {
  const activities: ScheduledActivity[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Generate some sample activities for the current and next month
  const sampleData = [
    { day: 1, type: 'barranquismo' as const, title: 'Río Verde', time: '09:00', location: 'Granada', spots: 4, price: '55€' },
    { day: 8, type: 'espeleologia' as const, title: 'Cueva de Nerja', time: '10:00', location: 'Málaga', spots: 3, price: '45€' },
    { day: 8, type: 'escalada' as const, title: 'El Chorro - Frontales', time: '09:00', location: 'Málaga', spots: 2, price: '49€' },
    { day: 15, type: 'barranquismo' as const, title: 'Río Guadalmina', time: '10:00', location: 'Málaga', spots: 5, price: '50€' },
    { day: 15, type: 'ferratas' as const, title: 'Caminito del Rey', time: '08:00', location: 'Málaga', spots: 6, price: '50€' },
    { day: 22, type: 'espeleologia' as const, title: 'Cueva del Gato', time: '09:30', location: 'Málaga', spots: 4, price: '55€' },
    { day: 22, type: 'escalada' as const, title: 'Torcal de Antequera', time: '10:00', location: 'Málaga', spots: 3, price: '45€' },
    { day: 29, type: 'barranquismo' as const, title: 'Río Chillar', time: '09:00', location: 'Málaga', spots: 6, price: '45€' },
  ];
  
  sampleData.forEach((item, index) => {
    const date = new Date(currentYear, currentMonth, item.day);
    if (date >= now) {
      activities.push({
        id: `activity-${index}`,
        date,
        type: item.type,
        title: item.title,
        time: item.time,
        location: item.location,
        spotsAvailable: item.spots,
        price: item.price,
      });
    }
  });
  
  // Add some for next month
  sampleData.slice(0, 5).forEach((item, index) => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    activities.push({
      id: `activity-next-${index}`,
      date: new Date(nextYear, nextMonth, item.day + 7),
      type: item.type,
      title: item.title,
      time: item.time,
      location: item.location,
      spotsAvailable: item.spots,
      price: item.price,
    });
  });
  
  return activities;
};

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function ActivitiesCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const activities = useMemo(() => generateSampleActivities(), []);
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [daysInMonth, adjustedFirstDay]);
  
  const getActivitiesForDay = (day: number) => {
    return activities.filter(a => 
      a.date.getDate() === day && 
      a.date.getMonth() === currentMonth && 
      a.date.getFullYear() === currentYear
    );
  };
  
  const selectedActivities = selectedDate 
    ? activities.filter(a => 
        a.date.getDate() === selectedDate.getDate() && 
        a.date.getMonth() === selectedDate.getMonth() && 
        a.date.getFullYear() === selectedDate.getFullYear()
      )
    : [];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };
  
  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-2 sm:p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div 
                key={day} 
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const dayActivities = getActivitiesForDay(day);
              const isSelected = selectedDate?.getDate() === day && 
                selectedDate?.getMonth() === currentMonth && 
                selectedDate?.getFullYear() === currentYear;
              const isToday = new Date().getDate() === day && 
                new Date().getMonth() === currentMonth && 
                new Date().getFullYear() === currentYear;
              
              return (
                <motion.button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "aspect-square p-1 rounded-lg flex flex-col items-center justify-start relative transition-colors",
                    isSelected && "bg-primary/10 ring-2 ring-primary",
                    isToday && !isSelected && "bg-muted",
                    !isSelected && !isToday && "hover:bg-muted/50"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={cn(
                    "text-xs sm:text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {day}
                  </span>
                  
                  {/* Activity indicators */}
                  {dayActivities.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayActivities.slice(0, 3).map((activity, i) => (
                        <span 
                          key={i} 
                          className="text-xs"
                          title={activity.title}
                        >
                          {activityIcons[activity.type]?.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="px-4 sm:px-6 pb-4 flex flex-wrap gap-3 sm:gap-4 justify-center text-xs sm:text-sm text-muted-foreground border-t border-border pt-4">
          <span className="flex items-center gap-1">🕳️ Espeleología</span>
          <span className="flex items-center gap-1">🌊 Barranquismo</span>
          <span className="flex items-center gap-1">🧗 Escalada</span>
          <span className="flex items-center gap-1">🪜 Ferratas</span>
        </div>
      </motion.div>
      
      {/* Selected Day Activities */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            {selectedActivities.length > 0 && (
              <span className="text-muted-foreground font-normal ml-2">
                - {selectedActivities.length} salida{selectedActivities.length > 1 ? 's' : ''} programada{selectedActivities.length > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          
          {selectedActivities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay salidas programadas para este día
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedActivities.map((activity) => {
                const whatsappMessage = encodeURIComponent(
                  `¡Hola! Me interesa la salida de ${activity.title} el ${selectedDate.toLocaleDateString('es-ES')} a las ${activity.time}. ¿Quedan plazas disponibles?`
                );
                const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;
                
                return (
                  <div
                    key={activity.id}
                    className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                      activityIcons[activity.type]?.color + '/20'
                    )}>
                      {activityIcons[activity.type]?.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-foreground">
                        {activity.title}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {activity.spotsAvailable} plazas libres
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <Badge className="bg-primary text-primary-foreground">
                          {activity.price}
                        </Badge>
                        <Button variant="hero" size="sm" asChild>
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                            Reservar
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
