import { MapPin, Clock, Ruler, ArrowDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { Cueva } from '@/data/caves';

interface CaveCardProps {
  cueva: Cueva;
  index: number;
  userLevel: string;
  onOpenDetail: () => void;
}

const caracteristicaLabels: Record<string, string> = {
  horizontal: 'Horizontal',
  vertical: 'Vertical',
  mixta: 'Mixta',
  formaciones: 'Formaciones',
  'arte-rupestre': 'Arte rupestre',
  'arte-paleolítico': 'Arte paleolítico',
  'río-subterráneo': 'Río subterráneo',
  'karst-yesos': 'Karst de yesos',
  lagos: 'Lagos',
  cascada: 'Cascada',
  travesía: 'Travesía',
  amplia: 'Amplia',
  seca: 'Seca',
  húmeda: 'Húmeda',
  natación: 'Natación',
  'pozo-profundo': 'Pozo profundo',
  técnico: 'Técnico',
  cristales: 'Cristales',
  'cristales-gigantes': 'Cristales gigantes',
  neolítico: 'Neolítico',
  histórica: 'Histórica',
  surgencia: 'Surgencia',
  piscinas: 'Piscinas',
  icónica: 'Icónica',
  cazorla: 'Cazorla',
  paisaje: 'Paisaje',
  profunda: 'Profunda',
  segura: 'Segura',
  torcal: 'Torcal',
  kárstico: 'Kárstico',
  iniciación: 'Iniciación',
  accesible: 'Accesible',
  larga: 'Larga',
  clásica: 'Clásica',
  'pozo-entrada': 'Pozo entrada',
  espectacular: 'Espectacular',
  yesos: 'Yesos',
  calcita: 'Calcita',
  lago: 'Lago',
};

const nivelColors: Record<string, string> = {
  'I': 'bg-green-500/80',
  'II': 'bg-lime-500/80',
  'III': 'bg-amber-500/80',
  'IV': 'bg-orange-500/80',
  'V': 'bg-red-500/80',
};

export function CaveCard({ cueva, index, userLevel, onOpenDetail }: CaveCardProps) {
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Quiero reservar espeleología en ${cueva.nombre} (${cueva.provincia}). Mi nivel es ${userLevel}. ¿Tienen disponibilidad?`
  );

  const needsCourse = cueva.requiereCurso && (userLevel === 'ninguna' || userLevel === 'iniciacion');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={cueva.imagen}
          alt={cueva.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <Badge className={`${nivelColors[cueva.nivelTecnico]} text-white border-0`}>
            Nivel {cueva.nivelTecnico}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground border-0 text-lg px-3">
            {cueva.precio}
          </Badge>
        </div>

        {/* Course requirement warning */}
        {cueva.requiereCurso && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/90 text-destructive-foreground rounded text-xs font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              REQUIERE CURSO DE INICIACIÓN
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{cueva.provincia} · {cueva.zona}</span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-foreground mb-2 line-clamp-1">
          {cueva.nombre}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {cueva.descripcionCorta}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{cueva.duracion.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Ruler className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{cueva.desarrollo}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <ArrowDown className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{cueva.verticalMaxima}</span>
          </div>
        </div>

        {/* Characteristics */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {cueva.caracteristicas.slice(0, 3).map((car) => (
            <span
              key={car}
              className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
            >
              {caracteristicaLabels[car] || car}
            </span>
          ))}
          {cueva.caracteristicas.length > 3 && (
            <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
              +{cueva.caracteristicas.length - 3}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
            onClick={onOpenDetail}
          >
            Más info
          </Button>
          {needsCourse ? (
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={onOpenDetail}
            >
              Ver requisitos
            </Button>
          ) : (
            <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
              <a
                href={`https://wa.me/34685609542?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reservar
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
