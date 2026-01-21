import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Clock, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import activityCanyoning from '@/assets/activity-canyoning.jpg';

interface ActivitiesHeroSectionProps {
  onSearch: (query: string) => void;
  onQuickFilter: (type: 'principiante' | 'media-jornada' | 'economico') => void;
}

export function ActivitiesHeroSection({ onSearch, onQuickFilter }: ActivitiesHeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={activityCanyoning} 
          alt="Aventuras en la naturaleza"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
            NUESTRAS <span className="text-gradient">ACTIVIDADES</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3">
            Descubre tu Próxima Aventura
          </p>
          <p className="text-sm sm:text-base text-white/70 mb-8">
            Espeleología · Barranquismo · Escalada · Vías Ferratas
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Busca por nivel, zona, duración o tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 py-6 text-base sm:text-lg bg-white/95 backdrop-blur-sm border-0 rounded-full shadow-xl text-black placeholder:text-gray-500"
              />
              <Button 
                type="submit"
                variant="hero"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-4 sm:px-6"
              >
                Buscar
              </Button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickFilter('principiante')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
            >
              <Shield className="h-4 w-4 text-green-400" />
              <span className="hidden sm:inline">Principiante</span>
              <span className="sm:hidden">🔰</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickFilter('media-jornada')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
            >
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="hidden sm:inline">Media jornada</span>
              <span className="sm:hidden">⚡</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickFilter('economico')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
            >
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">&lt;60€</span>
              <span className="sm:hidden">💰</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
