import { useActivitiesData } from "@/hooks/useActivitiesData";
import { Calendar, ChevronDown, GitBranch, Mountain, Waves, X } from "lucide-react";
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

const tabs: { id: ActivityType; label: string; icon: React.ElementType; emoji: string }[] = [
  { id: "todas", label: "Todas", icon: Mountain, emoji: "🎯" },
  { id: "barranquismo", label: "Barranquismo", icon: Waves, emoji: "🌊" },
  { id: "escalada", label: "Escalada", icon: Mountain, emoji: "🧗" },
  { id: "ferratas", label: "Ferratas", icon: GitBranch, emoji: "🪜" },
  { id: "espeleologia", label: "Espeleología", icon: Mountain, emoji: "🕯️" },
  { id: "calendario", label: "Calendario", icon: Calendar, emoji: "📅" },
];

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
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(checked) => onCheckedChange(checked === true)} />
      <span className="text-sm text-foreground flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </label>
  );
}

interface FilterDropdownProps {
  label: string;
  activeCount: number;
  children: React.ReactNode;
  contentClassName?: string;
}

function FilterDropdown({ label, activeCount, children, contentClassName }: FilterDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-border bg-muted/50 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-muted/60 transition-colors",
            activeCount > 0 && "border-primary/60 text-primary",
          )}
          aria-label={`Filtrar por ${label.toLowerCase()}`}
        >
          {label}
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs leading-none font-semibold">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-64 p-3", contentClassName)}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function ActivitiesFilters({ filters, counts, activeTab, onTabChange, onFilterChange, onClearFilters }: ActivitiesFiltersProps) {
  const { activities } = useActivitiesData();
  const provinces = [...new Set(activities.map((activity) => activity.province))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.types.length > 0 ||
    filters.levels.length > 0 ||
    filters.durations.length > 0 ||
    filters.provinces.length > 0 ||
    filters.characteristics.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200;

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked ? [...filters.types, type] : filters.types.filter((t) => t !== type);
    onFilterChange({ types: newTypes as Filters["types"] });
  };

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

  return (
    <div className="mx-auto mb-6 flex w-full max-w-6xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 p-2 sm:gap-3 sm:p-3" role="group" aria-label="Filtros del catálogo">
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
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground",
              )}
            >
              <span className="text-base sm:hidden">{tab.emoji}</span>
              <tab.icon className="hidden sm:block h-4 w-4" />
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

      <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

      {/* Type of Activity */}
      <FilterDropdown label="Tipo de Actividad" activeCount={filters.types.length}>
        <div className="space-y-1">
          <CheckboxItem
            id="type-barranquismo"
            label="Barranquismo"
            count={counts.barranquismo}
            checked={filters.types.includes("barranquismo")}
            onCheckedChange={(checked) => handleTypeChange("barranquismo", checked)}
          />
          <CheckboxItem
            id="type-escalada"
            label="Escalada"
            count={counts.escalada}
            checked={filters.types.includes("escalada")}
            onCheckedChange={(checked) => handleTypeChange("escalada", checked)}
          />
          <CheckboxItem
            id="type-ferratas"
            label="Vías Ferratas"
            count={counts.ferratas}
            checked={filters.types.includes("ferratas")}
            onCheckedChange={(checked) => handleTypeChange("ferratas", checked)}
          />
          {/* La espeleología solo aparece cuando hay propuestas con precio publicado */}
          {counts.espeleologia > 0 && (
            <CheckboxItem
              id="type-espeleologia"
              label="Espeleología"
              count={counts.espeleologia}
              checked={filters.types.includes("espeleologia")}
              onCheckedChange={(checked) => handleTypeChange("espeleologia", checked)}
            />
          )}
        </div>
      </FilterDropdown>

      {/* Level */}
      <FilterDropdown label="Nivel" activeCount={filters.levels.length}>
        <div className="space-y-1">
          <CheckboxItem
            id="level-principiante"
            label="Principiante"
            checked={filters.levels.includes("principiante")}
            onCheckedChange={(checked) => handleLevelChange("principiante", checked)}
          />
          <CheckboxItem
            id="level-intermedio"
            label="Intermedio"
            checked={filters.levels.includes("intermedio")}
            onCheckedChange={(checked) => handleLevelChange("intermedio", checked)}
          />
          <CheckboxItem
            id="level-avanzado"
            label="Avanzado"
            checked={filters.levels.includes("avanzado")}
            onCheckedChange={(checked) => handleLevelChange("avanzado", checked)}
          />
          <CheckboxItem
            id="level-experto"
            label="Experto"
            checked={filters.levels.includes("experto")}
            onCheckedChange={(checked) => handleLevelChange("experto", checked)}
          />
        </div>
      </FilterDropdown>

      {/* Duration */}
      <FilterDropdown label="Duración" activeCount={filters.durations.length}>
        <div className="space-y-1">
          <CheckboxItem
            id="duration-2-4"
            label="2-4 horas"
            checked={filters.durations.includes("2-4h")}
            onCheckedChange={(checked) => handleDurationChange("2-4h", checked)}
          />
          <CheckboxItem
            id="duration-4-6"
            label="4-6 horas"
            checked={filters.durations.includes("4-6h")}
            onCheckedChange={(checked) => handleDurationChange("4-6h", checked)}
          />
          <CheckboxItem
            id="duration-6plus"
            label="+6 horas"
            checked={filters.durations.includes("6h+")}
            onCheckedChange={(checked) => handleDurationChange("6h+", checked)}
          />
        </div>
      </FilterDropdown>

      {/* Price */}
      <FilterDropdown
        label="Precio"
        activeCount={filters.priceRange[0] > 0 || filters.priceRange[1] < 200 ? 1 : 0}
        contentClassName="w-72"
      >
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
      </FilterDropdown>

      {/* Province */}
      <FilterDropdown label="Provincia" activeCount={filters.provinces.length} contentClassName="w-64 max-h-72 overflow-y-auto">
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
      <FilterDropdown label="Características" activeCount={filters.characteristics.length}>
        <div className="space-y-1">
          <CheckboxItem
            id="char-rapeles"
            label="Rapeles"
            checked={filters.characteristics.includes("rapeles")}
            onCheckedChange={(checked) => handleCharacteristicChange("rapeles", checked)}
          />
          <CheckboxItem
            id="char-saltos"
            label="Saltos"
            checked={filters.characteristics.includes("saltos")}
            onCheckedChange={(checked) => handleCharacteristicChange("saltos", checked)}
          />
          <CheckboxItem
            id="char-agua"
            label="Agua"
            checked={filters.characteristics.includes("nado")}
            onCheckedChange={(checked) => handleCharacteristicChange("nado", checked)}
          />
          <CheckboxItem
            id="char-vertical"
            label="Vertical"
            checked={filters.characteristics.includes("vertical")}
            onCheckedChange={(checked) => handleCharacteristicChange("vertical", checked)}
          />
        </div>
      </FilterDropdown>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
