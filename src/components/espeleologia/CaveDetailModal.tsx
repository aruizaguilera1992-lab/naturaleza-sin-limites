import { X, MapPin, Clock, Check, ExternalLink, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CaveTechnicalSheet } from './CaveTechnicalSheet';
import { motion } from 'framer-motion';
import type { Cueva } from '@/data/caves';

interface CaveDetailModalProps {
  cueva: Cueva | null;
  isOpen: boolean;
  onClose: () => void;
  userLevel: string;
}

const nivelColors: Record<string, string> = {
  'I': 'bg-green-500',
  'II': 'bg-lime-500',
  'III': 'bg-amber-500',
  'IV': 'bg-orange-500',
  'V': 'bg-red-500',
};

const nivelProgress: Record<string, number> = {
  'I': 20,
  'II': 40,
  'III': 60,
  'IV': 80,
  'V': 100,
};

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

const condicionFisicaLabels: Record<string, string> = {
  básica: 'Básica',
  media: 'Media',
  alta: 'Alta',
};

const difficultyLabels = ['Física', 'Técnica', 'Psicológica', 'Verticalidad'];

export function CaveDetailModal({ cueva, isOpen, onClose, userLevel }: CaveDetailModalProps) {
  if (!cueva) return null;

  const needsCourse = cueva.requiereCurso && (userLevel === 'ninguna' || userLevel === 'iniciacion');

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Quiero reservar espeleología en ${cueva.nombre} (${cueva.provincia}). Mi nivel es ${userLevel}. ¿Tienen disponibilidad?`
  );

  const scrollToCourse = () => {
    onClose();
    setTimeout(() => {
      const courseSection = document.getElementById('curso-iniciacion');
      if (courseSection) {
        courseSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const difficultyValues = [
    cueva.dificultadTecnica.fisica,
    cueva.dificultadTecnica.tecnica,
    cueva.dificultadTecnica.psicologica,
    cueva.dificultadTecnica.vertical,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] bg-card">
        <DialogTitle className="sr-only">{cueva.nombre}</DialogTitle>
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80">
            <img
              src={cueva.imagenGrande}
              alt={cueva.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Price badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground border-0 text-xl px-4 py-2">
                {cueva.precio}
              </Badge>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <MapPin className="h-4 w-4" />
                <span>{cueva.provincia} · {cueva.zona}</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                {cueva.nombre}
              </h2>
              <div className="flex items-center gap-3">
                <Badge className={`${nivelColors[cueva.nivelTecnico]} text-white border-0`}>
                  Nivel Técnico {cueva.nivelTecnico}
                </Badge>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {cueva.duracion}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Course requirement warning */}
            {cueva.requiereCurso && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Requisito Obligatorio
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Esta cavidad requiere el <strong className="text-primary">Curso de Iniciación a la Espeleología</strong> para garantizar tu seguridad.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={scrollToCourse}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Ver Curso de Iniciación
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {cueva.descripcionLarga}
              </p>
            </div>

            {/* Difficulty bars */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Indicadores de dificultad</h3>
              <div className="grid grid-cols-2 gap-4">
                {difficultyLabels.map((label, index) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium">{difficultyValues[index]}/5</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(difficultyValues[index] / 5) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full ${difficultyValues[index] >= 4 ? 'bg-destructive' : difficultyValues[index] >= 3 ? 'bg-amber-500' : 'bg-primary'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical sheet */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Ficha técnica</h3>
              <CaveTechnicalSheet cueva={cueva} />
            </div>

            {/* Highlights */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Destacados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cueva.destacados.map((destacado, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                    <Star className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{destacado}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Características</h3>
              <div className="flex flex-wrap gap-2">
                {cueva.caracteristicas.map((car) => (
                  <Badge key={car} variant="secondary" className="bg-muted">
                    {caracteristicaLabels[car] || car}
                  </Badge>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">¿Qué incluye?</h3>
              <ul className="space-y-2">
                {cueva.incluye.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Requisitos</h3>
              <ul className="space-y-2">
                <li className={`flex items-start gap-2 text-sm ${cueva.requisitos.cursoIniciacion ? 'text-destructive font-medium' : ''}`}>
                  <span className="font-medium">Curso de iniciación:</span>
                  <span>{cueva.requisitos.cursoIniciacion ? 'Sí (obligatorio)' : 'No necesario'}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Experiencia previa:</span>
                  <span>{cueva.requisitos.experienciaPrevia ? 'Sí' : 'No necesaria'}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Edad mínima:</span>
                  <span>{cueva.requisitos.edadMinima} años</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Condición física:</span>
                  <span>{condicionFisicaLabels[cueva.requisitos.condicionFisica]}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Sin claustrofobia:</span>
                  <span>{cueva.requisitos.claustrofobia ? 'Recomendado' : 'No necesario'}</span>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1 border-primary/50"
                asChild
              >
                <a
                  href={cueva.urlInfo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver en Catálogo FAE
                </a>
              </Button>
              {needsCourse ? (
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={scrollToCourse}
                >
                  Ver Curso de Iniciación
                </Button>
              ) : (
                <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                  <a
                    href={`https://wa.me/34685609542?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ¡Reservar ahora!
                  </a>
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
