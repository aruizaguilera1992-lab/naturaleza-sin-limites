import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, RotateCcw, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CragCard } from './CragCard';
import { CragDetailModal } from './CragDetailModal';
import { crags, type Crag } from '@/data/crags';

interface FilterAnswers {
  nivel: string;
  tipo: string;
  duracion: string;
  provincia: string;
}

interface CragResultsProps {
  filters: FilterAnswers;
  onReset: () => void;
}

export function CragResults({ filters, onReset }: CragResultsProps) {
  const [sortBy, setSortBy] = useState<'nivel' | 'vias' | 'precio'>('nivel');
  const [selectedCrag, setSelectedCrag] = useState<Crag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCrags = useMemo(() => {
    let result = [...crags];

    // Filter by experience level
    if (filters.nivel) {
      result = result.filter((crag) => {
        const minGrade = crag.gradoMinimo;
        switch (filters.nivel) {
          case 'principiante':
            return minGrade.startsWith('5') || minGrade === '6a';
          case 'iniciacion':
            return minGrade.startsWith('5') || minGrade.startsWith('6a');
          case 'intermedio':
            return true; // All crags work for intermediate
          case 'avanzado':
            return !minGrade.startsWith('5');
          case 'experto':
            return crag.gradoMaximo >= '7c';
          default:
            return true;
        }
      });
    }

    // Filter by climbing type
    if (filters.tipo && filters.tipo !== 'cualquiera') {
      result = result.filter((crag) => {
        if (filters.tipo === 'mixta') {
          return crag.tipoEscalada.length > 1;
        }
        if (filters.tipo === 'clasica') {
          return crag.tipoEscalada.includes('clásica');
        }
        return crag.tipoEscalada.includes(filters.tipo as 'deportiva' | 'clásica');
      });
    }

    // Filter by duration
    if (filters.duracion) {
      result = result.filter((crag) => {
        switch (filters.duracion) {
          case 'media':
            return crag.duracion === 'Media jornada';
          case 'completa':
            return crag.duracion === 'Jornada completa';
          case 'curso':
            return crag.duracion === 'Curso varios días';
          default:
            return true;
        }
      });
    }

    // Filter by province
    if (filters.provincia && filters.provincia !== 'cualquiera') {
      result = result.filter((crag) => crag.provincia === filters.provincia);
    }

    // Sort results
    result.sort((a, b) => {
      switch (sortBy) {
        case 'nivel':
          return a.gradoMinimo.localeCompare(b.gradoMinimo);
        case 'vias':
          return b.numeroVias - a.numeroVias;
        case 'precio':
          return parseInt(a.precio) - parseInt(b.precio);
        default:
          return 0;
      }
    });

    return result;
  }, [filters, sortBy]);

  const handleOpenDetail = (crag: Crag) => {
    setSelectedCrag(crag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCrag(null);
  };

  const nivelLabels: Record<string, string> = {
    principiante: 'Principiante',
    iniciacion: 'Iniciación',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
    experto: 'Experto',
  };

  const tipoLabels: Record<string, string> = {
    deportiva: 'Deportiva',
    clasica: 'Clásica',
    mixta: 'Mixta',
    cualquiera: 'Cualquiera',
  };

  const duracionLabels: Record<string, string> = {
    media: 'Media jornada',
    completa: 'Jornada completa',
    curso: 'Curso varios días',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {filteredCrags.length} escuelas encontradas
          </h2>
          <p className="text-muted-foreground">Según tus preferencias de escalada</p>
        </div>

        <div className="flex gap-3 items-center">
          <Select value={sortBy} onValueChange={(value: 'nivel' | 'vias' | 'precio') => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nivel">Por nivel (más fácil)</SelectItem>
              <SelectItem value="vias">Por vías (más vías)</SelectItem>
              <SelectItem value="precio">Por precio (más económico)</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Nuevos filtros
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.nivel && (
          <Badge variant="secondary" className="gap-1">
            Nivel: {nivelLabels[filters.nivel]}
          </Badge>
        )}
        {filters.tipo && (
          <Badge variant="secondary" className="gap-1">
            Tipo: {tipoLabels[filters.tipo]}
          </Badge>
        )}
        {filters.duracion && (
          <Badge variant="secondary" className="gap-1">
            Duración: {duracionLabels[filters.duracion]}
          </Badge>
        )}
        {filters.provincia && (
          <Badge variant="secondary" className="gap-1">
            Zona: {filters.provincia}
          </Badge>
        )}
      </div>

      {/* Results Grid */}
      {filteredCrags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrags.map((crag, index) => (
            <CragCard
              key={crag.id}
              crag={crag}
              index={index}
              userLevel={nivelLabels[filters.nivel] || 'No especificado'}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
            No hay escuelas que coincidan
          </h3>
          <p className="text-muted-foreground mb-6">
            Prueba con otros filtros o contáctanos para opciones personalizadas
          </p>
          <Button variant="hero" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Probar otros filtros
          </Button>
        </motion.div>
      )}

      {/* Detail Modal */}
      <CragDetailModal
        crag={selectedCrag}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userLevel={nivelLabels[filters.nivel] || 'No especificado'}
      />
    </div>
  );
}
