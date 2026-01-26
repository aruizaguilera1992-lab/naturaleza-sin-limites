import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, ChevronDown, Dumbbell, Mountain, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { CalendarActivity, activityTypeConfig } from './types';

interface CalendarActivityCardProps {
  activity: CalendarActivity;
  compact?: boolean;
}

const physicalLevelLabels = {
  bajo: { label: 'Bajo', color: 'bg-green-500' },
  medio: { label: 'Medio', color: 'bg-yellow-500' },
  alto: { label: 'Alto', color: 'bg-orange-500' },
  'muy alto': { label: 'Muy Alto', color: 'bg-red-500' }
};

const technicalLevelLabels = {
  iniciación: { label: 'Iniciación', color: 'bg-green-500' },
  básico: { label: 'Básico', color: 'bg-blue-500' },
  intermedio: { label: 'Intermedio', color: 'bg-yellow-500' },
  avanzado: { label: 'Avanzado', color: 'bg-red-500' }
};

export function CalendarActivityCard({ activity, compact = false }: CalendarActivityCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = activityTypeConfig[activity.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/60 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              {/* Type indicator */}
              <div className={`${config.bgColor} text-white p-2 rounded-lg shrink-0`}>
                <span className="text-lg">{config.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground truncate">{activity.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {activity.time} · {activity.duration}
                      </span>
                      {!compact && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {activity.spots && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {activity.spots}
                      </Badge>
                    )}
                    {activity.difficulty && (
                      <Badge className={`${config.bgColor} text-white text-xs`}>
                        {activity.difficulty}
                      </Badge>
                    )}
                    <ChevronDown 
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && activity.technicalInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-4 bg-muted/20">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activity.technicalInfo.description}
                  </p>

                  {/* Levels */}
                  <div className="flex flex-wrap gap-3">
                    {activity.technicalInfo.physicalLevel && (
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Físico:</span>
                        <Badge className={`${physicalLevelLabels[activity.technicalInfo.physicalLevel].color} text-white text-xs`}>
                          {physicalLevelLabels[activity.technicalInfo.physicalLevel].label}
                        </Badge>
                      </div>
                    )}
                    {activity.technicalInfo.technicalLevel && (
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Técnico:</span>
                        <Badge className={`${technicalLevelLabels[activity.technicalInfo.technicalLevel].color} text-white text-xs`}>
                          {technicalLevelLabels[activity.technicalInfo.technicalLevel].label}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  {activity.technicalInfo.requirements && activity.technicalInfo.requirements.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Requisitos</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {activity.technicalInfo.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Equipment */}
                  {activity.technicalInfo.equipment && activity.technicalInfo.equipment.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Material</h5>
                      <div className="flex flex-wrap gap-2">
                        {activity.technicalInfo.equipment.map((eq, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {activity.technicalInfo.notes && (
                    <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{activity.technicalInfo.notes}</p>
                    </div>
                  )}

                  {/* Location for compact view */}
                  {compact && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                      <MapPin className="h-4 w-4" />
                      {activity.location}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
