import { GraduationCap, Calendar, MapPin, Users, Check, AlertTriangle, Clock, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cursoIniciacion } from '@/data/caves';
import { motion } from 'framer-motion';

interface InitiationCourseCardProps {
  onViewDetails: () => void;
  onEnroll: () => void;
}

export function InitiationCourseCard({ onViewDetails, onEnroll }: InitiationCourseCardProps) {
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Quiero inscribirme en el Curso de Iniciación a la Espeleología. ¿Cuándo es la próxima convocatoria?`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-900/20 border-2 border-primary/30"
    >
      {/* Badge obligatorio */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-full text-sm font-semibold">
          <AlertTriangle className="h-4 w-4" />
          OBLIGATORIO
        </div>
      </div>

      <div className="p-8 md:p-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  {cursoIniciacion.nombre}
                </h3>
                <p className="text-muted-foreground">
                  {cursoIniciacion.descripcionCorta}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Aprende técnicas de progresión vertical, uso de material, seguridad en cavidades y primeros auxilios subterráneos. 
              <span className="text-primary font-medium"> Imprescindible para acceder a simas verticales.</span>
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="text-sm font-semibold">2 días</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="text-sm font-semibold">Málaga</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <Euro className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="text-sm font-semibold">{cursoIniciacion.precio}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Grupo</p>
                  <p className="text-sm font-semibold">Máx {cursoIniciacion.grupoMaximo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Content list */}
          <div className="lg:w-80">
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Contenido del curso
            </h4>
            <ul className="space-y-2 mb-6">
              {cursoIniciacion.contenido.slice(0, 6).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
              {cursoIniciacion.contenido.length > 6 && (
                <li className="text-sm text-primary font-medium pl-6">
                  + {cursoIniciacion.contenido.length - 6} temas más...
                </li>
              )}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                onClick={onViewDetails}
              >
                Más información
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                asChild
              >
                <a
                  href={`https://wa.me/34685609542?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ¡Inscribirme!
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
