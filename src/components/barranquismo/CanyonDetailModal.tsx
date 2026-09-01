import { motion } from 'framer-motion';
import { MapPin, ExternalLink, MessageCircle, Check, AlertCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanyonTechnicalSheet } from './CanyonTechnicalSheet';
import type { Barranco } from '@/data/barrancos';
import { PracticalInfo } from '@/components/shared/PracticalInfo';

interface CanyonDetailModalProps {
  barranco: Barranco | null;
  isOpen: boolean;
  onClose: () => void;
  userLevel: string;
}

const nivelColors: Record<string, string> = {
  V1: 'bg-green-500/20 text-green-400 border-green-500/30',
  V2: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  V3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  V4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  V5: 'bg-red-500/20 text-red-400 border-red-500/30',
  V6: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const nivelProgress: Record<string, number> = {
  V1: 16,
  V2: 33,
  V3: 50,
  V4: 66,
  V5: 83,
  V6: 100,
};

const caracteristicaLabels: Record<string, string> = {
  rapeles: 'Rapeles',
  saltos: 'Saltos',
  toboganes: 'Toboganes',
  nado: 'Nado',
};

const condicionFisicaLabels: Record<string, string> = {
  basica: 'Básica',
  media: 'Media',
  alta: 'Alta',
};

export function CanyonDetailModal({ barranco, isOpen, onClose, userLevel }: CanyonDetailModalProps) {
  if (!barranco) return null;

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa el barranco ${barranco.nombre} en ${barranco.provincia}. Mi nivel es ${userLevel}. ¿Tenéis disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden bg-card border-border">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={barranco.imagenGrande}
              alt={barranco.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground font-bold text-lg px-4 py-2">
                {barranco.precio}
              </Badge>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 -mt-16 relative z-10">
            {/* Header */}
            <DialogHeader className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DialogTitle className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                    {barranco.nombre}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{barranco.poblacion}, {barranco.provincia}</span>
                  </div>
                </div>
                <Badge className={`${nivelColors[barranco.nivel]} border font-bold text-base px-3 py-1`}>
                  {barranco.nivel}
                </Badge>
              </div>
            </DialogHeader>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                {barranco.descripcionLarga}
              </p>
              
              {/* Difficulty Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nivel de dificultad</span>
                  <span className="font-medium text-foreground">{barranco.nivel}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nivelProgress[barranco.nivel]}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary/60 via-primary to-destructive rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Technical Sheet */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Ficha Técnica
              </h3>
              <CanyonTechnicalSheet barranco={barranco} />
            </div>

            {/* Characteristics */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Características
              </h3>
              <div className="flex flex-wrap gap-2">
                {barranco.caracteristicas.map((car) => (
                  <Badge key={car} variant="secondary" className="px-3 py-1">
                    {caracteristicaLabels[car]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                ¿Qué incluye?
              </h3>
              <ul className="space-y-2">
                {barranco.incluye.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Requisitos
              </h3>
              <ul className="space-y-2">
                {barranco.requisitos.saberNadar && (
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Saber nadar</span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Edad mínima: {barranco.requisitos.edadMinima} años
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Condición física: {condicionFisicaLabels[barranco.requisitos.condicionFisica]}
                  </span>
                </li>
                {!barranco.requisitos.vertigo && (
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">No tener vértigo a las alturas</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Información práctica */}
            <PracticalInfo />

            {/* CTA Footer */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                asChild
              >
                <a href={barranco.urlInfo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Ver en Infobarrancos
                </a>
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1 gap-2"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  ¡Reservar ahora!
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
