import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeroYoutubeBackground } from "@/components/HeroYoutubeBackground";

interface ActivitiesHeroSectionProps {
  onSearch: (query: string) => void;
}

export function ActivitiesHeroSection({ onSearch }: ActivitiesHeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Fondo negro (visible hasta que empieza el vídeo y con prefers-reduced-motion) */}
      <div className="absolute inset-0 bg-black" />
      {/* Vídeo aleatorio del canal oficial, igual que en el hero de la portada */}
      <HeroYoutubeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-44 md:pt-40 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
            NUESTRAS <span className="text-gradient">ACTIVIDADES</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8">Descubre tu Próxima Aventura</p>


          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Buscar actividades por nivel, zona, duración o tipo"
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

        </motion.div>
      </div>
    </section>
  );
}
