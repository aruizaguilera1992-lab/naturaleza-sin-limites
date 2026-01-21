import { motion } from 'framer-motion';
import { Clock, TrendingDown, ArrowDown, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Barranco } from '@/data/barrancos';

interface CanyonCardProps {
  barranco: Barranco;
  index: number;
  userLevel: string;
}

const caracteristicaLabels: Record<string, string> = {
  rapeles: 'Rapeles',
  saltos: 'Saltos',
  toboganes: 'Toboganes',
  nado: 'Nado',
};

const nivelColors: Record<string, string> = {
  V1: 'bg-green-500/20 text-green-400 border-green-500/30',
  V2: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  V3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  V4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  V5: 'bg-red-500/20 text-red-400 border-red-500/30',
  V6: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function CanyonCard({ barranco, index, userLevel }: CanyonCardProps) {
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa el barranco ${barranco.nombre} en ${barranco.provincia}. Mi nivel es ${userLevel}. ¿Tenéis disponibilidad?`
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
          src={barranco.imagen}
          alt={barranco.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Level Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${nivelColors[barranco.nivel]} border font-bold`}>
            {barranco.nivel}
          </Badge>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground font-bold">
            {barranco.precio}
          </Badge>
        </div>

        {/* Province */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white/90 text-sm font-medium">
            📍 {barranco.provincia}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
          {barranco.nombre}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {barranco.descripcionCorta}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{barranco.duracion}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-primary" />
            <span>{barranco.desnivel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowDown className="h-4 w-4 text-primary" />
            <span>{barranco.rapelMaximo}</span>
          </div>
        </div>

        {/* Características */}
        <div className="flex flex-wrap gap-2 mb-6">
          {barranco.caracteristicas.map((car) => (
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
            asChild
          >
            <a href={barranco.urlInfo} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Más info
            </a>
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
