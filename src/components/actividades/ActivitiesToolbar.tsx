import { motion } from 'framer-motion';
import { LayoutGrid, List, Map, ArrowUpDown, Scale, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ViewMode, SortOption } from '@/pages/Actividades';

interface ActivitiesToolbarProps {
  totalCount: number;
  viewMode: ViewMode;
  sortBy: SortOption;
  compareCount: number;
  favoritesCount: number;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortOption) => void;
  onOpenComparison: () => void;
}

export function ActivitiesToolbar({
  totalCount,
  viewMode,
  sortBy,
  compareCount,
  favoritesCount,
  onViewModeChange,
  onSortChange,
  onOpenComparison,
}: ActivitiesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{totalCount}</span> actividades
      </div>
      
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Sort */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recomendados">Recomendados</SelectItem>
              <SelectItem value="precio-asc">Precio: menor</SelectItem>
              <SelectItem value="precio-desc">Precio: mayor</SelectItem>
              <SelectItem value="duracion">Duración</SelectItem>
              <SelectItem value="popularidad">Popularidad</SelectItem>
              <SelectItem value="nivel">Nivel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* View Mode Toggle */}
        <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista en cuadrícula"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'list' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista en lista"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'map' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista en mapa"
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
        
        {/* Compare Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenComparison}
          disabled={compareCount === 0}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            compareCount > 0
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Scale className="h-4 w-4" />
          <span className="hidden sm:inline">Comparar</span>
          <span>({compareCount})</span>
        </motion.button>
        
        {/* Favorites Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            favoritesCount > 0
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", favoritesCount > 0 && "fill-current")} />
          <span className="hidden sm:inline">Favoritos</span>
          <span>({favoritesCount})</span>
        </motion.button>
      </div>
    </div>
  );
}
