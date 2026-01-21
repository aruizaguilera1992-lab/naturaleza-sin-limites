import { motion } from 'framer-motion';
import { Mountain, Waves, CircleDot, GitBranch, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityType } from '@/pages/Actividades';

interface ActivitiesTabsProps {
  activeTab: ActivityType;
  onTabChange: (tab: ActivityType) => void;
  counts: Record<string, number>;
}

const tabs: { id: ActivityType; label: string; icon: React.ElementType; emoji: string }[] = [
  { id: 'todas', label: 'TODAS', icon: Mountain, emoji: '🎯' },
  { id: 'espeleologia', label: 'ESPELEOLOGÍA', icon: CircleDot, emoji: '🕳️' },
  { id: 'barranquismo', label: 'BARRANQUISMO', icon: Waves, emoji: '🌊' },
  { id: 'escalada', label: 'ESCALADA', icon: Mountain, emoji: '🧗' },
  { id: 'ferratas', label: 'FERRATAS', icon: GitBranch, emoji: '🪜' },
  { id: 'calendario', label: 'CALENDARIO', icon: Calendar, emoji: '📅' },
];

export function ActivitiesTabs({ activeTab, onTabChange, counts }: ActivitiesTabsProps) {
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-2 sm:px-4">
        <nav className="flex overflow-x-auto scrollbar-hide -mx-2 px-2 py-2 sm:py-0">
          <div className="flex gap-1 sm:gap-2 min-w-max mx-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tab.id === 'calendario' ? null : counts[tab.id] || 0;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sm:hidden text-base">{tab.emoji}</span>
                  <tab.icon className="hidden sm:block h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  {count !== null && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                      isActive 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
