import { motion } from 'framer-motion';
import { X, MapPin, Check, Star, ExternalLink, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CragTechnicalSheet } from './CragTechnicalSheet';
import type { Crag } from '@/data/crags';
import { PracticalInfo } from '@/components/shared/PracticalInfo';

interface CragDetailModalProps {
  crag: Crag | null;
  isOpen: boolean;
  onClose: () => void;
  userLevel: string;
}

const condicionFisicaLabels: Record<string, string> = {
  básica: 'Básica',
  media: 'Media',
  alta: 'Alta',
};

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

export function CragDetailModal({ crag, isOpen, onClose, userLevel }: CragDetailModalProps) {
  if (!crag) return null;

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Quiero reservar escalada en ${crag.nombre} en ${crag.zona}. Mi nivel es ${userLevel}. ¿Tienen disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-card">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80">
            <img
              src={crag.imagenGrande}
              alt={crag.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground font-bold text-lg px-4 py-2">
                {crag.precio}
              </Badge>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                {crag.nombre}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-white/90 text-sm">
                  <MapPin className="h-4 w-4" />
                  {crag.provincia} - {crag.zona}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border font-bold">
                  {crag.gradoMinimo} - {crag.gradoMaximo}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {crag.descripcionLarga}
              </p>
            </div>

            {/* Technical Sheet */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Ficha Técnica</h3>
              <CragTechnicalSheet crag={crag} />
            </div>

            {/* Destacados */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Destacados</h3>
              <div className="space-y-2">
                {crag.destacados.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <Star className="h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Características */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Características</h3>
              <div className="flex flex-wrap gap-2">
                {crag.caracteristicas.map((car) => (
                  <Badge key={car} variant="secondary">
                    {caracteristicaLabels[car]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tipo de Escalada */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Tipo de Escalada</h3>
              <div className="flex flex-wrap gap-2">
                {crag.tipoEscalada.map((tipo) => (
                  <Badge key={tipo} className="bg-primary/10 text-primary border-primary/30 border">
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Incluye */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">¿Qué incluye?</h3>
              <div className="space-y-2">
                {crag.incluye.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Requisitos</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Experiencia previa</p>
                  <p className="text-sm font-medium text-foreground">
                    {crag.requisitos.experienciaPrevia ? 'Necesaria' : 'No necesaria'}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Edad mínima</p>
                  <p className="text-sm font-medium text-foreground">
                    {crag.requisitos.edadMinima} años
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Condición física</p>
                  <p className="text-sm font-medium text-foreground">
                    {condicionFisicaLabels[crag.requisitos.condicionFisica]}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Vértigo</p>
                  <p className="text-sm font-medium text-foreground">
                    {crag.requisitos.vertigo ? 'Se requiere tolerancia' : 'No es problema'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información práctica */}
            <PracticalInfo
              totalDuration="Jornada aproximada de 4-6 h incluyendo aproximación y regreso"
              whatToBring={[ 'Ropa deportiva cómoda', 'Calzado deportivo (pies de gato incluidos)', 'Agua, comida ligera y gorra', 'Protección solar' ]}
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                asChild
              >
                <a href={crag.urlInfo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Ver en TheCrag.com
                </a>
              </Button>
              <Button
                variant="hero"
                className="flex-1 gap-2"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  ¡Reservar Ahora!
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
