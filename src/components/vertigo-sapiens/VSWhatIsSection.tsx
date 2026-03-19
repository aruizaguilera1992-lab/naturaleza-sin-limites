import { motion } from 'framer-motion';
import { Target, Mountain, Users } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Entrenamiento Específico',
    description: 'No hacemos CrossFit ni rutinas genéricas. Cada ejercicio está diseñado para mejorar tu rendimiento en escalada, barranquismo y espeleología.',
    color: 'primary',
  },
  {
    icon: Mountain,
    title: 'Aplica lo Aprendido',
    description: 'Salidas outdoor cada fin de semana. Entrena entre semana, aplica el sábado en la roca real. La mejor manera de progresar.',
    color: 'accent',
  },
  {
    icon: Users,
    title: 'Comunidad de Aventureros',
    description: 'Más que un programa de entrenamiento, es tu tribu. Comparte retos, progreso y aventuras con gente como tú.',
    color: 'secondary',
  },
];

export function VSWhatIsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-adventure-dark/50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            ¿Qué es <span className="text-gradient">Vértigo Sapiens</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un programa integral que combina entrenamiento funcional, formación técnica y comunidad
            para que conquistes cualquier aventura vertical.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 h-full hover:border-primary/50 transition-all duration-300 hover:shadow-glow/20">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sports badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
            Te preparamos para
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Escalada Deportiva',
              'Barranquismo',
              'Espeleología',
              'Vías Ferratas',
            ].map((sport) => (
              <span
                key={sport}
                className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary"
              >
                {sport}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
