import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Mountain, Waves, Pickaxe, Route } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedActivity } from '@/hooks/useActivitiesData';
import { SelectedActivity } from './types';

interface PackActivitySelectorProps {
  activityType: 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas';
  activities: UnifiedActivity[];
  selected?: SelectedActivity;
  onSelect: (activity: UnifiedActivity) => void;
  levelRestriction?: 'high' | 'any';
}

const activityTypeConfig = {
  espeleologia: {
    icon: Mountain,
    label: 'ESPELEOLOGÍA',
    emoji: '🕳️',
  },
  barranquismo: {
    icon: Waves,
    label: 'BARRANQUISMO',
    emoji: '🌊',
  },
  escalada: {
    icon: Pickaxe,
    label: 'ESCALADA',
    emoji: '🧗',
  },
  ferratas: {
    icon: Route,
    label: 'VÍA FERRATA',
    emoji: '🪜',
  },
};

export function PackActivitySelector({
  activityType,
  activities,
  selected,
  onSelect,
  levelRestriction,
}: PackActivitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = activityTypeConfig[activityType];
  
  // Filter activities by level if needed
  const filteredActivities = levelRestriction === 'high'
    ? activities.filter(a => a.levelOrder >= 3)
    : activities;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{config.emoji}</span>
          <span className="font-semibold text-foreground">{config.label}</span>
          {selected && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              ✓ {selected.activity.name}
            </Badge>
          )}
        </div>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      {/* Activity List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border max-h-64 overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No hay actividades disponibles con los criterios del pack
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      onSelect(activity);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0",
                      selected?.activity.id === activity.id && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selected?.activity.id === activity.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {selected?.activity.id === activity.id && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">{activity.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.province} · {activity.levelLabel}
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="font-semibold">
                      {activity.price}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
