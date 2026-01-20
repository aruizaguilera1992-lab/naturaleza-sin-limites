import { motion } from 'framer-motion';
import { Dumbbell, Video, Calendar, BookOpen, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    icon: Dumbbell,
    title: 'Entrenamiento Presencial',
    features: ['Grupos pequeños (4-6 máx)', 'Fuerza específica para aventura', '2-3 sesiones/semana de 90 min'],
  },
  {
    icon: Video,
    title: 'Asesoramiento Online',
    features: ['Plan individualizado', '1-2 sesiones/mes vía Zoom', 'Seguimiento con métricas'],
  },
  {
    icon: Calendar,
    title: 'Actividades Outdoor',
    features: ['Salidas cada fin de semana', '3 niveles de dificultad', 'Aplica lo entrenado'],
  },
  {
    icon: BookOpen,
    title: 'Formación Técnica',
    features: ['40+ módulos de video', 'Acceso 24/7 exclusivo', 'Contenido actualizado'],
  },
  {
    icon: Users,
    title: 'Comunidad Digital',
    features: ['Chat privado + foros', 'Retos semanales', 'Networking real'],
  },
];

const plans = [
  {
    name: 'Aventurero Activo',
    price: 99,
    period: '/mes',
    popular: false,
    features: [
      '1-2 sesiones presenciales/semana',
      'Acceso comunidad + biblioteca',
      'Salidas outdoor incluidas',
      'Soporte por chat',
    ],
    cta: 'Únete Ahora',
  },
  {
    name: 'Entrenador Personal Digital',
    price: 298,
    period: '/mes',
    popular: true,
    features: [
      '2 sesiones presenciales + 2 online',
      'Todo lo del plan anterior',
      'Plan personalizado de entrenamiento',
      'Análisis de video + métricas avanzadas',
      'Asesoramiento nutricional',
    ],
    cta: 'Transformación Total',
  },
  {
    name: 'Outdoor Experiencial',
    price: 180,
    period: '',
    popular: false,
    subtitle: 'Paquete 4 actividades',
    features: [
      '4 salidas outdoor programadas',
      'Sin suscripción mensual',
      'Material incluido',
      'Grupos pequeños',
    ],
    cta: 'Comprar Paquete',
  },
];

export function VertigoSapiens() {
  return (
    <section id="vertigo-sapiens" className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-adventure-dark via-adventure-dark-light to-primary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Vértigo Sapiens</span>
          </div>
          
          <h2 className="text-section font-heading mb-4">
            Más que Entrenamiento: <span className="text-gradient">Tu Comunidad de Aventureros</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Un programa que integra fitness funcional, formación técnica y comunidad para deportes de aventura
          </p>
        </motion.div>

        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-5 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-glow/20"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-xl mb-4">
                <pillar.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">{pillar.title}</h4>
              <ul className="space-y-1">
                {pillar.features.map((feature) => (
                  <li key={feature} className="text-xs text-muted-foreground">{feature}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-heading text-center mb-10">
            Elige tu <span className="text-gradient">Plan</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-primary/20 to-primary/5 border-2 border-primary shadow-glow' 
                    : 'bg-card/50 border border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h4 className="font-heading text-lg font-semibold text-foreground mb-2">{plan.name}</h4>
                  {plan.subtitle && (
                    <p className="text-xs text-muted-foreground mb-2">{plan.subtitle}</p>
                  )}
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl font-heading font-bold text-gradient">{plan.price}€</span>
                    <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.popular ? 'hero' : 'outline'} 
                  size="lg" 
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
