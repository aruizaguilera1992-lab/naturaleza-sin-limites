import { motion } from 'framer-motion';
import { Dumbbell, BookOpen, Mountain, LineChart, Users } from 'lucide-react';

const components = [
  {
    icon: Dumbbell,
    title: 'Entrenamiento Presencial',
    features: ['2-3 sesiones/semana', 'Grupos pequeños 4-6', '90 minutos/sesión'],
    highlight: true,
  },
  {
    icon: BookOpen,
    title: 'Biblioteca Técnica',
    features: ['40+ videos de técnica', 'Manuales descargables', 'Acceso 24/7'],
    highlight: false,
  },
  {
    icon: Mountain,
    title: 'Salidas Outdoor',
    features: ['Cada fin de semana', '3 niveles de dificultad', 'Material incluido'],
    highlight: true,
  },
  {
    icon: LineChart,
    title: 'Seguimiento Personalizado',
    features: ['Métricas de progreso', 'Plan individualizado', 'Feedback continuo'],
    highlight: false,
  },
  {
    icon: Users,
    title: 'Comunidad Digital',
    features: ['Chat privado + foros', 'Retos semanales', 'Networking real'],
    highlight: false,
  },
];

export function VSComponentsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-adventure-dark/50 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Componentes del <span className="text-gradient">Programa</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para convertirte en un aventurero completo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {components.map((component, index) => (
            <motion.div
              key={component.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <div 
                className={`h-full bg-card/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:shadow-glow/20 ${
                  component.highlight 
                    ? 'border-primary/50 hover:border-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 ${
                  component.highlight ? 'bg-primary/30' : 'bg-primary/20'
                }`}>
                  <component.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                  {component.title}
                </h3>

                {/* Features */}
                <ul className="space-y-2">
                  {component.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Highlight indicator */}
                {component.highlight && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
