import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarActivity {
  day: string;
  activity: string;
  type: 'ferrata' | 'barranco';
}

// Activities organized by month (year-month as key)
const activitiesByMonth: Record<string, CalendarActivity[]> = {
  '2026-01': [
    { day: "Sábado 10", activity: "Vía ferrata de Atajate", type: "ferrata" },
    { day: "Domingo 11", activity: "Vía ferrata El Chorro", type: "ferrata" },
    { day: "Sábado 17", activity: "Barranco Río Verde", type: "barranco" },
    { day: "Domingo 18", activity: "Vía ferrata Caminito del Rey", type: "ferrata" },
    { day: "Sábado 24", activity: "Vía ferrata Doble de Ronda", type: "ferrata" },
    { day: "Domingo 25", activity: "Vía ferrata El Hacho", type: "ferrata" },
    { day: "Sábado 31", activity: "Barranco Lentegí", type: "barranco" },
  ],
  '2026-02': [
    { day: "Domingo 1", activity: "Vía ferrata El Hacho", type: "ferrata" },
    { day: "Sábado 07", activity: "Vía ferrata Presa de los Caballeros", type: "ferrata" },
    { day: "Domingo 08", activity: "Vía ferrata Doble de Ronda", type: "ferrata" },
    { day: "Sábado 14", activity: "Vía ferrata triple de Comares", type: "ferrata" },
    { day: "Domingo 15", activity: "Vía ferrata el Turrión", type: "ferrata" },
    { day: "Sábado 21", activity: "Barranco Puerto Ramos", type: "barranco" },
    { day: "Domingo 22", activity: "Vía ferrata Caminito del Rey", type: "ferrata" },
    { day: "Sábado 28", activity: "Vía ferrata triple de Loja", type: "ferrata" },
    { day: "Domingo 01 mar", activity: "Vía ferrata Zafarraya", type: "ferrata" },
  ],
  '2026-03': [
    { day: "Sábado 07", activity: "Vía ferrata de Atajate", type: "ferrata" },
    { day: "Domingo 08", activity: "Barranco Almanchares", type: "barranco" },
    { day: "Sábado 14", activity: "Vía ferrata El Chorro", type: "ferrata" },
    { day: "Domingo 15", activity: "Vía ferrata Caminito del Rey", type: "ferrata" },
    { day: "Sábado 21", activity: "Barranco Río Verde", type: "barranco" },
    { day: "Domingo 22", activity: "Vía ferrata Doble de Ronda", type: "ferrata" },
    { day: "Sábado 28", activity: "Vía ferrata triple de Comares", type: "ferrata" },
    { day: "Domingo 29", activity: "Vía ferrata El Hacho", type: "ferrata" },
  ],
};

const getTypeStyles = (type: 'ferrata' | 'barranco') => {
  return type === 'ferrata' 
    ? 'bg-primary text-primary-foreground' 
    : 'bg-accent text-accent-foreground';
};

export function VSCalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026

  const monthKey = format(currentMonth, 'yyyy-MM');
  const activities = activitiesByMonth[monthKey] || [];
  const monthName = format(currentMonth, 'MMMM', { locale: es });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

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
          className="text-center mb-10 md:mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground tracking-wide">
              Calendario de <span className="text-gradient">Actividades</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Próximas salidas programadas
          </p>
        </motion.div>

        {/* Month Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="border-border hover:bg-primary hover:text-primary-foreground hover:border-primary h-10 w-10 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl px-6 py-3 min-w-[180px] text-center">
            <span className="text-foreground font-heading font-semibold text-lg capitalize">
              {capitalizedMonth} {format(currentMonth, 'yyyy')}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="border-border hover:bg-primary hover:text-primary-foreground hover:border-primary h-10 w-10 transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-3"
        >
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={`${activity.day}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 shadow-card hover:border-primary/50 transition-all duration-300 cursor-pointer"
              >
                {/* Date Badge */}
                <div
                  className={`${getTypeStyles(activity.type)} text-center px-5 py-2.5 rounded-full font-medium text-sm min-w-[130px] shrink-0 transition-all duration-300 group-hover:shadow-glow`}
                >
                  {activity.day}
                </div>
                
                {/* Activity Name */}
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-foreground font-medium text-base sm:text-lg group-hover:text-primary transition-colors duration-300">
                    {activity.activity}
                  </span>
                </div>

                {/* Arrow indicator */}
                <ChevronRight className="hidden sm:block h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-card/30 rounded-xl border border-border">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-lg">No hay actividades programadas para este mes</p>
            </div>
          )}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Vías Ferratas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Barranquismo</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
