import { useState, useMemo } from 'react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CaveCard } from './CaveCard';
import { CaveDetailModal } from './CaveDetailModal';
import { cuevas, type Cueva } from '@/data/caves';
import type { FilterAnswers } from './SpeleologyQuestionnaire';

interface CaveResultsProps {
  filters: FilterAnswers;
  onReset: () => void;
}

const nivelOrder: Record<string, number> = {
  'I': 1,
  'II': 2,
  'III': 3,
  'IV': 4,
  'V': 5,
};

export function CaveResults({ filters, onReset }: CaveResultsProps) {
  const [sortBy, setSortBy] = useState('nivel');
  const [selectedCueva, setSelectedCueva] = useState<Cueva | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCuevas = useMemo(() => {
    let result = [...cuevas];

    // Filter by user level - show appropriate caves
    if (filters.nivel === 'ninguna' || filters.nivel === 'iniciacion') {
      // Only horizontal caves for beginners
      result = result.filter(c => !c.requiereCurso);
    }

    // Filter by type
    if (filters.tipo && filters.tipo !== 'cualquiera') {
      if (filters.tipo === 'horizontal') {
        result = result.filter(c => c.tipo === 'cueva-horizontal');
      } else if (filters.tipo === 'vertical') {
        result = result.filter(c => c.tipo === 'sima-vertical');
      } else if (filters.tipo === 'mixta') {
        result = result.filter(c => c.tipo === 'cavidad-mixta');
      }
    }

    // Filter by duration
    if (filters.duracion) {
      if (filters.duracion === 'media') {
        result = result.filter(c => {
          const hours = parseInt(c.duracion);
          return hours <= 4;
        });
      } else if (filters.duracion === 'completa') {
        result = result.filter(c => {
          const hours = parseInt(c.duracion);
          return hours >= 4 && hours <= 8;
        });
      } else if (filters.duracion === 'larga') {
        result = result.filter(c => {
          const hours = parseInt(c.duracion);
          return hours > 8;
        });
      }
    }

    // Filter by province
    if (filters.provincia && filters.provincia !== 'cualquiera') {
      const provinciaMap: Record<string, string[]> = {
        malaga: ['Málaga'],
        granada: ['Granada'],
        almeria: ['Almería'],
      };
      const provincias = provinciaMap[filters.provincia];
      if (provincias) {
        result = result.filter(c => provincias.includes(c.provincia));
      }
    }

    // Sort
    if (sortBy === 'nivel') {
      result.sort((a, b) => nivelOrder[a.nivelTecnico] - nivelOrder[b.nivelTecnico]);
    } else if (sortBy === 'desarrollo') {
      result.sort((a, b) => parseInt(b.desarrollo) - parseInt(a.desarrollo));
    } else if (sortBy === 'precio') {
      result.sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
    }

    return result;
  }, [filters, sortBy]);

  const handleOpenDetail = (cueva: Cueva) => {
    setSelectedCueva(cueva);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCueva(null);
  };

  const activeFilters = [
    filters.nivel && { label: `Nivel: ${filters.nivel}`, key: 'nivel' },
    filters.tipo && filters.tipo !== 'cualquiera' && { label: `Tipo: ${filters.tipo}`, key: 'tipo' },
    filters.duracion && { label: `Duración: ${filters.duracion}`, key: 'duracion' },
    filters.provincia && filters.provincia !== 'cualquiera' && { label: `Zona: ${filters.provincia}`, key: 'provincia' },
  ].filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-heading font-bold text-foreground">
            {filteredCuevas.length} {filteredCuevas.length === 1 ? 'cueva encontrada' : 'cuevas encontradas'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Según tus preferencias de exploración
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="nivel">Nivel (más fácil)</SelectItem>
                <SelectItem value="desarrollo">Desarrollo (mayor)</SelectItem>
                <SelectItem value="precio">Precio (menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-primary/50 text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Nuevos filtros
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((filter) => (
            filter && (
              <Badge key={filter.key} variant="secondary" className="bg-primary/10 text-primary">
                {filter.label}
              </Badge>
            )
          ))}
        </div>
      )}

      {/* Results grid */}
      {filteredCuevas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCuevas.map((cueva, index) => (
            <CaveCard
              key={cueva.id}
              cueva={cueva}
              index={index}
              userLevel={filters.nivel}
              onOpenDetail={() => handleOpenDetail(cueva)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-2xl">
          <p className="text-muted-foreground mb-4">
            No hemos encontrado cuevas que coincidan con tus filtros.
          </p>
          <Button onClick={onReset} className="bg-primary hover:bg-primary/90">
            Modificar búsqueda
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <CaveDetailModal
        cueva={selectedCueva}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userLevel={filters.nivel}
      />
    </div>
  );
}
