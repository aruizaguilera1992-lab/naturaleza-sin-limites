import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, Users, Video, Mountain, BookOpen, MessageCircle, Dumbbell, Apple, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanDetailSheet } from './PlanDetailSheet';
const plans = [
  {
    name: 'Aventurero Activo',
    pricePerSession: 12,
    monthlyPrice: 99,
    period: '/sesión',
    description: 'Perfecto para empezar tu transformación',
    popular: false,
    cta: 'Elegir Plan',
    sessionsInfo: '~8 sesiones/mes',
    profile: 'Cliente que quiere entrenamiento presencial + acceso a comunidad online',
    components: [
      { icon: Dumbbell, text: 'Sesiones presenciales en grupos pequeños (4-6 max)' },
      { icon: MessageCircle, text: 'Acceso a comunidad cerrada digital' },
      { icon: BookOpen, text: 'Acceso a biblioteca online de cursos' },
    ],
    pricingOptions: [
      { sessions: '1 sesión/semana', total: '4 sesiones/mes', price: '119€/mes' },
      { sessions: '2 sesiones/semana', total: '8 sesiones/mes', price: '189€/mes' },
    ],
    commitment: '3 meses mínimo',
    discount: '10-15% si 6 meses prepago',
    benefits: [
      'Entrenamiento funcional especializado para deportes de aventura',
      'Grupos pequeños para atención personalizada',
      'Acceso 24/7 a contenido formativo',
      'Comunidad de aventureros con intereses comunes',
    ],
    solves: [
      'Falta de preparación física específica',
      'Aburrimiento del gimnasio tradicional',
      'Soledad en el entrenamiento',
    ],
  },
  {
    name: 'Entrenador Personal',
    pricePerSession: 19,
    monthlyPrice: 298,
    period: '/sesión',
    description: 'Atención personalizada y resultados garantizados',
    popular: true,
    cta: 'Transformación Total',
    sessionsInfo: '~16 sesiones/mes',
    profile: 'Cliente que quiere integración completa presencial + online + personalización',
    components: [
      { icon: Dumbbell, text: '2 sesiones presenciales/semana (8 sesiones/mes)' },
      { icon: Video, text: '2 sesiones asesoramiento online 1-a-1/mes (Zoom)' },
      { icon: MessageCircle, text: 'Acceso ilimitado a comunidad cerrada' },
      { icon: BookOpen, text: 'Acceso ilimitado a biblioteca online' },
      { icon: Activity, text: 'Plan de entrenamiento personalizado (actualizado mensualmente)' },
      { icon: Apple, text: 'Plan nutricional personalizado (1 revisión/mes)' },
      { icon: Video, text: 'Análisis de movimiento en video (2 análisis/mes)' },
    ],
    pricingOptions: [
      { sessions: 'Plan completo', total: '10 sesiones/mes', price: '329€/mes' },
      { sessions: '6 meses prepago', total: 'Ahorro 15%', price: '285€/mes' },
    ],
    commitment: '3 meses mínimo',
    discount: 'Ahorro 15% si 6 meses prepago = 285€/mes',
    benefits: [
      'Asesoramiento online personalizado (entrenamiento + nutrición + rehabilitación)',
      'Análisis de video para corrección técnica',
      'Plan 100% adaptado a tus objetivos',
      'Seguimiento continuo de tu progreso',
      'Todo en uno: gym + técnica + nutrición',
    ],
    solves: [
      'Falta de tiempo para gestionar múltiples servicios',
      'Miedo a lesiones por falta de asesoramiento',
      'Coste elevado de contratar múltiples coaches',
      'Falta de feedback claro sobre progreso',
    ],
  },
  {
    name: 'Outdoor Experiencial',
    pricePerSession: 45,
    monthlyPrice: 180,
    period: '/actividad',
    subtitle: 'Paquete 4 actividades',
    description: 'Sin compromiso mensual, solo aventuras',
    popular: false,
    cta: 'Comprar Paquete',
    sessionsInfo: '4 salidas programadas',
    profile: 'Cliente que compra solo actividades outdoor sin membresía',
    components: [
      { icon: Mountain, text: 'Actividades outdoor en 3 niveles de dificultad' },
      { icon: Users, text: 'Grupos reducidos con guía especializado' },
      { icon: Activity, text: 'Material técnico incluido' },
    ],
    pricingOptions: [
      { sessions: 'Actividad suelta', total: 'Según nivel', price: '59-79€' },
      { sessions: 'Paquete 4 actividades', total: 'Ahorro 10%', price: '215€' },
      { sessions: 'Paquete 8 actividades', total: 'Ahorro 15%', price: '380€' },
    ],
    commitment: 'Sin suscripción mensual',
    discount: 'Hasta 15% en paquetes',
    benefits: [
      'Salidas programadas cada fin de semana',
      'Grupos de nivel 1, 2 y 3',
      'Aplica lo entrenado en entorno real',
      'Flexibilidad total sin compromiso',
    ],
    solves: [
      'Desconocimiento sobre ejercicios específicos',
      'Falta de compañeros para actividades',
      'Dificultad para organizar salidas',
    ],
  },
];

const features = [
  { 
    name: 'Precio por sesión', 
    values: ['Desde 12€', 'Desde 19€', 'Desde 45€'] 
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
    return <Check className="h-5 w-5 text-primary mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />;
  }
  return <span className="text-sm text-foreground">{value}</span>;
};

export function VSPlansSection() {
  const [openPlanIndex, setOpenPlanIndex] = useState<number | null>(null);

  const togglePlan = (index: number) => {
    setOpenPlanIndex(openPlanIndex === index ? null : index);
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
                <div className="flex flex-col items-center gap-1 mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Desde</span>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl font-heading font-bold text-gradient">{plan.pricePerSession}€</span>
                    <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{plan.sessionsInfo}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <PlanDetailSheet
                profile={plan.profile}
                components={plan.components}
                pricingOptions={plan.pricingOptions}
                commitment={plan.commitment}
                discount={plan.discount}
                benefits={plan.benefits}
                solves={plan.solves}
                isPopular={plan.popular}
                ctaLabel={plan.cta}
                planName={plan.name}
                isOpen={openPlanIndex === index}
                onToggle={() => togglePlan(index)}
              />
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
                  <div className="flex flex-col items-center gap-0.5 mt-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Desde</span>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-3xl font-heading font-bold text-gradient">{plan.pricePerSession}€</span>
                      <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.sessionsInfo}</span>
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

            {/* CTA Row with Expandable Details */}
            <div className="grid grid-cols-4 border-t border-border">
              <div className="p-6 bg-background/30">
                <span className="text-sm font-medium text-foreground">Reservar</span>
              </div>
              {plans.map((plan, index) => (
                <div key={plan.name} className={`p-4 ${plan.popular ? 'bg-primary/5' : ''}`}>
                  <PlanDetailSheet
                    profile={plan.profile}
                    components={plan.components}
                    pricingOptions={plan.pricingOptions}
                    commitment={plan.commitment}
                    discount={plan.discount}
                    benefits={plan.benefits}
                    solves={plan.solves}
                    isPopular={plan.popular}
                    ctaLabel={plan.cta}
                    planName={plan.name}
                    isOpen={openPlanIndex === index}
                    onToggle={() => togglePlan(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
