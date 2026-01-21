import { GraduationCap, Calendar, MapPin, Users, Check, AlertTriangle, Clock, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cursoIniciacion } from '@/data/caves';
import { motion } from 'framer-motion';
interface InitiationCourseCardProps {
  onViewDetails: () => void;
  onEnroll: () => void;
}
export function InitiationCourseCard({
  onViewDetails,
  onEnroll
}: InitiationCourseCardProps) {
  const whatsappMessage = encodeURIComponent(`¡Hola! Quiero inscribirme en el Curso de Iniciación a la Espeleología. ¿Cuándo es la próxima convocatoria?`);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true
  }} transition={{
    duration: 0.5
    }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-900/20 border-2 border-primary/30 mx-2 sm:mx-0">
      {/* Badge obligatorio */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-destructive text-destructive-foreground rounded-full text-xs sm:text-sm font-semibold">
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
          OBLIGATORIO
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-start sm:items-center gap-3 mb-4 pr-20 sm:pr-28">
          <div className="p-2 sm:p-3 bg-primary/20 rounded-xl flex-shrink-0">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground text-2xl sm:text-3xl md:text-4xl">
              {cursoIniciacion.nombre}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              {cursoIniciacion.descripcionCorta}
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
          Aprende técnicas de progresión vertical, uso de material, seguridad en cavidades y primeros auxilios subterráneos. 
          <span className="text-primary font-medium"> Imprescindible para acceder a simas verticales.</span>
        </p>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column - Stats */}
          <div className="flex-1">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-background/50 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="text-xs sm:text-sm font-semibold truncate">2 días</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-background/50 rounded-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="text-xs sm:text-sm font-semibold truncate">Málaga</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-background/50 rounded-lg">
                <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="text-xs sm:text-sm font-semibold truncate">{cursoIniciacion.precio}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-background/50 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Grupo</p>
                  <p className="text-xs sm:text-sm font-semibold truncate">Máx {cursoIniciacion.grupoMaximo}</p>
                </div>
              </div>
            </div>

            {/* CTAs - Below stats */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 border-primary/50 text-primary hover:bg-primary/10 text-base sm:text-lg py-5 sm:py-6" 
                onClick={onViewDetails}
              >
                Más información
              </Button>
              <Button 
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-base sm:text-lg py-5 sm:py-6" 
                asChild
              >
                <a href={`https://wa.me/34685609542?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                  ¡Inscribirme!
                </a>
              </Button>
            </div>
          </div>

          {/* Right column - Content list */}
          <div className="lg:w-80">
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Contenido del curso
            </h4>
            <ul className="space-y-2">
              {cursoIniciacion.contenido.slice(0, 6).map((item, index) => <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>)}
              {cursoIniciacion.contenido.length > 6 && <li className="text-sm text-primary font-medium pl-6">
                  + {cursoIniciacion.contenido.length - 6} temas más...
                </li>}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>;
}