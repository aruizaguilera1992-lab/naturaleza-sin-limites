import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const getTypeColor = (type: 'ferrata' | 'barranco') => {
  return type === 'ferrata' 
    ? 'bg-[#4DB8A5]' 
    : 'bg-[#2C4356]';
};

export function VSCalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026

  const monthKey = format(currentMonth, 'yyyy-MM');
  const activities = activitiesByMonth[monthKey] || [];
  const monthName = format(currentMonth, 'MMMM', { locale: es });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background with mountain image overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white tracking-wider mb-3">
            CALENDARIO
          </h2>
          <p 
            className="text-4xl md:text-5xl lg:text-6xl italic"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: '#F4B942'
            }}
          >
            {capitalizedMonth}
          </p>
        </motion.div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-white font-medium text-lg min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={`${activity.day}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 rounded-xl p-4 shadow-md"
                style={{ backgroundColor: '#F5E6D3' }}
              >
                {/* Date Badge */}
                <div
                  className={`${getTypeColor(activity.type)} text-white text-center px-6 py-3 rounded-full font-medium text-sm sm:text-base min-w-[140px] shrink-0`}
                >
                  {activity.day}
                </div>
                
                {/* Activity Name */}
                <div 
                  className="flex-1 text-center sm:text-left italic text-lg sm:text-xl"
                  style={{ color: '#8B4223' }}
                >
                  {activity.activity}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-white/70">
              <p className="text-lg">No hay actividades programadas para este mes</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
