import { motion } from 'framer-motion';
import { CalendarCheck, Clock, Heart, MapPin, Mountain, Scale, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

const typeLabels: Record<UnifiedActivity['activityType'], string> = {
  barranquismo: 'Barranquismo',
  escalada: 'Escalada',
  ferratas: 'Vía ferrata',
  espeleologia: 'Espeleología',
};

function ActivityCard({ activity, index, isInCompareList, isFavorite, onToggleCompare, onToggleFavorite, viewMode }: {
  activity: UnifiedActivity;
  index: number;
  isInCompareList: boolean;
  isFavorite: boolean;
  onToggleCompare: () => void;
  onToggleFavorite: () => void;
  viewMode: ViewMode;
}) {
  const category = activity.activityType === 'ferratas' ? 'vias-ferratas' : activity.activityType;
  const rawId = 'id' in activity.originalData ? activity.originalData.id : activity.id.replace(/^[^-]+-/, '');
  const profileUrl = `/actividades/${category}/${rawId}`;
  const bookUrl = `/reservar/${category}/${rawId}`;
  const isList = viewMode === 'list';

  return (
    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }} className={cn('group flex h-full min-w-0 overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-card', isList ? 'flex-col sm:flex-row' : 'flex-col')}>
      <Link to={profileUrl} className={cn('relative block shrink-0 overflow-hidden', isList ? 'aspect-[16/9] w-full sm:aspect-auto sm:w-56 lg:w-72' : 'aspect-[4/3] w-full')}>
        <img src={activity.image} alt={`${typeLabels[activity.activityType]} en ${activity.zone}, ${activity.province}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <Badge className="absolute left-3 top-3 border-primary/30 bg-background/85 text-foreground backdrop-blur">{typeLabels[activity.activityType]}</Badge>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-semibold text-foreground"><MapPin className="h-3.5 w-3.5 text-primary" />{activity.zone}, {activity.province}</span>
        <div className="absolute right-3 top-3 flex gap-2">
          <Button variant={isInCompareList ? 'default' : 'secondary'} size="icon" className="h-10 w-10 bg-background/85 backdrop-blur" onClick={(event) => { event.preventDefault(); onToggleCompare(); }} title="Comparar" aria-label={`Comparar ${activity.name}`}><Scale /></Button>
          <Button variant={isFavorite ? 'default' : 'secondary'} size="icon" className="h-10 w-10 bg-background/85 backdrop-blur" onClick={(event) => { event.preventDefault(); onToggleFavorite(); }} title="Guardar en favoritos" aria-label={`Guardar ${activity.name} en favoritos`}><Heart className={cn(isFavorite && 'fill-current')} /></Button>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className={cn('flex gap-3', isList ? 'items-start justify-between' : 'flex-col')}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">{typeLabels[activity.activityType]}</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-6 [overflow-wrap:anywhere]">{activity.name}</h3>
          </div>
          <div className={cn('shrink-0', !isList && 'mt-1')}>
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="text-2xl font-extrabold text-primary">{activity.priceValue} € <span className="text-xs font-semibold text-muted-foreground">/ persona</span></p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5"><Mountain className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{activity.levelLabel}</span></span>
          <span className="flex min-w-0 items-center gap-1.5"><Clock className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{activity.duration}</span></span>
          <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{activity.province}</span></span>
          <span className="flex min-w-0 items-center gap-1.5"><Users className="h-4 w-4 shrink-0 text-primary" />Máx. 6</span>
        </div>

        {isList && <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{activity.shortDescription}</p>}
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><CalendarCheck className="h-4 w-4 text-primary" />Salidas bajo petición</p>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Button variant="hero" size="sm" className="min-h-11 px-2" asChild><Link to={bookUrl}>Reservar</Link></Button>
          <Button variant="outline" size="sm" className="min-h-11 px-2" asChild><Link to={profileUrl}>Ver experiencia</Link></Button>
        </div>
      </div>
    </motion.article>
  );
}

export function ActivitiesGrid({ activities, viewMode, compareList, favorites, onToggleCompare, onToggleFavorite }: ActivitiesGridProps) {
  if (activities.length === 0) return <div className="py-16 text-center"><h3 className="text-xl font-bold">No se encontraron actividades</h3><p className="mt-2 text-muted-foreground">Prueba a ajustar los filtros para ver más resultados.</p></div>;

  if (viewMode === 'map') return <div className="rounded-lg border border-border bg-card p-10 text-center"><MapPin className="mx-auto h-9 w-9 text-primary" /><h3 className="mt-4 text-lg font-bold">Vista de mapa</h3><p className="mt-2 text-sm text-muted-foreground">Próximamente disponible.</p></div>;

  return (
    <div className={cn('grid items-stretch gap-4 sm:gap-5', viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3')}>
      {activities.map((activity, index) => <ActivityCard key={activity.id} activity={activity} index={index} isInCompareList={compareList.some((item) => item.id === activity.id)} isFavorite={favorites.includes(activity.id)} onToggleCompare={() => onToggleCompare(activity)} onToggleFavorite={() => onToggleFavorite(activity.id)} viewMode={viewMode} />)}
    </div>
  );
}