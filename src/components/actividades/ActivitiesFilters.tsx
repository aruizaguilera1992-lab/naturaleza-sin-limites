import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { Filters } from '@/pages/Actividades';

interface ActivitiesFiltersProps {
  filters: Filters;
  counts: Record<string, number>;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground"
      >
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CheckboxItemProps {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function CheckboxItem({ id, label, count, checked, onCheckedChange }: CheckboxItemProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />
      <span className="text-sm text-foreground flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  );
}

export function ActivitiesFilters({ filters, counts, onFilterChange, onClearFilters }: ActivitiesFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const hasActiveFilters = 
    filters.types.length > 0 ||
    filters.levels.length > 0 ||
    filters.durations.length > 0 ||
    filters.provinces.length > 0 ||
    filters.characteristics.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200;
  
  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    onFilterChange({ types: newTypes as Filters['types'] });
  };
  
  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked 
      ? [...filters.levels, level]
      : filters.levels.filter(l => l !== level);
    onFilterChange({ levels: newLevels });
  };
  
  const handleDurationChange = (duration: string, checked: boolean) => {
    const newDurations = checked 
      ? [...filters.durations, duration]
      : filters.durations.filter(d => d !== duration);
    onFilterChange({ durations: newDurations });
  };
  
  const handleProvinceChange = (province: string, checked: boolean) => {
    const newProvinces = checked 
      ? [...filters.provinces, province]
      : filters.provinces.filter(p => p !== province);
    onFilterChange({ provinces: newProvinces });
  };
  
  const handleCharacteristicChange = (char: string, checked: boolean) => {
    const newChars = checked 
      ? [...filters.characteristics, char]
      : filters.characteristics.filter(c => c !== char);
    onFilterChange({ characteristics: newChars });
  };
  
  const filterContent = (
    <div className="space-y-4">
      {/* Type of Activity */}
      <FilterSection title="Tipo de Actividad">
        <CheckboxItem
          id="type-espeleologia"
          label="Espeleología"
          count={counts.espeleologia}
          checked={filters.types.includes('espeleologia')}
          onCheckedChange={(checked) => handleTypeChange('espeleologia', checked)}
        />
        <CheckboxItem
          id="type-barranquismo"
          label="Barranquismo"
          count={counts.barranquismo}
          checked={filters.types.includes('barranquismo')}
          onCheckedChange={(checked) => handleTypeChange('barranquismo', checked)}
        />
        <CheckboxItem
          id="type-escalada"
          label="Escalada"
          count={counts.escalada}
          checked={filters.types.includes('escalada')}
          onCheckedChange={(checked) => handleTypeChange('escalada', checked)}
        />
        <CheckboxItem
          id="type-ferratas"
          label="Vías Ferratas"
          count={counts.ferratas}
          checked={filters.types.includes('ferratas')}
          onCheckedChange={(checked) => handleTypeChange('ferratas', checked)}
        />
      </FilterSection>
      
      {/* Level */}
      <FilterSection title="Nivel">
        <CheckboxItem
          id="level-principiante"
          label="Principiante"
          checked={filters.levels.includes('principiante')}
          onCheckedChange={(checked) => handleLevelChange('principiante', checked)}
        />
        <CheckboxItem
          id="level-intermedio"
          label="Intermedio"
          checked={filters.levels.includes('intermedio')}
          onCheckedChange={(checked) => handleLevelChange('intermedio', checked)}
        />
        <CheckboxItem
          id="level-avanzado"
          label="Avanzado"
          checked={filters.levels.includes('avanzado')}
          onCheckedChange={(checked) => handleLevelChange('avanzado', checked)}
        />
        <CheckboxItem
          id="level-experto"
          label="Experto"
          checked={filters.levels.includes('experto')}
          onCheckedChange={(checked) => handleLevelChange('experto', checked)}
        />
      </FilterSection>
      
      {/* Duration */}
      <FilterSection title="Duración">
        <CheckboxItem
          id="duration-2-4"
          label="2-4 horas"
          checked={filters.durations.includes('2-4h')}
          onCheckedChange={(checked) => handleDurationChange('2-4h', checked)}
        />
        <CheckboxItem
          id="duration-4-6"
          label="4-6 horas"
          checked={filters.durations.includes('4-6h')}
          onCheckedChange={(checked) => handleDurationChange('4-6h', checked)}
        />
        <CheckboxItem
          id="duration-6plus"
          label="+6 horas"
          checked={filters.durations.includes('6h+')}
          onCheckedChange={(checked) => handleDurationChange('6h+', checked)}
        />
      </FilterSection>
      
      {/* Price */}
      <FilterSection title="Precio">
        <div className="px-2 pt-2">
          <Slider
            value={filters.priceRange}
            min={0}
            max={200}
            step={5}
            onValueChange={(value) => onFilterChange({ priceRange: value as [number, number] })}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{filters.priceRange[0]}€</span>
            <span>{filters.priceRange[1]}€</span>
          </div>
        </div>
      </FilterSection>
      
      {/* Province */}
      <FilterSection title="Provincia">
        <CheckboxItem
          id="province-malaga"
          label="Málaga"
          checked={filters.provinces.includes('Málaga')}
          onCheckedChange={(checked) => handleProvinceChange('Málaga', checked)}
        />
        <CheckboxItem
          id="province-granada"
          label="Granada"
          checked={filters.provinces.includes('Granada')}
          onCheckedChange={(checked) => handleProvinceChange('Granada', checked)}
        />
        <CheckboxItem
          id="province-cadiz"
          label="Cádiz"
          checked={filters.provinces.includes('Cádiz')}
          onCheckedChange={(checked) => handleProvinceChange('Cádiz', checked)}
        />
        <CheckboxItem
          id="province-cordoba"
          label="Córdoba"
          checked={filters.provinces.includes('Córdoba')}
          onCheckedChange={(checked) => handleProvinceChange('Córdoba', checked)}
        />
      </FilterSection>
      
      {/* Characteristics */}
      <FilterSection title="Características" defaultOpen={false}>
        <CheckboxItem
          id="char-rapeles"
          label="Rapeles"
          checked={filters.characteristics.includes('rapeles')}
          onCheckedChange={(checked) => handleCharacteristicChange('rapeles', checked)}
        />
        <CheckboxItem
          id="char-saltos"
          label="Saltos"
          checked={filters.characteristics.includes('saltos')}
          onCheckedChange={(checked) => handleCharacteristicChange('saltos', checked)}
        />
        <CheckboxItem
          id="char-agua"
          label="Agua"
          checked={filters.characteristics.includes('nado')}
          onCheckedChange={(checked) => handleCharacteristicChange('nado', checked)}
        />
        <CheckboxItem
          id="char-vertical"
          label="Vertical"
          checked={filters.characteristics.includes('vertical')}
          onCheckedChange={(checked) => handleCharacteristicChange('vertical', checked)}
        />
      </FilterSection>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </span>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
              Activos
            </span>
          )}
        </Button>
        
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-card border border-border rounded-xl p-4">
                {filterContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-32">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Filtros</h3>
          </div>
          {filterContent}
        </div>
      </div>
    </>
  );
}
