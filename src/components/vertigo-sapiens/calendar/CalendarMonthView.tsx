import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { CalendarActivityCard } from './CalendarActivityCard';
import { getActivitiesForMonth, getActivitiesForDate } from './calendarData';
import { activityTypeConfig } from './types';
import { Calendar } from 'lucide-react';

interface CalendarMonthViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function CalendarMonthView({ selectedDate, onDateSelect }: CalendarMonthViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthActivities = getActivitiesForMonth(selectedDate.getFullYear(), selectedDate.getMonth());

  // Pad the start of the month
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const paddedDays = Array(startPadding).fill(null).concat(daysInMonth);

  const selectedDayActivities = getActivitiesForDate(selectedDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
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

              const dayActivities = getActivitiesForDate(day);
              const hasActivities = dayActivities.length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateSelect(day)}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : isCurrentDay
                      ? 'bg-primary/20 text-foreground ring-2 ring-primary/50'
                      : hasActivities
                      ? 'hover:bg-muted/50 cursor-pointer'
                      : 'text-muted-foreground hover:bg-muted/30'
                  }`}
                >
                  <span className={`text-sm ${hasActivities && !isSelected ? 'font-semibold text-foreground' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasActivities && (
                    <div className="flex gap-0.5 mt-1">
                      {dayActivities.slice(0, 3).map((activity, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-primary-foreground' : activityTypeConfig[activity.type].bgColor
                          }`}
                        />
                      ))}
                      {dayActivities.length > 3 && (
                        <span className={`text-[8px] ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                          +{dayActivities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
            {Object.entries(activityTypeConfig).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${value.bgColor}`} />
                <span className="text-xs text-muted-foreground">{value.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-card/40 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h3>
          
          {selectedDayActivities.length > 0 ? (
            <div className="space-y-3">
              {selectedDayActivities.map((activity) => (
                <CalendarActivityCard key={activity.id} activity={activity} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay actividades programadas</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
