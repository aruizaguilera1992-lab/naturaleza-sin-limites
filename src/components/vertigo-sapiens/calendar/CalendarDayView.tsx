import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { CalendarActivityCard } from './CalendarActivityCard';
import { getActivitiesForDate } from './calendarData';

interface CalendarDayViewProps {
  selectedDate: Date;
}

export function CalendarDayView({ selectedDate }: CalendarDayViewProps) {
  const activities = getActivitiesForDate(selectedDate);
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", { locale: es });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-heading font-semibold text-foreground capitalize">
          {formattedDate}
        </h3>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <CalendarActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card/30 rounded-xl border border-border">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No hay actividades programadas para este día</p>
        </div>
      )}
    </motion.div>
  );
}
