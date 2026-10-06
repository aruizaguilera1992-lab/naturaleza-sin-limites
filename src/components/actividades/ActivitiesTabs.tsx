import { motion } from 'framer-motion';
import { Mountain, Waves, GitBranch, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityType } from '@/pages/Actividades';

interface ActivitiesTabsProps {
  activeTab: ActivityType;
  onTabChange: (tab: ActivityType) => void;
  counts: Record<string, number>;
}

const tabs: { id: ActivityType; label: string; icon: React.ElementType; emoji: string }[] = [
  { id: 'todas', label: 'Todas', icon: Mountain, emoji: '🎯' },
  { id: 'barranquismo', label: 'Barranquismo', icon: Waves, emoji: '🌊' },
  { id: 'escalada', label: 'Escalada', icon: Mountain, emoji: '🧗' },
  { id: 'ferratas', label: 'Ferratas', icon: GitBranch, emoji: '🪜' },
  { id: 'espeleologia', label: 'Espeleología', icon: Mountain, emoji: '🕯️' },
  { id: 'calendario', label: 'Calendario', icon: Calendar, emoji: '📅' },
];

export function ActivitiesTabs({ activeTab, onTabChange, counts }: ActivitiesTabsProps) {
  return (
    <div className="py-4 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 p-2 sm:gap-3 sm:p-3">
          {tabs
            // Ocultamos una categoría del catálogo comercial mientras no tenga
            // actividades con precio publicado (su dataset y su página se conservan).
            .filter((tab) => tab.id === 'todas' || tab.id === 'calendario' || (counts[tab.id] || 0) > 0)
            .map((tab) => {

            const isActive = activeTab === tab.id;
            const count = tab.id === 'calendario' ? null : counts[tab.id] || 0;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base sm:hidden">{tab.emoji}</span>
                <tab.icon className="hidden sm:block h-4 w-4" />
                <span>{tab.label}</span>
                {count !== null && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-background text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
            })}

        </div>
      </div>
    </div>
  );
}
