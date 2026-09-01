import { motion } from 'framer-motion';
import { MapPin, ExternalLink, MessageCircle, Check, AlertTriangle, X, Fingerprint, Scale, Zap, Eye, Dumbbell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FerrataTechnicalSheet } from './FerrataTechnicalSheet';
import type { Ferrata } from '@/data/ferratas';
import { PracticalInfo } from '@/components/shared/PracticalInfo';

interface FerrataDetailModalProps {
  ferrata: Ferrata | null;
  isOpen: boolean;
  onClose: () => void;
  userLevel: string;
}

const clasificacionColors: Record<string, string> = {
  K1: 'bg-green-500/20 text-green-400 border-green-500/30',
  K2: 'bg-green-500/20 text-green-400 border-green-500/30',
  K3: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  K4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  K5: 'bg-red-500/20 text-red-400 border-red-500/30',
  K6: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const condicionFisicaLabels: Record<string, string> = {
  básica: 'Básica',
  media: 'Media',
  alta: 'Alta',
  'muy alta': 'Muy Alta',
};

export function FerrataDetailModal({ ferrata, isOpen, onClose, userLevel }: FerrataDetailModalProps) {
  if (!ferrata) return null;

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me interesa la vía ferrata ${ferrata.nombre} en ${ferrata.zona}. Mi nivel es ${userLevel}. ¿Tenéis disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/34685609542?text=${whatsappMessage}`;

  const isHighExposure = ferrata.exposicion === 'Alta' || ferrata.exposicion === 'Muy Alta';

  const nivelFisicoItems = [
    { label: 'Resistencia', value: ferrata.nivelFisico.resistencia, icon: Zap },
    { label: 'Fuerza', value: ferrata.nivelFisico.fuerza, icon: Dumbbell },
    { label: 'Equilibrio', value: ferrata.nivelFisico.equilibrio, icon: Scale },
    { label: 'Exposición', value: ferrata.nivelFisico.exposicion, icon: Eye },
    { label: 'Técnica', value: ferrata.nivelFisico.tecnica, icon: Fingerprint },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden bg-card border-border">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={ferrata.imagenGrande}
              alt={ferrata.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground font-bold text-lg px-4 py-2">
                {ferrata.precio}
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
                    {ferrata.nombre}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{ferrata.provincia} - {ferrata.zona}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={`${clasificacionColors[ferrata.clasificacion]} border font-bold text-base px-3 py-1`}>
                    {ferrata.clasificacion}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ferrata.dificultad}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* High Exposure Warning */}
            {isHighExposure && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-destructive mb-1">
                      ⚠️ ADVERTENCIA: {ferrata.exposicion.toUpperCase()} EXPOSICIÓN AL VACÍO
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Esta vía ferrata tiene tramos con gran exposición. 
                      No recomendada para personas con vértigo severo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                {ferrata.descripcionLarga}
              </p>
            </div>

            {/* Technical Sheet */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Ficha Técnica
              </h3>
              <FerrataTechnicalSheet ferrata={ferrata} />
            </div>

            {/* Ferrata Elements */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Elementos de la Ferrata
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">🌉</span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {ferrata.elementosDestacados.puentes} puentes
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">🪂</span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {ferrata.elementosDestacados.tirolinas} tirolinas
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">🪜</span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {ferrata.elementosDestacados.escaleras} escaleras
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">🛤️</span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {ferrata.elementosDestacados.pasarelas} pasarelas
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">🧗</span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {ferrata.elementosDestacados.desplomes ? 'Con desplomes' : 'Sin desplomes'}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">🔝</span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {ferrata.elementosDestacados.techos ? 'Con techos' : 'Sin techos'}
                  </p>
                </div>
              </div>
            </div>

            {/* Physical Level Indicators */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Nivel de Exigencia
              </h3>
              <div className="space-y-3">
                {nivelFisicoItems.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.value}/5</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / 5) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary/60 via-primary to-destructive rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Destacados
              </h3>
              <ul className="space-y-2">
                {ferrata.destacados.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary">⭐</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Included */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                ¿Qué incluye?
              </h3>
              <ul className="space-y-2">
                {ferrata.incluye.map((item, index) => (
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
                {ferrata.requisitos.experienciaPrevia && (
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Experiencia previa en ferratas requerida</span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Edad mínima: {ferrata.requisitos.edadMinima} años
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Condición física: {condicionFisicaLabels[ferrata.requisitos.condicionFisica]}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    Peso máximo: {ferrata.requisitos.pesoMaximo}kg
                  </span>
                </li>
              </ul>
            </div>

            {/* Warnings */}
            {ferrata.advertencias.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Advertencias
                </h3>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <ul className="space-y-2">
                    {ferrata.advertencias.map((adv, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Información práctica */}
            <PracticalInfo
              totalDuration="Jornada aproximada de 4-6 h incluyendo aproximación y regreso"
              whatToBring={[ 'Calzado de montaña o trekking', 'Ropa cómoda y guantes finos', 'Mochila pequeña con agua y comida', 'Protección solar y gorra' ]}
            />

            {/* CTA Footer */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                asChild
              >
                <a href={ferrata.urlInfo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Ver en Rocjumper
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
