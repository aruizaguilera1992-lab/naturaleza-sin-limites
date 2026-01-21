import { motion } from 'framer-motion';
import { Clock, Mountain, Compass, Ruler, Info, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Crag } from '@/data/crags';

interface CragCardProps {
  crag: Crag;
  index: number;
  userLevel: string;
  onOpenDetail: (crag: Crag) => void;
}

const caracteristicaLabels: Record<string, string> = {
  deportiva: 'Deportiva',
  clásica: 'Clásica',
  adherencia: 'Adherencia',
  desplomes: 'Desplomes',
  tecnica: 'Técnica',
  polideportivo: 'Polideportivo',
  fisuras: 'Fisuras',
  placas: 'Placas',
};

export function CragCard({ crag, index, userLevel, onOpenDetail }: CragCardProps) {
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Quiero reservar escalada en ${crag.nombre} en ${crag.zona}. Mi nivel es ${userLevel}. ¿Tienen disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={crag.imagen}
          alt={crag.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Grade Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border font-bold">
            {crag.gradoMinimo} - {crag.gradoMaximo}
          </Badge>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground font-bold">
            {crag.precio}
          </Badge>
        </div>

        {/* Province */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white/90 text-sm font-medium">
            📍 {crag.provincia} - {crag.zona}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
          {crag.nombre}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {crag.descripcionCorta}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{crag.duracion}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mountain className="h-4 w-4 text-primary" />
            <span>{crag.numeroVias} vías</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Compass className="h-4 w-4 text-primary" />
            <span>{crag.orientacion}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4 text-primary" />
            <span>{crag.altura}</span>
          </div>
        </div>

        {/* Características */}
        <div className="flex flex-wrap gap-2 mb-6">
          {crag.caracteristicas.slice(0, 3).map((car) => (
            <Badge key={car} variant="secondary" className="text-xs">
              {caracteristicaLabels[car]}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onOpenDetail(crag)}
          >
            <Info className="h-4 w-4" />
            Más info
          </Button>
          <Button
            variant="hero"
            size="sm"
            className="flex-1 gap-2"
            asChild
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Reservar
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
