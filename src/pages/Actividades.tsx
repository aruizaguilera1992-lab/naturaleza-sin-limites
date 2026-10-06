import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Seo } from "@/components/Seo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ActivitiesHeroSection } from "@/components/actividades/ActivitiesHeroSection";
import { ActivitiesFilters } from "@/components/actividades/ActivitiesFilters";
import { ActivitiesGrid } from "@/components/actividades/ActivitiesGrid";
import { ActivitiesToolbar } from "@/components/actividades/ActivitiesToolbar";
import { ActivitiesComparison } from "@/components/actividades/ActivitiesComparison";
import { ActivitiesCalendar } from "@/components/actividades/ActivitiesCalendar";
import { ActivitiesPacks } from "@/components/actividades/ActivitiesPacks";
import { useActivitiesData, UnifiedActivity } from "@/hooks/useActivitiesData";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export type ActivityType = "todas" | "barranquismo" | "escalada" | "ferratas" | "espeleologia" | "calendario";
export type ViewMode = "grid" | "list" | "map";
export type SortOption = "recomendados" | "precio-asc" | "precio-desc" | "duracion" | "popularidad" | "nivel";

export interface Filters {
  types: ActivityType[];
  levels: string[];
  durations: string[];
  priceRange: [number, number];
  provinces: string[];
  characteristics: string[];
  search: string;
}

const initialFilters: Filters = {
  types: [],
  levels: [],
  durations: [],
  priceRange: [0, 200],
  provinces: [],
  characteristics: [],
  search: "",
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const Actividades = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>("todas");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("recomendados");
  const [compareList, setCompareList] = useState<UnifiedActivity[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Scroll to top on page load - instant scroll for better UX on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { activities, counts } = useActivitiesData();

  // Filter activities based on current filters and tab
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by active tab
    if (activeTab !== "todas" && activeTab !== "calendario") {
      result = result.filter((a) => a.activityType === activeTab);
    }

    // Filter by type checkboxes
    if (filters.types.length > 0) {
      result = result.filter((a) => filters.types.includes(a.activityType as ActivityType));
    }

    // Filter by level
    if (filters.levels.length > 0) {
      const levelGroups: Record<string, string> = {
        Principiante: "principiante",
        "Principiante+": "principiante",
        Iniciación: "principiante",
        "Muy Fácil": "principiante",
        Fácil: "principiante",
        Intermedio: "intermedio",
        Avanzado: "avanzado",
        Difícil: "avanzado",
        Experto: "experto",
        "Experto+": "experto",
        "Muy Difícil": "experto",
        Extremo: "experto",
      };
      result = result.filter((a) => filters.levels.includes(levelGroups[a.levelLabel] ?? a.levelLabel.toLowerCase()));
    }

    // Filter by duration
    if (filters.durations.length > 0) {
      result = result.filter((a) => {
        if (filters.durations.includes("2-4h") && a.durationHours >= 2 && a.durationHours <= 4) return true;
        if (filters.durations.includes("4-6h") && a.durationHours > 4 && a.durationHours <= 6) return true;
        if (filters.durations.includes("6h+") && a.durationHours > 6) return true;
        return false;
      });
    }

    // Filter by price range
    result = result.filter((a) => a.priceValue >= filters.priceRange[0] && a.priceValue <= filters.priceRange[1]);

    // Filter by province
    if (filters.provinces.length > 0) {
      result = result.filter((a) => filters.provinces.includes(a.province));
    }

    // Filter by characteristics
    if (filters.characteristics.length > 0) {
      result = result.filter((a) => filters.characteristics.some((c) => a.characteristics.includes(c)));
    }

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.province.toLowerCase().includes(searchLower) ||
          a.shortDescription.toLowerCase().includes(searchLower) ||
          a.zone.toLowerCase().includes(searchLower) ||
          a.levelLabel.toLowerCase().includes(searchLower) ||
          a.activityType.toLowerCase().includes(searchLower) ||
          a.duration.toLowerCase().includes(searchLower),
      );
    }

    // Sort
    switch (sortBy) {
      case "precio-asc":
        result.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "precio-desc":
        result.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "duracion":
        result.sort((a, b) => a.durationHours - b.durationHours);
        break;
      case "nivel":
        result.sort((a, b) => a.levelOrder - b.levelOrder);
        break;
      case "popularidad":
      case "recomendados":
      default:
        // Keep original order or implement popularity logic
        break;
    }

    return result;
  }, [activities, activeTab, filters, sortBy]);

  const handleTabChange = useCallback((tab: ActivityType) => {
    setActiveTab(tab);
    if (tab !== "calendario") {
      // Scroll to results
      document.getElementById("activities-results")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);


  const handleToggleCompare = useCallback((activity: UnifiedActivity) => {
    setCompareList((prev) => {
      const exists = prev.find((a) => a.id === activity.id);
      if (exists) {
        return prev.filter((a) => a.id !== activity.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, activity];
    });
  }, []);

  const handleToggleFavorite = useCallback((activityId: string) => {
    setFavorites((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      }
      return [...prev, activityId];
    });
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <Seo
        title="Todas las actividades de aventura en Málaga | Naturaleza Sin Límites"
        description="Catálogo de barranquismo, escalada y vías ferratas en Málaga y Andalucía con precio, nivel, duración y reserva online."
        path="/actividades"
      />

      <Navbar />
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <ActivitiesHeroSection
          onSearch={(search) => handleFilterChange({ search })}
        />

        <section id="activities-results" className="py-8 lg:py-12">
          <div className="container mx-auto px-2 sm:px-4">
            {/* Unified tabs + filters bar */}
            <ActivitiesFilters
              filters={filters}
              counts={counts}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <AnimatePresence mode="wait">
              {activeTab === "calendario" ? (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ActivitiesCalendar />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {activeTab === "escalada" && (
                      <div className="mb-5 flex flex-col gap-4 rounded-md border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <GraduationCap className="mt-1 h-6 w-6 shrink-0 text-primary" />
                          <div>
                            <h2 className="font-heading text-lg font-bold text-foreground">¿Quieres aprender paso a paso?</h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">Conoce el itinerario propio NSL E1–E3 y las prácticas tutorizadas.</p>
                          </div>
                        </div>
                        <Button variant="outline" className="shrink-0 gap-2" asChild>
                          <Link to="/escalada#formacion">Ver formación <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    )}
                    <ActivitiesToolbar
                      totalCount={filteredActivities.length}
                      viewMode={viewMode}
                      sortBy={sortBy}
                      compareCount={compareList.length}
                      favoritesCount={favorites.length}
                      onViewModeChange={setViewMode}
                      onSortChange={setSortBy}
                      onOpenComparison={() => setShowComparison(true)}
                    />

                    <ActivitiesGrid
                      activities={filteredActivities}
                      viewMode={viewMode}
                      compareList={compareList}
                      favorites={favorites}
                      onToggleCompare={handleToggleCompare}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <ActivitiesPacks />
      </motion.main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />

      {/* Comparison Modal */}
      <ActivitiesComparison
        activities={compareList}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemove={(id) => setCompareList((prev) => prev.filter((a) => a.id !== id))}
      />
    </motion.div>
  );
};

export default Actividades;
