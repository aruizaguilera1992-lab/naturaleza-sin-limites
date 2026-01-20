import { motion } from 'framer-motion';
import { Mountain, Dumbbell, Shield, Users, Calendar, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export function ValueProposition() {
  return (
    <section id="propuesta" className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          {...fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Tu Aventura, <span className="text-gradient">Dos Caminos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combina experiencias outdoor únicas con entrenamiento especializado para maximizar tu rendimiento
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Tourism Active Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="bg-card border border-border rounded-2xl p-8 h-full transition-all duration-500 hover:border-accent/50 hover:shadow-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-accent/20 rounded-xl">
                  <Mountain className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-accent font-semibold">Turismo Activo</span>
                  <h3 className="text-2xl font-heading text-foreground">Experiencias Únicas en la Naturaleza</h3>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Descubre cañones, cuevas y paredes con alguien que comparte tu pasión. Seguridad, sostenibilidad y emociones en cada salida.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {['Espeleología', 'Barranquismo', 'Escalada', 'Vías Ferratas'].map((activity) => (
                  <div key={activity} className="flex items-center gap-2 text-foreground/80">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="text-sm font-medium">{activity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Desde 45€/persona</span>
                </div>
                <Button variant="adventure" size="sm">
                  Ver Actividades
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Vértigo Sapiens Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-2xl p-8 h-full transition-all duration-500 hover:border-primary/50 hover:shadow-glow">
              <div className="absolute top-4 right-4">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Exclusivo
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary/20 rounded-xl">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Vértigo Sapiens</span>
                  <h3 className="text-2xl font-heading text-foreground">Entrena Específico, Rinde Mejor</h3>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Programa de entrenamiento funcional especializado para escalada, barranquismo y espeleología. Prepara tu cuerpo para la aventura.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80 text-sm">Grupos pequeños (4-6 máx)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80 text-sm">Asesoramiento online personalizado</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80 text-sm">Salidas outdoor programadas</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Desde</span>
                  <span className="text-xl font-bold text-primary">99€/mes</span>
                </div>
                <Button variant="hero" size="sm">
                  Conocer Más
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
