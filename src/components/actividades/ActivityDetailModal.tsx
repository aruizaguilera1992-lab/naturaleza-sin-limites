import { motion } from 'framer-motion';
import { 
  MapPin, ExternalLink, MessageCircle, Check, AlertCircle,
  Clock, Ruler, ArrowDown, Droplets, Sun, Users, Backpack, Car,
  Mountain, TrendingUp, Compass
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UnifiedActivity } from '@/hooks/useActivitiesData';
import type { Barranco } from '@/data/barrancos';
import type { Crag } from '@/data/crags';
import type { Ferrata } from '@/data/ferratas';

interface ActivityDetailModalProps {
  activity: UnifiedActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

const activityTypeConfig: Record<string, { label: string; color: string; emoji: string }> = {
  barranquismo: { label: 'Barranquismo', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', emoji: '🌊' },
  escalada: { label: 'Escalada', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', emoji: '🧗' },
  ferratas: { label: 'Vías Ferratas', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', emoji: '🪜' },
};

const condicionFisicaLabels: Record<string, string> = {
  basica: 'Básica',
  básica: 'Básica',
  media: 'Media',
  alta: 'Alta',
  'muy alta': 'Muy Alta',
};

const accesoLabels: Record<string, string> = {
  facil: 'Fácil',
  fácil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil',
  difícil: 'Difícil',
};

// (removed tiposCueva - espeleología no longer in catalog)

function getBarrancoTechnicalData(barranco: Barranco) {
  return [
    { icon: Clock, label: 'Duración', value: barranco.duracion },
    { icon: Ruler, label: 'Desnivel', value: barranco.desnivel },
    { icon: ArrowDown, label: 'Rapel máximo', value: barranco.rapelMaximo },
    { icon: Droplets, label: 'Caudal', value: barranco.caudal === 'bajo' ? 'Bajo' : barranco.caudal === 'medio' ? 'Medio' : 'Alto' },
    { icon: Sun, label: 'Mejor época', value: barranco.mejorEpoca },
    { icon: Users, label: 'Grupo mínimo', value: `${barranco.grupoMinimo} personas` },
    { icon: Backpack, label: 'Material incluido', value: barranco.materialIncluido ? 'Sí' : 'No' },
    { icon: Car, label: 'Acceso', value: accesoLabels[barranco.acceso] },
  ];
}

function getCragTechnicalData(crag: Crag) {
  return [
    { icon: Clock, label: 'Duración', value: crag.duracion },
    { icon: TrendingUp, label: 'Grado', value: `${crag.gradoMinimo} - ${crag.gradoMaximo}` },
    { icon: Mountain, label: 'Altura', value: crag.altura },
    { icon: Compass, label: 'Orientación', value: crag.orientacion },
    { icon: Sun, label: 'Mejor época', value: crag.mejorEpoca },
    { icon: Users, label: 'Grupo mínimo', value: `${crag.grupoMinimo} personas` },
    { icon: Backpack, label: 'Material incluido', value: crag.materialIncluido ? 'Sí' : 'No' },
    { icon: Car, label: 'Acceso', value: accesoLabels[crag.acceso] || crag.acceso },
  ];
}

function getFerrataTechnicalData(ferrata: Ferrata) {
  return [
    { icon: Clock, label: 'Duración', value: ferrata.duracion },
    { icon: TrendingUp, label: 'Clasificación', value: ferrata.clasificacion },
    { icon: Mountain, label: 'Exposición', value: ferrata.exposicion },
    { icon: Ruler, label: 'Altura máxima', value: ferrata.alturaMaxima },
    { icon: Sun, label: 'Mejor época', value: ferrata.mejorEpoca },
    { icon: Users, label: 'Grupo mínimo', value: `${ferrata.grupoMinimo} personas` },
    { icon: Backpack, label: 'Material incluido', value: ferrata.materialIncluido ? 'Sí' : 'No' },
    { icon: Car, label: 'Acceso', value: accesoLabels[ferrata.acceso] || ferrata.acceso },
  ];
}

export function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!activity) return null;

  const typeConfig = activityTypeConfig[activity.activityType];
  
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa la actividad ${activity.name} (${typeConfig.label}) en ${activity.province}. ¿Tenéis disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;

  // Get type-specific technical data
  let technicalData: { icon: any; label: string; value: string }[] = [];
  
  if (activity.activityType === 'barranquismo') {
    technicalData = getBarrancoTechnicalData(activity.originalData as Barranco);
  } else if (activity.activityType === 'escalada') {
    technicalData = getCragTechnicalData(activity.originalData as Crag);
  } else if (activity.activityType === 'ferratas') {
    technicalData = getFerrataTechnicalData(activity.originalData as Ferrata);
  }

  // Calculate difficulty progress
  const difficultyProgress = Math.min(activity.levelOrder * 20, 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden bg-card border-border">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <img
              src={activity.imageLarge}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            
            {/* Type Badge */}
            <div className="absolute top-4 left-4">
              <Badge className={`${typeConfig.color} border text-sm`}>
                {typeConfig.emoji} {typeConfig.label}
              </Badge>
            </div>
            
            {/* Price Badge */}
            <div className="absolute top-4 right-14">
              <Badge className="bg-primary text-primary-foreground font-bold text-lg px-4 py-2">
                {activity.price}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-5 -mt-12 relative z-10">
            {/* Header */}
            <DialogHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                    {activity.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{activity.province} - {activity.zone}</span>
                  </div>
                </div>
                <Badge className="bg-muted text-foreground border font-bold text-sm px-3 py-1">
                  {activity.level}
                </Badge>
              </div>
            </DialogHeader>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {activity.longDescription}
              </p>
              
              {/* Difficulty Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nivel de dificultad</span>
                  <span className="font-medium text-foreground">{activity.levelLabel}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${difficultyProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary/60 via-primary to-destructive rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Technical Sheet */}
            <div className="space-y-3">
              <h3 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                📋 Ficha Técnica
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {technicalData.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
                      <p className="text-xs font-medium text-foreground truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristics */}
            {activity.characteristics.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-base font-heading font-semibold text-foreground">
                  Características
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activity.characteristics.map((char) => (
                    <Badge key={char} variant="secondary" className="px-3 py-1 text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            {activity.includes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-base font-heading font-semibold text-foreground">
                  ¿Qué incluye?
                </h3>
                <ul className="space-y-1.5">
                  {activity.includes.slice(0, 5).map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            <div className="space-y-2">
              <h3 className="text-base font-heading font-semibold text-foreground">
                Requisitos
              </h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Edad mínima: {activity.requirements.minAge} años
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Condición física: {condicionFisicaLabels[activity.requirements.physicalCondition] || activity.requirements.physicalCondition}
                  </span>
                </li>
                {activity.requirements.previousExperience && (
                  <li className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Requiere experiencia previa</span>
                  </li>
                )}
              </ul>
            </div>

            {/* CTA Footer */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="default"
                className="flex-1 gap-2"
                asChild
              >
                <a href={activity.externalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Ver ficha técnica completa
                </a>
              </Button>
              <Button
                variant="hero"
                size="default"
                className="flex-1 gap-2"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  ¡Reservar ahora!
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
