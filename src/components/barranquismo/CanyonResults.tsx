import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CanyonCard } from './CanyonCard';
import { CanyonDetailModal } from './CanyonDetailModal';
import { barrancos, type Barranco, type NivelExperiencia, type DuracionPreferida, type Caracteristica, type Provincia } from '@/data/barrancos';

interface FilterAnswers {
  nivel: NivelExperiencia | null;
  duracion: DuracionPreferida | null;
  caracteristica: Caracteristica | null;
  provincia: Provincia | null;
}

interface CanyonResultsProps {
  filters: FilterAnswers;
  onReset: () => void;
}

type SortOption = 'nivel' | 'duracion' | 'precio';

export function CanyonResults({ filters, onReset }: CanyonResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('nivel');
  const [selectedBarranco, setSelectedBarranco] = useState<Barranco | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (barranco: Barranco) => {
    setSelectedBarranco(barranco);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBarranco(null);
  };

  const filteredBarrancos = useMemo(() => {
    let result = [...barrancos];

    // Filter by experience level
    if (filters.nivel) {
      const nivelOrder: Record<NivelExperiencia, string[]> = {
        principiante: ['principiante'],
        intermedio: ['principiante', 'intermedio'],
        avanzado: ['principiante', 'intermedio', 'avanzado'],
        experto: ['principiante', 'intermedio', 'avanzado', 'experto'],
      };
      const allowedNiveles = nivelOrder[filters.nivel];
      result = result.filter(b => allowedNiveles.includes(b.nivelExperiencia));
    }

    // Filter by duration
    if (filters.duracion) {
      const duracionRanges: Record<DuracionPreferida, [number, number]> = {
        'medio-dia': [0, 4],
        'dia-completo': [4, 8],
        'jornada-larga': [8, 24],
      };
      const [min, max] = duracionRanges[filters.duracion];
      result = result.filter(b => b.duracionHoras >= min && b.duracionHoras <= max);
    }

    // Filter by characteristic
    if (filters.caracteristica && filters.caracteristica !== 'todo') {
      result = result.filter(b => b.caracteristicas.includes(filters.caracteristica as any));
    }

    // Filter by province
    if (filters.provincia && filters.provincia !== 'cualquiera') {
      result = result.filter(b => b.provincia === filters.provincia);
    }

    // Sort
    const nivelNumerico: Record<string, number> = {
      V1: 1, V2: 2, V3: 3, V4: 4, V5: 5, V6: 6,
    };

    switch (sortBy) {
      case 'nivel':
        result.sort((a, b) => nivelNumerico[a.nivel] - nivelNumerico[b.nivel]);
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

  const nivelLabel = filters.nivel === 'principiante' ? 'Principiante' :
                     filters.nivel === 'intermedio' ? 'Intermedio' :
                     filters.nivel === 'avanzado' ? 'Avanzado' : 'Experto';

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
            {filteredBarrancos.length === 0 
              ? 'No encontramos barrancos con esos criterios'
              : `Mostrando ${filteredBarrancos.length} barranco${filteredBarrancos.length !== 1 ? 's' : ''}`
            }
          </h2>
          <p className="text-muted-foreground">
            {filteredBarrancos.length > 0 
              ? 'según tus preferencias'
              : 'Prueba a cambiar algún filtro'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nivel">Por nivel</SelectItem>
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
        {filters.duracion && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {filters.duracion === 'medio-dia' ? 'Medio día' : 
             filters.duracion === 'dia-completo' ? 'Día completo' : 'Jornada larga'}
          </span>
        )}
        {filters.caracteristica && filters.caracteristica !== 'todo' && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {filters.caracteristica.charAt(0).toUpperCase() + filters.caracteristica.slice(1)}
          </span>
        )}
        {filters.provincia && filters.provincia !== 'cualquiera' && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {filters.provincia}
          </span>
        )}
      </motion.div>

      {/* Results Grid */}
      {filteredBarrancos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarrancos.map((barranco, index) => (
            <CanyonCard
              key={barranco.id}
              barranco={barranco}
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
            No hay barrancos que coincidan con todos tus criterios. Prueba a ser más flexible con alguno de los filtros.
          </p>
          <Button variant="hero" onClick={onReset}>
            Volver a empezar
          </Button>
        </motion.div>
      )}

      {/* Detail Modal */}
      <CanyonDetailModal
        barranco={selectedBarranco}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userLevel={nivelLabel}
      />
    </div>
  );
}
