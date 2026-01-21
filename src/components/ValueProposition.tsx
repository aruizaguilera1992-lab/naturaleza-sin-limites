import { motion } from 'framer-motion';
import { Mountain, Dumbbell, Shield, Users, Calendar, Trophy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
            <div className="bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/40 rounded-2xl p-8 h-full transition-all duration-500 hover:border-primary/70 hover:shadow-glow relative overflow-hidden">
              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <Trophy className="h-3.5 w-3.5" />
                  Exclusivo
                </span>
                <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Más Popular
                </span>
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="p-4 bg-primary/20 rounded-xl border border-primary/30">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">Vértigo Sapiens</span>
                  <h3 className="text-2xl font-heading text-foreground">Entrena Específico, Rinde Mejor</h3>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Programa de entrenamiento funcional especializado para deportes de aventura. Preparación física + técnica + comunidad.
              </p>

              {/* Features with checkmarks */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm font-medium">Grupos pequeños (4-6 máx)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm font-medium">Salidas outdoor programadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm font-medium">Asesoramiento personalizado</span>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between pt-6 border-t border-primary/20">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Desde</span>
                  <span className="text-2xl font-heading font-bold text-gradient">99€/mes</span>
                </div>
                <Button variant="hero" size="default" asChild>
                  <Link to="/vertigo-sapiens" className="flex items-center gap-2">
                    Conocer Más
                    <span className="text-lg">→</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
