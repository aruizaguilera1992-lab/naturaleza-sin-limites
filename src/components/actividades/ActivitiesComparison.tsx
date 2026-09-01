import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UnifiedActivity } from '@/hooks/useActivitiesData';

interface ActivitiesComparisonProps {
  activities: UnifiedActivity[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

const activityTypeLabels: Record<string, { label: string; emoji: string }> = {
  barranquismo: { label: 'Barranquismo', emoji: '🌊' },
  escalada: { label: 'Escalada', emoji: '🧗' },
  ferratas: { label: 'Vías Ferratas', emoji: '🪜' },
};

function DifficultyBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < value ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
}

export function ActivitiesComparison({ activities, isOpen, onClose, onRemove }: ActivitiesComparisonProps) {
  if (activities.length === 0) return null;
  
  const getPhysicalDifficulty = (condition: string): number => {
    switch (condition) {
      case 'básica': return 1;
      case 'basica': return 1;
      case 'media': return 2;
      case 'alta': return 3;
      case 'muy alta': return 4;
      default: return 2;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl font-heading">
            Comparar Actividades ({activities.length} seleccionadas)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-4 sm:p-6 pt-4 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-32"></th>
                  {activities.map((activity) => (
                    <th key={activity.id} className="py-3 px-2 sm:px-4">
                      <div className="relative">
                        <button
                          onClick={() => onRemove(activity.id)}
                          className="absolute -top-2 -right-2 p-1 bg-muted rounded-full text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl overflow-hidden mb-2">
                          <img 
                            src={activity.image} 
                            alt={activity.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-1">
                          {activity.name}
                        </h3>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center">
                      <Badge variant="secondary">
                        {activityTypeLabels[activity.activityType]?.emoji} {activityTypeLabels[activity.activityType]?.label}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Nivel</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center">
                      <span className="font-medium text-foreground">{activity.level}</span>
                      <span className="block text-xs text-muted-foreground">{activity.levelLabel}</span>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Precio</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center">
                      <span className="font-bold text-primary text-lg">{activity.price}</span>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Duración</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center text-sm text-foreground">
                      {activity.duration}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Provincia</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center text-sm text-foreground">
                      {activity.province}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Dificultad física</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4">
                      <div className="flex justify-center">
                        <DifficultyBar value={getPhysicalDifficulty(activity.requirements.physicalCondition)} />
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Grupo mín.</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center text-sm text-foreground">
                      {activity.minGroup} personas
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Edad mínima</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center text-sm text-foreground">
                      {activity.requirements.minAge} años
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium text-muted-foreground">Mejor época</td>
                  {activities.map((activity) => (
                    <td key={activity.id} className="py-3 px-2 sm:px-4 text-center text-xs text-foreground">
                      {activity.bestSeason}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-2"></td>
                  {activities.map((activity) => {
                    const whatsappMessage = encodeURIComponent(
                      `¡Hola! Me interesa la actividad ${activity.name}. ¿Tenéis disponibilidad?`
                    );
                    const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;
                    
                    return (
                      <td key={activity.id} className="py-4 px-2 sm:px-4">
                        <div className="flex flex-col gap-2">
                          <Button variant="hero" size="sm" className="w-full" asChild>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Reservar
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={activity.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Más info
                            </a>
                          </Button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
