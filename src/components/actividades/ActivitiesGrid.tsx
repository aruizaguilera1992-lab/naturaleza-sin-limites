import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Heart, Scale, ExternalLink, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ActivityDetailModal } from './ActivityDetailModal';
import type { UnifiedActivity } from '@/hooks/useActivitiesData';
import type { ViewMode } from '@/pages/Actividades';

interface ActivitiesGridProps {
  activities: UnifiedActivity[];
  viewMode: ViewMode;
  compareList: UnifiedActivity[];
  favorites: string[];
  onToggleCompare: (activity: UnifiedActivity) => void;
  onToggleFavorite: (activityId: string) => void;
}

const activityTypeLabels: Record<string, { label: string; color: string; emoji: string; route: string }> = {
  espeleologia: { label: 'Espeleología', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', emoji: '🕳️', route: '/espeleologia' },
  barranquismo: { label: 'Barranquismo', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', emoji: '🌊', route: '/barranquismo' },
  escalada: { label: 'Escalada', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', emoji: '🧗', route: '/escalada' },
  ferratas: { label: 'Vías Ferratas', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', emoji: '🪜', route: '/vias-ferratas' },
};

function ActivityCard({ 
  activity, 
  index, 
  isInCompareList, 
  isFavorite, 
  onToggleCompare, 
  onToggleFavorite,
  onOpenDetail,
  viewMode
}: { 
  activity: UnifiedActivity; 
  index: number; 
  isInCompareList: boolean;
  isFavorite: boolean;
  onToggleCompare: () => void;
  onToggleFavorite: () => void;
  onOpenDetail: () => void;
  viewMode: ViewMode;
}) {
  const typeInfo = activityTypeLabels[activity.activityType];
  
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa la actividad ${activity.name} (${typeInfo.label}) en ${activity.province}. ¿Tenéis disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;
  
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 lg:w-64 h-48 sm:h-auto flex-shrink-0">
            <img
              src={activity.image}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge className={cn("border text-xs", typeInfo.color)}>
                {typeInfo.emoji} {typeInfo.label}
              </Badge>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                  {activity.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {activity.province} - {activity.zone}
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground font-bold flex-shrink-0">
                {activity.price}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
              {activity.shortDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                {activity.duration}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-primary" />
                Mín. {activity.minGroup}
              </span>
              <Badge variant="secondary" className="text-xs">
                {activity.level}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onOpenDetail}>
                <Info className="h-4 w-4 mr-1" />
                Más info
              </Button>
              <Button variant="hero" size="sm" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reservar
                </a>
              </Button>
              <button
                onClick={onToggleCompare}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isInCompareList ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                title="Comparar"
              >
                <Scale className="h-4 w-4" />
              </button>
              <button
                onClick={onToggleFavorite}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isFavorite ? "bg-red-500/20 text-red-500" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                title="Favorito"
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn("border text-xs", typeInfo.color)}>
            {typeInfo.emoji} {typeInfo.label}
          </Badge>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground font-bold">
            {activity.price}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleCompare}
            className={cn(
              "p-2 rounded-full backdrop-blur-sm transition-colors",
              isInCompareList ? "bg-primary text-primary-foreground" : "bg-black/50 text-white hover:bg-black/70"
            )}
            title="Comparar"
          >
            <Scale className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleFavorite}
            className={cn(
              "p-2 rounded-full backdrop-blur-sm transition-colors",
              isFavorite ? "bg-red-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
            )}
            title="Favorito"
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
        
        {/* Location */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white/90 text-sm font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {activity.province}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-heading font-bold text-foreground mb-1 line-clamp-1">
          {activity.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {activity.shortDescription}
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            {activity.duration}
          </span>
          <Badge variant="secondary" className="text-xs">
            {activity.level}
          </Badge>
        </div>
        
        {/* Characteristics */}
        <div className="flex flex-wrap gap-1 mb-4">
          {activity.characteristics.slice(0, 3).map((char) => (
            <span key={char} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {char}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm" onClick={onOpenDetail}>
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Más info
          </Button>
          <Button variant="hero" size="sm" className="flex-1 text-xs sm:text-sm" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Reservar
            </a>
          </Button>
        </div>
        
        {/* External Source */}
        <a 
          href={activity.externalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Ver en {activity.externalSource}
        </a>
      </div>
    </motion.div>
  );
}

export function ActivitiesGrid({ 
  activities, 
  viewMode, 
  compareList, 
  favorites, 
  onToggleCompare, 
  onToggleFavorite 
}: ActivitiesGridProps) {
  const [selectedActivity, setSelectedActivity] = useState<UnifiedActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (activity: UnifiedActivity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
          No se encontraron actividades
        </h3>
        <p className="text-muted-foreground">
          Prueba a ajustar los filtros para ver más resultados
        </p>
      </div>
    );
  }
  
  if (viewMode === 'map') {
    return (
      <div className="bg-muted rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-heading font-bold text-foreground mb-2">
          Vista de mapa
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Próximamente disponible la vista de mapa interactivo
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            Málaga
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            Granada
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Cádiz
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            Córdoba
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className={cn(
        "grid gap-4 sm:gap-6",
        viewMode === 'list' 
          ? "grid-cols-1" 
          : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      )}>
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            index={index}
            isInCompareList={compareList.some(a => a.id === activity.id)}
            isFavorite={favorites.includes(activity.id)}
            onToggleCompare={() => onToggleCompare(activity)}
            onToggleFavorite={() => onToggleFavorite(activity.id)}
            onOpenDetail={() => handleOpenDetail(activity)}
            viewMode={viewMode}
          />
        ))}
      </div>
      
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
