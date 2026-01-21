import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FerrataCard } from './FerrataCard';
import { FerrataDetailModal } from './FerrataDetailModal';
import { ferratas, type Ferrata, type NivelExperiencia, type ToleranciaVertigo, type DuracionPreferida, type ElementoPreferido } from '@/data/ferratas';

interface FilterAnswers {
  nivel: NivelExperiencia | null;
  vertigo: ToleranciaVertigo | null;
  duracion: DuracionPreferida | null;
  elemento: ElementoPreferido | null;
}

interface FerrataResultsProps {
  filters: FilterAnswers;
  onReset: () => void;
}

type SortOption = 'clasificacion' | 'exposicion' | 'duracion' | 'precio';

export function FerrataResults({ filters, onReset }: FerrataResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('clasificacion');
  const [selectedFerrata, setSelectedFerrata] = useState<Ferrata | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (ferrata: Ferrata) => {
    setSelectedFerrata(ferrata);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFerrata(null);
  };

  const filteredFerratas = useMemo(() => {
    let result = [...ferratas];

    // Filter by experience level - show ferratas appropriate for user's level
    if (filters.nivel) {
      const nivelOrder: Record<NivelExperiencia, string[]> = {
        ninguna: ['K1', 'K2'],
        iniciacion: ['K1', 'K2', 'K3'],
        intermedio: ['K1', 'K2', 'K3', 'K4'],
        avanzado: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
      };
      const allowedClasificaciones = nivelOrder[filters.nivel];
      result = result.filter(f => allowedClasificaciones.includes(f.clasificacion));
    }

    // Filter by vertigo tolerance - if user prefers to avoid, show only low/medium exposure
    if (filters.vertigo) {
      const exposicionOrder: Record<ToleranciaVertigo, string[]> = {
        'sin-problemas': ['Baja', 'Media', 'Alta', 'Muy Alta'],
        tolerable: ['Baja', 'Media', 'Alta'],
        'me-cuesta': ['Baja', 'Media'],
        evitar: ['Baja', 'Media'],
      };
      const allowedExposicion = exposicionOrder[filters.vertigo];
      result = result.filter(f => allowedExposicion.includes(f.exposicion));
    }

    // Filter by duration
    if (filters.duracion) {
      const duracionRanges: Record<DuracionPreferida, [number, number]> = {
        corta: [0, 3],
        media: [3, 5],
        larga: [5, 8],
        'jornada-completa': [6, 24],
      };
      const [min, max] = duracionRanges[filters.duracion];
      result = result.filter(f => f.duracionHoras >= min && f.duracionHoras <= max);
    }

    // Filter by preferred element
    if (filters.elemento && filters.elemento !== 'todo') {
      result = result.filter(f => {
        switch (filters.elemento) {
          case 'puentes':
            return f.elementosDestacados.puentes > 0;
          case 'tirolinas':
            return f.elementosDestacados.tirolinas > 0;
          case 'desplomes':
            return f.elementosDestacados.desplomes || f.elementosDestacados.techos;
          case 'vistas':
            return f.caracteristicas.includes('panoramica') || 
                   f.caracteristicas.includes('vistas') || 
                   f.caracteristicas.includes('fotografico');
          default:
            return true;
        }
      });
    }

    // Sort
    const clasificacionNumerico: Record<string, number> = {
      K1: 1, K2: 2, K3: 3, K4: 4, K5: 5, K6: 6,
    };
    const exposicionNumerico: Record<string, number> = {
      'Baja': 1, 'Media': 2, 'Alta': 3, 'Muy Alta': 4,
    };

    switch (sortBy) {
      case 'clasificacion':
        result.sort((a, b) => clasificacionNumerico[a.clasificacion] - clasificacionNumerico[b.clasificacion]);
        break;
      case 'exposicion':
        result.sort((a, b) => exposicionNumerico[a.exposicion] - exposicionNumerico[b.exposicion]);
        break;
      case 'duracion':
        result.sort((a, b) => a.duracionHoras - b.duracionHoras);
        break;
      case 'precio':
        result.sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
        break;
    }

    return result;
  }, [filters, sortBy]);

  const nivelLabel = filters.nivel === 'ninguna' ? 'Primera vez' :
                     filters.nivel === 'iniciacion' ? 'Iniciación' :
                     filters.nivel === 'intermedio' ? 'Intermedio' : 'Avanzado';

  return (
    <div>
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {filteredFerratas.length === 0 
              ? 'No encontramos ferratas con esos criterios'
              : `Mostrando ${filteredFerratas.length} vía${filteredFerratas.length !== 1 ? 's' : ''} ferrata${filteredFerratas.length !== 1 ? 's' : ''}`
            }
          </h2>
          <p className="text-muted-foreground">
            {filteredFerratas.length > 0 
              ? 'según tus preferencias'
              : 'Prueba a cambiar algún filtro'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clasificacion">Por dificultad</SelectItem>
                <SelectItem value="exposicion">Por exposición</SelectItem>
                <SelectItem value="duracion">Por duración</SelectItem>
                <SelectItem value="precio">Por precio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Nuevos filtros
          </Button>
        </div>
      </motion.div>

      {/* Active Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtros activos:</span>
        </div>
        {filters.nivel && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            Nivel: {nivelLabel}
          </span>
        )}
        {filters.vertigo && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            Vértigo: {filters.vertigo === 'sin-problemas' ? 'Sin problemas' : 
                      filters.vertigo === 'tolerable' ? 'Tolerable' :
                      filters.vertigo === 'me-cuesta' ? 'Me cuesta' : 'Evitar'}
          </span>
        )}
        {filters.duracion && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {filters.duracion === 'corta' ? 'Corta (2-3h)' : 
             filters.duracion === 'media' ? 'Media (3-5h)' : 
             filters.duracion === 'larga' ? 'Larga (5-8h)' : 'Jornada completa'}
          </span>
        )}
        {filters.elemento && filters.elemento !== 'todo' && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {filters.elemento === 'puentes' ? 'Puentes tibetanos' :
             filters.elemento === 'tirolinas' ? 'Tirolinas' :
             filters.elemento === 'desplomes' ? 'Desplomes/Techos' : 'Vistas panorámicas'}
          </span>
        )}
      </motion.div>

      {/* Results Grid */}
      {filteredFerratas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFerratas.map((ferrata, index) => (
            <FerrataCard
              key={ferrata.id}
              ferrata={ferrata}
              index={index}
              userLevel={nivelLabel}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-card border border-border rounded-2xl"
        >
          <div className="text-6xl mb-4">🏔️</div>
          <h3 className="text-xl font-heading font-bold text-foreground mb-2">
            Sin resultados
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No hay ferratas que coincidan con todos tus criterios. Prueba a ser más flexible con alguno de los filtros.
          </p>
          <Button variant="hero" onClick={onReset}>
            Volver a empezar
          </Button>
        </motion.div>
      )}

      {/* Detail Modal */}
      <FerrataDetailModal
        ferrata={selectedFerrata}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userLevel={nivelLabel}
      />
    </div>
  );
}
