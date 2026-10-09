import { useActivitiesData } from "@/hooks/useActivitiesData";
import {
  Calendar,
  ChevronDown,
  Clock,
  Compass,
  Filter,
  Gauge,
  GitBranch,
  Lamp,
  MapPin,
  Mountain,
  Search,
  Sparkles,
  Tag,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ActivityType, Filters } from "@/pages/Actividades";

interface ActivitiesFiltersProps {
  filters: Filters;
  counts: Record<string, number>;
  activeTab: ActivityType;
  onTabChange: (tab: ActivityType) => void;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
}

const tabs: { id: ActivityType; label: string; icon: React.ElementType }[] = [
  { id: "todas", label: "Todas", icon: Compass },
  { id: "barranquismo", label: "Barranquismo", icon: Waves },
  { id: "escalada", label: "Escalada", icon: Mountain },
  { id: "ferratas", label: "Ferratas", icon: GitBranch },
  { id: "espeleologia", label: "Espeleología", icon: Lamp },
  { id: "calendario", label: "Calendario", icon: Calendar },
];

const levelLabels: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

const durationLabels: Record<string, string> = {
  "2-4h": "2-4 horas",
  "4-6h": "4-6 horas",
  "6h+": "+6 horas",
};

const characteristicLabels: Record<string, string> = {
  rapeles: "Rapeles",
  saltos: "Saltos",
  nado: "Agua",
  vertical: "Vertical",
};

/** Mismo formato de píldora para disciplinas y para cada apartado de filtros */
const pillBase =
  "flex items-center gap-2 rounded-full border px-3 sm:px-5 py-2.5 text-base sm:text-lg font-semibold transition-all duration-300 active:scale-95";

const countBadge = "rounded-full px-2 py-0.5 text-sm font-bold leading-none";

interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function CheckboxItem({ id, label, checked, onCheckedChange }: CheckboxItemProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 -mx-1 transition-colors hover:bg-muted/60"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
        className="h-5 w-5 shrink-0 border-2"
      />
      <span className="flex-1 text-base text-foreground">{label}</span>
    </label>
  );
}

interface FilterDropdownProps {
  label: string;
  icon: React.ElementType;
  activeCount: number;
  children: React.ReactNode;
  contentClassName?: string;
}

