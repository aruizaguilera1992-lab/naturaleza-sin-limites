import { motion } from 'framer-motion';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { CalendarActivityCard } from './CalendarActivityCard';
import { getActivitiesForWeek } from './calendarData';

interface CalendarWeekViewProps {
  selectedDate: Date;
}

export function CalendarWeekView({ selectedDate }: CalendarWeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const activities = getActivitiesForWeek(weekStart);
  
  // Group activities by day
  const activitiesByDay: Record<string, typeof activities> = {};
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const dayKey = format(day, 'yyyy-MM-dd');
    activitiesByDay[dayKey] = activities.filter(a => 
      format(a.date, 'yyyy-MM-dd') === dayKey
    );
  }

  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${format(weekStart, "d 'de' MMMM", { locale: es })} - ${format(weekEnd, "d 'de' MMMM", { locale: es })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-heading font-semibold text-foreground capitalize">
          {weekLabel}
        </h3>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-6">
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayActivities = activitiesByDay[dayKey];
            
            if (dayActivities.length === 0) return null;

            return (
              <div key={dayKey}>
                <h4 className="text-sm font-semibold text-primary mb-3 capitalize">
                  {format(day, "EEEE d", { locale: es })}
                </h4>
                <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                  {dayActivities.map((activity) => (
                    <CalendarActivityCard key={activity.id} activity={activity} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card/30 rounded-xl border border-border">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No hay actividades programadas para esta semana</p>
        </div>
      )}
    </motion.div>
  );
}
