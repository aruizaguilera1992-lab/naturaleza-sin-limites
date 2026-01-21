import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ActivitiesHeroSection } from '@/components/actividades/ActivitiesHeroSection';
import { ActivitiesTabs } from '@/components/actividades/ActivitiesTabs';
import { ActivitiesFilters } from '@/components/actividades/ActivitiesFilters';
import { ActivitiesGrid } from '@/components/actividades/ActivitiesGrid';
import { ActivitiesToolbar } from '@/components/actividades/ActivitiesToolbar';
import { ActivitiesComparison } from '@/components/actividades/ActivitiesComparison';
import { ActivitiesCalendar } from '@/components/actividades/ActivitiesCalendar';
import { ActivitiesPacks } from '@/components/actividades/ActivitiesPacks';
import { useActivitiesData, UnifiedActivity } from '@/hooks/useActivitiesData';

export type ActivityType = 'todas' | 'espeleologia' | 'barranquismo' | 'escalada' | 'ferratas' | 'calendario';
export type ViewMode = 'grid' | 'list' | 'map';
export type SortOption = 'recomendados' | 'precio-asc' | 'precio-desc' | 'duracion' | 'popularidad' | 'nivel';

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
  search: '',
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

const Actividades = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>('todas');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recomendados');
  const [compareList, setCompareList] = useState<UnifiedActivity[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const { activities, counts } = useActivitiesData();
  
  // Filter activities based on current filters and tab
  const filteredActivities = useMemo(() => {
    let result = [...activities];
    
    // Filter by active tab
    if (activeTab !== 'todas' && activeTab !== 'calendario') {
      result = result.filter(a => a.activityType === activeTab);
    }
    
    // Filter by type checkboxes
    if (filters.types.length > 0) {
      result = result.filter(a => filters.types.includes(a.activityType as ActivityType));
    }
    
    // Filter by level
    if (filters.levels.length > 0) {
      result = result.filter(a => filters.levels.includes(a.level));
    }
    
    // Filter by duration
    if (filters.durations.length > 0) {
      result = result.filter(a => {
        if (filters.durations.includes('2-4h') && a.durationHours >= 2 && a.durationHours <= 4) return true;
        if (filters.durations.includes('4-6h') && a.durationHours > 4 && a.durationHours <= 6) return true;
        if (filters.durations.includes('6h+') && a.durationHours > 6) return true;
        return false;
      });
    }
    
    // Filter by price range
    result = result.filter(a => a.priceValue >= filters.priceRange[0] && a.priceValue <= filters.priceRange[1]);
    
    // Filter by province
    if (filters.provinces.length > 0) {
      result = result.filter(a => filters.provinces.includes(a.province));
    }
    
    // Filter by characteristics
    if (filters.characteristics.length > 0) {
      result = result.filter(a => 
        filters.characteristics.some(c => a.characteristics.includes(c))
      );
    }
    
    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.province.toLowerCase().includes(searchLower) ||
        a.shortDescription.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'precio-asc':
        result.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case 'precio-desc':
        result.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case 'duracion':
        result.sort((a, b) => a.durationHours - b.durationHours);
        break;
      case 'nivel':
        result.sort((a, b) => a.levelOrder - b.levelOrder);
        break;
      case 'popularidad':
      case 'recomendados':
      default:
        // Keep original order or implement popularity logic
        break;
    }
    
    return result;
  }, [activities, activeTab, filters, sortBy]);
  
  const handleTabChange = useCallback((tab: ActivityType) => {
    setActiveTab(tab);
    if (tab !== 'calendario') {
      // Scroll to results
      document.getElementById('activities-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);
  
  const handleQuickFilter = useCallback((type: 'principiante' | 'media-jornada' | 'economico') => {
    switch (type) {
      case 'principiante':
        setFilters(prev => ({ ...prev, levels: ['principiante', 'I', 'V1', 'V2', 'K1', 'K2'] }));
        break;
      case 'media-jornada':
        setFilters(prev => ({ ...prev, durations: ['2-4h'] }));
        break;
      case 'economico':
        setFilters(prev => ({ ...prev, priceRange: [0, 60] }));
        break;
    }
  }, []);
  
  const handleToggleCompare = useCallback((activity: UnifiedActivity) => {
    setCompareList(prev => {
      const exists = prev.find(a => a.id === activity.id);
      if (exists) {
        return prev.filter(a => a.id !== activity.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, activity];
    });
  }, []);
  
  const handleToggleFavorite = useCallback((activityId: string) => {
    setFavorites(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
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
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ActivitiesHeroSection 
          onSearch={(search) => handleFilterChange({ search })}
          onQuickFilter={handleQuickFilter}
        />
        
        <ActivitiesTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={counts}
        />
        
        <section id="activities-results" className="py-8 lg:py-12">
          <div className="container mx-auto px-2 sm:px-4">
            <AnimatePresence mode="wait">
              {activeTab === 'calendario' ? (
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
                  className="flex flex-col lg:flex-row gap-6"
                >
                  {/* Filters Sidebar */}
                  <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                    <ActivitiesFilters 
                      filters={filters}
                      counts={counts}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </aside>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
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
        onRemove={(id) => setCompareList(prev => prev.filter(a => a.id !== id))}
      />
    </motion.div>
  );
};

export default Actividades;