function FilterDropdown({ label, icon: Icon, activeCount, children, contentClassName }: FilterDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filtrar por ${label.toLowerCase()}`}
          aria-pressed={activeCount > 0}
          className={cn(
            pillBase,
            activeCount > 0
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-muted/50 text-foreground hover:border-primary/50 hover:bg-muted/60",
          )}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
          {activeCount > 0 && (
            <span className={cn(countBadge, "bg-primary text-primary-foreground")}>{activeCount}</span>
          )}
          <ChevronDown className="h-5 w-5 opacity-60" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-72 p-3", contentClassName)}>
        <div className="mb-2 flex items-center gap-2 border-b border-border px-2 pb-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-heading text-base font-bold text-foreground">{label}</span>
        </div>
        {children}
      </PopoverContent>
    </Popover>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-base font-medium text-primary transition-colors hover:bg-primary/20 active:scale-95"
    >
      {label}
      <X className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Quitar filtro {label}</span>
    </button>
  );
}

export function ActivitiesFilters({
  filters,
  counts,
  activeTab,
  onTabChange,
  onFilterChange,
  onClearFilters,
}: ActivitiesFiltersProps) {
  const { activities } = useActivitiesData();
  const provinces = [...new Set(activities.map((activity) => activity.province))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.levels.length > 0 ||
    filters.durations.length > 0 ||
    filters.provinces.length > 0 ||
    filters.characteristics.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200;

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked ? [...filters.levels, level] : filters.levels.filter((l) => l !== level);
    onFilterChange({ levels: newLevels });
  };

  const handleDurationChange = (duration: string, checked: boolean) => {
    const newDurations = checked ? [...filters.durations, duration] : filters.durations.filter((d) => d !== duration);
    onFilterChange({ durations: newDurations });
  };

  const handleProvinceChange = (province: string, checked: boolean) => {
    const newProvinces = checked ? [...filters.provinces, province] : filters.provinces.filter((p) => p !== province);
    onFilterChange({ provinces: newProvinces });
  };

  const handleCharacteristicChange = (char: string, checked: boolean) => {
    const newChars = checked ? [...filters.characteristics, char] : filters.characteristics.filter((c) => c !== char);
    onFilterChange({ characteristics: newChars });
  };

  const priceIsFiltered = filters.priceRange[0] > 0 || filters.priceRange[1] < 200;

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.search.trim()) {
    chips.push({
      key: "search",
      label: `Búsqueda: ${filters.search.trim()}`,
      onRemove: () => onFilterChange({ search: "" }),
    });
  }
  filters.levels.forEach((level) =>
    chips.push({
      key: `level-${level}`,
      label: levelLabels[level] ?? level,
      onRemove: () => handleLevelChange(level, false),
    }),
  );
  filters.durations.forEach((duration) =>
    chips.push({
      key: `duration-${duration}`,
      label: durationLabels[duration] ?? duration,
      onRemove: () => handleDurationChange(duration, false),
    }),
  );
  if (priceIsFiltered) {
    chips.push({
      key: "price",
      label: `${filters.priceRange[0]}€ – ${filters.priceRange[1]}€`,
      onRemove: () => onFilterChange({ priceRange: [0, 200] }),
    });
  }
  filters.provinces.forEach((province) =>
    chips.push({
      key: `province-${province}`,
      label: province,
      onRemove: () => handleProvinceChange(province, false),
    }),
  );
  filters.characteristics.forEach((char) =>
    chips.push({
      key: `char-${char}`,
      label: characteristicLabels[char] ?? char,
      onRemove: () => handleCharacteristicChange(char, false),
    }),
  );

  return (
    <div
      className="mx-auto mb-6 w-full max-w-6xl rounded-2xl border border-border bg-card/60 p-3 sm:p-4"
      role="group"
      aria-label="Filtros del catálogo"
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="font-heading text-base font-bold uppercase tracking-wide text-muted-foreground">
          Filtra tu aventura
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Discipline tabs */}
        {tabs
          .filter((tab) => tab.id === "todas" || tab.id === "calendario" || (counts[tab.id] || 0) > 0)
          .map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === "calendario" ? null : counts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-pressed={isActive}
                className={cn(
                  pillBase,
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <tab.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
                {count !== null && (
                  <span
                    className={cn(
                      countBadge,
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

        <span className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

        {/* Level */}
        <FilterDropdown
          label="Nivel"
          icon={Gauge}
          activeCount={filters.levels.length}
          contentClassName="w-80 max-h-96 overflow-y-auto"
        >
          <div className="space-y-1">
            {Object.entries(levelLabels).map(([value, label]) => (
              <CheckboxItem
                key={value}
                id={"level-" + value}
                label={label}
                checked={filters.levels.includes(value)}
                onCheckedChange={(checked) => handleLevelChange(value, checked)}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Duration */}
        <FilterDropdown
          label="Duración"
          icon={Clock}
          activeCount={filters.durations.length}
          contentClassName="w-80 max-h-96 overflow-y-auto"
        >
          <div className="space-y-1">
            {Object.entries(durationLabels).map(([value, label]) => (
              <CheckboxItem
                key={value}
                id={"duration-" + value}
                label={label}
                checked={filters.durations.includes(value)}
                onCheckedChange={(checked) => handleDurationChange(value, checked)}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Price */}
        <FilterDropdown
          label="Precio"
          icon={Tag}
          activeCount={priceIsFiltered ? 1 : 0}
          contentClassName="w-80"
        >
          <div className="px-3 pt-3">
            <Slider
              value={filters.priceRange}
              min={0}
              max={200}
              step={5}
              onValueChange={(value) => onFilterChange({ priceRange: value as [number, number] })}
              className="mb-3"
            />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>{filters.priceRange[0]}€</span>
              <span>{filters.priceRange[1]}€</span>
            </div>
          </div>
        </FilterDropdown>

        {/* Province */}
        <FilterDropdown
          label="Provincia"
          icon={MapPin}
          activeCount={filters.provinces.length}
          contentClassName="w-80 max-h-96 overflow-y-auto"
        >
          <div className="space-y-1">
            {provinces.map((province) => (
              <CheckboxItem
                key={province}
                id={"province-" + province}
                label={province}
                checked={filters.provinces.includes(province)}
                onCheckedChange={(checked) => handleProvinceChange(province, checked)}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Characteristics */}
        <FilterDropdown
          label="Características"
          icon={Sparkles}
          activeCount={filters.characteristics.length}
          contentClassName="w-80 max-h-96 overflow-y-auto"
        >
          <div className="space-y-1">
            {Object.entries(characteristicLabels).map(([value, label]) => (
              <CheckboxItem
                key={value}
                id={"char-" + value}
                label={label}
                checked={filters.characteristics.includes(value)}
                onCheckedChange={(checked) => handleCharacteristicChange(value, checked)}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 rounded-full border border-border px-4 py-2.5 text-base font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <X className="h-5 w-5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="flex items-center gap-2 pr-1 text-base font-semibold text-muted-foreground">
            <Search className="h-5 w-5 text-primary" aria-hidden="true" />
            Filtros activos:
          </span>
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
