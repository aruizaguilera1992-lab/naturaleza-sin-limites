import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Shield, Leaf, Rocket } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Cercanía y confianza',
    description: 'Trato directo, grupos reducidos y comunicación clara.',
  },
  {
    icon: Shield,
    title: 'Seguridad consciente',
    description: 'Decisiones técnicas basadas en formación, explicadas con claridad.',
  },
  {
    icon: Leaf,
    title: 'Sostenibilidad real',
    description: 'Grupos ajustados y mínimo impacto en el entorno.',
  },
  {
    icon: Rocket,
    title: 'Crecimiento personal',
    description: 'Sales de tu zona de confort, nunca de tu zona de seguridad.',
  },
];

const BG_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=85&w=1920&auto=format&fit=crop';

export function QSValuesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <motion.img
        src={BG_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        initial={false}
        animate={reduceMotion ? { scale: 1.05 } : { scale: [1.05, 1.14] }}
        transition={{ duration: 28, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/90" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Cercanía, sostenibilidad y <span className="text-gradient">crecimiento personal</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Cada salida y cada entrenamiento se diseña para que vivas la naturaleza
            a fondo, a tu ritmo y con total confianza.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-background/85 backdrop-blur-sm rounded-2xl p-6 h-full border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="#experiencia"
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors"
          >
            Ver cómo es una actividad paso a paso →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
