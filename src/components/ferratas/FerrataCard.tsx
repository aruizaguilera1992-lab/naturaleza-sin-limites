import { motion } from 'framer-motion';
import { Clock, Ruler, Mountain, Info, MessageCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Ferrata } from '@/data/ferratas';

interface FerrataCardProps {
  ferrata: Ferrata;
  index: number;
  userLevel: string;
  onOpenDetail: (ferrata: Ferrata) => void;
}

const caracteristicaLabels: Record<string, string> = {
  pasarelas: 'Pasarelas',
  'puente-colgante': 'Puente colgante',
  'puente-tibetano': 'Puente tibetano',
  'via-equipada': 'Vía equipada',
  fotografico: 'Fotogénico',
  tecnica: 'Técnica',
  desplomes: 'Desplomes',
  tirolina: 'Tirolina',
  clasica: 'Clásica',
  escaleras: 'Escaleras',
  travesias: 'Travesías',
  panoramica: 'Panorámica',
  iniciacion: 'Iniciación',
  familiar: 'Familiar',
  vistas: 'Vistas',
  vertical: 'Vertical',
  'puentes-colgantes': 'Puentes colgantes',
  rio: 'Río',
  accesible: 'Accesible',
  karstico: 'Kárstico',
  exigente: 'Exigente',
  grazalema: 'Grazalema',
  'pueblos-blancos': 'Pueblos blancos',
  'parque-natural': 'P. Natural',
  serranía: 'Serranía',
  subbética: 'Subbética',
  combinable: 'Combinable',
  'pueblo-bonito': 'Pueblo bonito',
  castillo: 'Castillo',
  historico: 'Histórico',
  africa: 'África',
  'sierra-nevada': 'S. Nevada',
  completa: 'Completa',
  paisajistica: 'Paisajística',
  corta: 'Corta',
};

const clasificacionColors: Record<string, string> = {
  K1: 'bg-green-500/20 text-green-400 border-green-500/30',
  K2: 'bg-green-500/20 text-green-400 border-green-500/30',
  K3: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  K4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  K5: 'bg-red-500/20 text-red-400 border-red-500/30',
  K6: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function FerrataCard({ ferrata, index, userLevel, onOpenDetail }: FerrataCardProps) {
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa la vía ferrata ${ferrata.nombre} en ${ferrata.zona}. Mi nivel es ${userLevel}. ¿Tenéis disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;

  const isHighExposure = ferrata.exposicion === 'Alta' || ferrata.exposicion === 'Muy Alta';

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
          src={ferrata.imagen}
          alt={ferrata.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Classification Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${clasificacionColors[ferrata.clasificacion]} border font-bold`}>
            {ferrata.clasificacion}
          </Badge>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground font-bold">
            {ferrata.precio}
          </Badge>
        </div>

        {/* High Exposure Warning */}
        {isHighExposure && (
          <div className="absolute bottom-12 left-4 right-4">
            <Badge className="bg-destructive/90 text-destructive-foreground font-medium gap-1">
              <AlertTriangle className="h-3 w-3" />
              {ferrata.exposicion} exposición
            </Badge>
          </div>
        )}

        {/* Location */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white/90 text-sm font-medium">
            📍 {ferrata.provincia} - {ferrata.zona.split(' - ')[0]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
          {ferrata.nombre}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {ferrata.descripcionCorta}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{ferrata.duracion}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4 text-primary" />
            <span>{ferrata.desarrollo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mountain className="h-4 w-4 text-primary" />
            <span>{ferrata.alturaMaxima}</span>
          </div>
        </div>

        {/* Characteristics */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ferrata.caracteristicas.slice(0, 3).map((car) => (
            <Badge key={car} variant="secondary" className="text-xs">
              {caracteristicaLabels[car] || car}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onOpenDetail(ferrata)}
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
