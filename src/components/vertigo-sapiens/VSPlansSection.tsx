import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Users, Video, Mountain, BookOpen, MessageCircle, Dumbbell, Apple, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanDetailCard } from './PlanDetailCard';
import { PlanDetailSheet } from './PlanDetailSheet';
const plans = [{
  name: 'Aventurero Activo',
  subtitle: 'Entrenamiento funcional para deportes de aventura',
  pricePerSession: 15,
  monthlyPrice: 119,
  period: '/sesión',
  description: 'Prepárate físicamente para escalar, hacer barrancos y montaña con un programa guiado, en grupos pequeños y con acceso 24/7 a contenido formativo y comunidad privada.',
  popular: false,
  cta: 'Ver detalles',
  sessionsInfo: '4-8 sesiones/mes',
  profile: 'Entrenamiento funcional para deportes de aventura, con comunidad online incluida.',
  motivationalQuote: 'El gimnasio tradicional te aburre. La montaña te llama. Aquí preparamos tu cuerpo para responder.',
  components: [{
    icon: Dumbbell,
    text: 'Sesiones presenciales en grupos reducidos (4-6 personas) para atención muy personalizada'
  }, {
    icon: MessageCircle,
    text: 'Acceso a comunidad digital cerrada de aventureros con tus mismos intereses'
  }, {
    icon: BookOpen,
    text: 'Biblioteca online de cursos para seguir mejorando fuera del gimnasio'
  }],
  pricingOptions: [{
    sessions: '1 sesión/semana',
    total: '4 al mes',
    price: '119€/mes',
    note: 'Ideal si ya haces algo de actividad por tu cuenta'
  }, {
    sessions: '2 sesiones/semana',
    total: '8 al mes',
    price: '189€/mes',
    note: 'Para progresar rápido y ganar confianza'
  }],
  commitment: '3 meses mínimo',
  commitmentNote: 'para garantizar resultados reales',
  discount: '10-15% prepago 6 meses',
  benefits: ['Programa guiado específico para escalada, barrancos y montaña', 'Grupos pequeños (4-6) para atención muy personalizada', 'Acceso 24/7 a contenido formativo y comunidad privada', 'Progresa con aventureros que comparten tus mismos intereses'],
}, {
  name: 'Entrenador Personal',
  subtitle: 'Integración total: presencial + online + planificación personalizada',
  pricePerSession: 33,
  monthlyPrice: 329,
  period: '/sesión',
  description: 'Consigue resultados visibles con un sistema completo que une entrenamiento, técnica, nutrición y seguimiento continuo, sin tener que coordinar varios profesionales.',
  popular: true,
  cta: 'Ver detalles',
  sessionsInfo: '10 sesiones/mes',
  profile: 'Integración total: sesiones presenciales, asesoramiento online y planificación 100% personalizada para tus objetivos.',
  motivationalQuote: 'Tu tiempo es oro. Nosotros unimos entrenamiento, nutrición y técnica para que tú solo tengas que dar lo mejor.',
  components: [{
    icon: Dumbbell,
    text: '2 sesiones presenciales por semana (8 al mes) para entrenar contigo y corregir la técnica en directo'
  }, {
    icon: Video,
    text: '2 sesiones online 1-a-1 al mes por Zoom para resolver dudas, ajustar el plan y mantener la motivación alta'
  }, {
    icon: MessageCircle,
    text: 'Acceso ilimitado a comunidad privada y biblioteca online para apoyo constante y recursos extra'
  }, {
    icon: Activity,
    text: 'Plan de entrenamiento personalizado actualizado cada mes, adaptado a tu progreso y agenda'
  }, {
    icon: Apple,
    text: 'Plan nutricional personalizado con revisión mensual'
  }, {
    icon: Video,
    text: 'Análisis de movimiento en vídeo (2 al mes) para mejorar rendimiento y prevenir lesiones'
  }],
  pricingOptions: [{
    sessions: 'Plan completo',
    total: '8 presenciales + 2 online',
    price: '329€/mes',
    note: 'Todo incluido para resultados visibles'
  }, {
    sessions: '6 meses prepago',
    total: 'Ahorro 15%',
    price: '285€/mes',
    note: 'Ideal si ya tienes claro que quieres un cambio serio'
  }],
  commitment: '3 meses mínimo',
  commitmentNote: 'para garantizar resultados y un proceso bien estructurado',
  discount: '15% con 6 meses prepago',
  benefits: ['Sistema completo: entrenamiento + técnica + nutrición en uno', 'Seguimiento continuo sin coordinar varios profesionales', 'Plan 100% adaptado a tus objetivos y agenda', 'Análisis de video para corrección técnica y prevención de lesiones', 'Motivación alta con sesiones online personalizadas'],
}, {
  name: 'Outdoor Experiencial',
  subtitle: 'Aventura sin suscripción ni compromiso mensual',
  pricePerSession: 54,
  monthlyPrice: 215,
  period: '/actividad',
  description: 'Disfruta de salidas outdoor guiadas, con todo el material técnico incluido y grupos por niveles, para aplicar lo que entrenas en un entorno real con total seguridad.',
  popular: false,
  cta: 'Ver detalles',
  sessionsInfo: 'Paga solo lo que usas',
  profile: 'Actividades de aventura de fin de semana para vivir la montaña sin suscripción ni compromiso mensual.',
  motivationalQuote: 'La aventura no espera. Elige tu próxima salida y deja que la montaña haga el resto.',
  components: [{
    icon: Mountain,
    text: 'Actividades outdoor con 3 niveles de dificultad (iniciación, intermedio y avanzado) para que siempre encuentres un reto a tu medida'
  }, {
    icon: Users,
    text: 'Grupos reducidos con guía especializado en deportes de aventura'
  }, {
    icon: Activity,
    text: 'Material técnico incluido, sin necesidad de comprar equipo específico para empezar'
  }],
  pricingOptions: [{
    sessions: 'Actividad suelta',
    total: 'Según nivel y tipo',
    price: '59-79€',
    note: 'Perfecto para probar sin compromiso'
  }, {
    sessions: 'Paquete 4 actividades',
    total: 'Ahorro 10%',
    price: '215€',
    note: 'Un mes lleno de aventuras'
  }, {
    sessions: 'Paquete 8 actividades',
    total: 'Ahorro 15%',
    price: '380€',
    note: 'Ideal para comprometerte con tu progreso outdoor'
  }],
  commitment: 'Sin suscripción',
  commitmentNote: 'pagas solo por las salidas que realizas',
  discount: 'Hasta 15% en paquetes',
  benefits: ['Salidas guiadas cada fin de semana con seguridad garantizada', '3 niveles de dificultad para encontrar tu reto perfecto', 'Aplica lo que entrenas en un entorno real de montaña', 'Flexibilidad total: sin cuotas, sin compromiso mensual'],
}];
const features = [{
  name: 'Precio por sesión',
  values: ['Desde 12€', 'Desde 19€', 'Desde 45€']
}, {
  name: 'Sesiones presenciales',
  values: ['1-2/semana', '2 presencial + 2 online', '-']
}, {
  name: 'Salidas outdoor',
  values: [true, true, '4 salidas programadas']
}, {
  name: 'Plan personalizado',
  values: ['Genérico', true, false]
}, {
  name: 'Biblioteca técnica',
  values: [true, true, 'Acceso limitado']
}, {
  name: 'Asesoramiento',
  values: ['Chat grupal', 'Videollamadas mensuales', false]
}, {
  name: 'Seguimiento métricas',
  values: ['Básico', 'Métricas avanzadas', false]
}, {
  name: 'Nutrición',
  values: [false, true, false]
}, {
  name: 'Compromiso',
  values: ['Mensual', 'Trimestral', 'No suscripción']
}];
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
  return <section id="planes" className="py-24 relative overflow-hidden bg-adventure-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h2 className="text-section font-heading mb-4">
            Elige tu <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Opciones flexibles para adaptarse a tu ritmo y objetivos
          </p>
        </motion.div>

        {/* Plan Cards for Mobile */}
        <div className="md:hidden grid gap-6 mb-8">
          {plans.map((plan, index) => <motion.div key={plan.name} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className={`relative rounded-2xl p-6 ${plan.popular ? 'bg-gradient-to-b from-primary/20 to-primary/5 border-2 border-primary shadow-glow' : 'bg-card/50 border border-border'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    <Star className="h-3 w-3" /> Más Popular
                  </span>
                </div>}

              <div className="text-center mb-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                {plan.subtitle && <p className="text-xs text-muted-foreground mb-2">{plan.subtitle}</p>}
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

              <PlanDetailSheet profile={plan.profile} components={plan.components} pricingOptions={plan.pricingOptions} commitment={plan.commitment} discount={plan.discount} benefits={plan.benefits} motivationalQuote={plan.motivationalQuote} isPopular={plan.popular} ctaLabel={plan.cta} planName={plan.name} isOpen={openPlanIndex === index} onToggle={() => togglePlan(index)} />
            </motion.div>)}
        </div>
        {/* Comparison Table for Desktop */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="hidden md:block max-w-5xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-border">
              <div className="p-6 bg-background/50">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Comparativa
                </span>
              </div>
              {plans.map(plan => <div key={plan.name} className={`p-6 text-center ${plan.popular ? 'bg-primary/10' : ''}`}>
                  {plan.popular && <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                      <Star className="h-3 w-3" /> Más Popular
                    </span>}
                  <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
                  {plan.subtitle && <p className="text-xs text-muted-foreground">{plan.subtitle}</p>}
                  <div className="flex flex-col items-center gap-0.5 mt-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Desde</span>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-3xl font-heading font-bold text-gradient">{plan.pricePerSession}€</span>
                      <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.sessionsInfo}</span>
                  </div>
                </div>)}
            </div>

            {/* Features */}
            {features.map((feature, index) => <div key={feature.name} className={`grid grid-cols-4 ${index !== features.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="p-4 flex items-center bg-background/30">
                  <span className="text-sm font-medium text-foreground">{feature.name}</span>
                </div>
                {feature.values.map((value, vIndex) => <div key={vIndex} className={`p-4 flex items-center justify-center ${plans[vIndex].popular ? 'bg-primary/5' : ''}`}>
                    {renderValue(value)}
                  </div>)}
              </div>)}

            {/* CTA Row */}
            <div className="grid grid-cols-4 border-t border-border">
              <div className="p-6 bg-background/30">
                <span className="text-sm font-medium text-foreground">Reservar</span>
              </div>
              {plans.map((plan, index) => <div key={plan.name} className={`p-4 ${plan.popular ? 'bg-primary/5' : ''}`}>
                  <Button variant={plan.popular ? 'hero' : 'outline'} className={`w-full transition-all duration-300 ${openPlanIndex === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} onClick={() => togglePlan(index)}>
                    {plan.cta}
                  </Button>
                </div>)}
            </div>
          </div>

          {/* Independent Expandable Detail Card */}
          <AnimatePresence>
            {openPlanIndex !== null && <PlanDetailCard profile={plans[openPlanIndex].profile} components={plans[openPlanIndex].components} pricingOptions={plans[openPlanIndex].pricingOptions} commitment={plans[openPlanIndex].commitment} discount={plans[openPlanIndex].discount} benefits={plans[openPlanIndex].benefits} motivationalQuote={plans[openPlanIndex].motivationalQuote} isPopular={plans[openPlanIndex].popular} planName={plans[openPlanIndex].name} onClose={() => setOpenPlanIndex(null)} />}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>;
}