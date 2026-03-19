import { motion } from 'framer-motion';
import { Mountain, ArrowUpDown, MoveHorizontal, Shield, Scale, Footprints, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    icon: ArrowUpDown,
    title: 'Cambios de nivel',
    description: 'Sentadillas y peso muerto para ascensos y descensos escarpados.',
  },
  {
    icon: MoveHorizontal,
    title: 'Tracción y Empuje',
    description: 'Dominadas y flexiones para superar obstáculos y trepar.',
  },
  {
    icon: Shield,
    title: 'Rotación y Anti-rotación',
    description: 'Estabilidad del core para proteger la columna en posturas asimétricas.',
  },
  {
    icon: Scale,
    title: 'Unilateralidad',
    description: 'Trabajo a una pierna/brazo para compensar desequilibrios en terrenos irregulares.',
  },
  {
    icon: Footprints,
    title: 'Locomoción',
    description: 'Gateos y transportes pesados simulando progresión con equipamiento.',
  },
];

export function VSFunctionalStrengthCard() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-adventure-dark to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto bg-card/60 backdrop-blur-md border border-border rounded-2xl p-8 md:p-12 shadow-lg"
        >
          {/* Header */}
          <div className="flex items-start gap-5 mb-10">
            <div className="flex-shrink-0 w-14 h-14 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center">
              <Mountain className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Fuerza Funcional Integral
              </h2>
              <p className="text-muted-foreground mt-1 max-w-xl">
                Acondicionamiento biomecánico para dominar entornos naturales e inestables.
              </p>
            </div>
          </div>

          {/* Pillars Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex gap-4 p-5 bg-background/40 border border-border/50 rounded-xl hover:border-accent/40 transition-colors duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center mt-0.5">
                  <pillar.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-end">
            <Button
              variant="hero"
              size="lg"
              className="group transition-transform duration-200 hover:scale-105"
            >
              Ver Circuito Completo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
