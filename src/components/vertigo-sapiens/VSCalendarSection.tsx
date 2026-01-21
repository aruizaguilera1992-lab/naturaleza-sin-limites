import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

const activityTypes = {
  training: { label: 'Entrenamiento', color: 'bg-primary', textColor: 'text-primary' },
  outdoor: { label: 'Salida Outdoor', color: 'bg-accent', textColor: 'text-accent' },
  special: { label: 'Evento Especial', color: 'bg-secondary', textColor: 'text-secondary' },
  course: { label: 'Curso Técnico', color: 'bg-adventure-orange', textColor: 'text-adventure-orange' },
};

// Sample activities - in a real app, these would come from a database
const sampleActivities = [
  { date: new Date(2026, 0, 21), type: 'training', title: 'Fuerza de dedos', time: '19:00', location: 'Sala Vértigo' },
  { date: new Date(2026, 0, 22), type: 'training', title: 'Core y Movilidad', time: '19:00', location: 'Sala Vértigo' },
  { date: new Date(2026, 0, 24), type: 'outdoor', title: 'Escalada El Chorro', time: '08:00', location: 'El Chorro', spots: 6 },
  { date: new Date(2026, 0, 25), type: 'outdoor', title: 'Barranquismo Iniciación', time: '09:00', location: 'Río Verde', spots: 8 },
  { date: new Date(2026, 0, 28), type: 'training', title: 'Resistencia específica', time: '19:00', location: 'Sala Vértigo' },
  { date: new Date(2026, 0, 29), type: 'training', title: 'Técnica de escalada', time: '19:00', location: 'Rocódromo' },
  { date: new Date(2026, 0, 31), type: 'special', title: 'Masterclass: Rapel', time: '10:00', location: 'Sala Vértigo', spots: 12 },
  { date: new Date(2026, 1, 1), type: 'outdoor', title: 'Vía Ferrata Atajate', time: '08:30', location: 'Atajate', spots: 6 },
  { date: new Date(2026, 1, 4), type: 'training', title: 'Fuerza de tracción', time: '19:00', location: 'Sala Vértigo' },
  { date: new Date(2026, 1, 7), type: 'course', title: 'Curso Iniciación Espeleo', time: '09:00', location: 'Cueva del Tesoro', spots: 6 },
];

export function VSCalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the month
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const paddedDays = Array(startPadding).fill(null).concat(daysInMonth);

  const getActivitiesForDate = (date: Date) => {
    return sampleActivities.filter(a => isSameDay(a.date, date));
  };

  const selectedActivities = selectedDate ? getActivitiesForDate(selectedDate) : [];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-adventure-dark/50" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Calendario de <span className="text-gradient">Actividades</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entrenamientos, salidas outdoor y eventos especiales programados
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="font-heading text-xl font-semibold text-foreground capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {paddedDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const activities = getActivitiesForDate(day);
                  const hasActivities = activities.length > 0;
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isCurrentDay
                          ? 'bg-primary/20 text-foreground'
                          : hasActivities
                          ? 'hover:bg-muted/50'
                          : 'hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <span className={`text-sm ${hasActivities && !isSelected ? 'font-semibold text-foreground' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {hasActivities && (
                        <div className="flex gap-0.5 mt-1">
                          {activities.slice(0, 3).map((activity, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-primary-foreground' : activityTypes[activity.type as keyof typeof activityTypes].color
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
                {Object.entries(activityTypes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${value.color}`} />
                    <span className="text-xs text-muted-foreground">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Selected Day Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 h-full">
              {selectedDate ? (
                <>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4 capitalize">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                  </h3>
                  
                  {selectedActivities.length > 0 ? (
                    <div className="space-y-4">
                      {selectedActivities.map((activity, index) => (
                        <div
                          key={index}
                          className="bg-background/50 rounded-xl p-4 border border-border"
                        >
                          <Badge className={`mb-2 ${activityTypes[activity.type as keyof typeof activityTypes].color}`}>
                            {activityTypes[activity.type as keyof typeof activityTypes].label}
                          </Badge>
                          <h4 className="font-semibold text-foreground mb-2">{activity.title}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{activity.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{activity.location}</span>
                            </div>
                            {activity.spots && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{activity.spots} plazas disponibles</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay actividades programadas para este día</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un día para ver las actividades</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
