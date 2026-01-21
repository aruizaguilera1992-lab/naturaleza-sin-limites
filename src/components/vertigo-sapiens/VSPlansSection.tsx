import { motion } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Aventurero Activo',
    price: 99,
    period: '/mes',
    description: 'Perfecto para empezar tu transformación',
    popular: false,
    cta: 'Elegir Plan',
  },
  {
    name: 'Entrenador Personal',
    price: 298,
    period: '/mes',
    description: 'Atención personalizada y resultados garantizados',
    popular: true,
    cta: 'Transformación Total',
  },
  {
    name: 'Outdoor Experiencial',
    price: 180,
    period: '',
    subtitle: 'Paquete 4 actividades',
    description: 'Sin compromiso mensual, solo aventuras',
    popular: false,
    cta: 'Comprar Paquete',
  },
];

const features = [
  { 
    name: 'Precio/mes', 
    values: ['99€', '298€', '180€ (paquete)'] 
  },
  { 
    name: 'Sesiones presenciales', 
    values: ['1-2/semana', '2 presencial + 2 online', '-'] 
  },
  { 
    name: 'Salidas outdoor', 
    values: [true, true, '4 salidas programadas'] 
  },
  { 
    name: 'Plan personalizado', 
    values: ['Genérico', true, false] 
  },
  { 
    name: 'Biblioteca técnica', 
    values: [true, true, 'Acceso limitado'] 
  },
  { 
    name: 'Asesoramiento', 
    values: ['Chat grupal', 'Videollamadas mensuales', false] 
  },
  { 
    name: 'Seguimiento métricas', 
    values: ['Básico', 'Métricas avanzadas', false] 
  },
  { 
    name: 'Nutrición', 
    values: [false, true, false] 
  },
  { 
    name: 'Compromiso', 
    values: ['Mensual', 'Trimestral', 'No suscripción'] 
  },
];

const renderValue = (value: boolean | string) => {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />;
  }
  return <span className="text-sm text-foreground">{value}</span>;
};

export function VSPlansSection() {
  const handlePlanSelect = (planName: string) => {
    const message = encodeURIComponent(
      `¡Hola! Estoy interesado en el plan "${planName}" de Vértigo Sapiens. ¿Podrían darme más información?`
    );
    window.open(`https://wa.me/34685609542?text=${message}`, '_blank');
  };

  return (
    <section id="planes" className="py-24 relative overflow-hidden bg-adventure-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Elige tu <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Opciones flexibles para adaptarse a tu ritmo y objetivos
          </p>
        </motion.div>

        {/* Plan Cards for Mobile */}
        <div className="md:hidden grid gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
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
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    <Star className="h-3 w-3" /> Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                {plan.subtitle && (
                  <p className="text-xs text-muted-foreground mb-2">{plan.subtitle}</p>
                )}
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-4xl font-heading font-bold text-gradient">{plan.price}€</span>
                  <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                size="lg"
                className="w-full"
                onClick={() => handlePlanSelect(plan.name)}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table for Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hidden md:block max-w-5xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-border">
              <div className="p-6 bg-background/50">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Comparativa
                </span>
              </div>
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 text-center ${plan.popular ? 'bg-primary/10' : ''}`}
                >
                  {plan.popular && (
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                      <Star className="h-3 w-3" /> Más Popular
                    </span>
                  )}
                  <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
                  {plan.subtitle && (
                    <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                  )}
                  <div className="flex items-end justify-center gap-1 mt-2">
                    <span className="text-3xl font-heading font-bold text-gradient">{plan.price}€</span>
                    <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className={`grid grid-cols-4 ${index !== features.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="p-4 flex items-center bg-background/30">
                  <span className="text-sm font-medium text-foreground">{feature.name}</span>
                </div>
                {feature.values.map((value, vIndex) => (
                  <div
                    key={vIndex}
                    className={`p-4 flex items-center justify-center ${plans[vIndex].popular ? 'bg-primary/5' : ''}`}
                  >
                    {renderValue(value)}
                  </div>
                ))}
              </div>
            ))}

            {/* CTA Row */}
            <div className="grid grid-cols-4 border-t border-border bg-background/30">
              <div className="p-6" />
              {plans.map((plan) => (
                <div key={plan.name} className={`p-6 ${plan.popular ? 'bg-primary/5' : ''}`}>
                  <Button
                    variant={plan.popular ? 'hero' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
