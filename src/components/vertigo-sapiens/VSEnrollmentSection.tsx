import { motion } from 'framer-motion';
import { Calendar, ClipboardCheck, CreditCard, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '1',
    icon: Calendar,
    title: 'Clase de Prueba Gratis',
    description: 'Reserva tu clase para conocer el programa y entrenar con nosotros sin compromiso.',
    color: 'from-primary to-primary/60',
  },
  {
    number: '2',
    icon: ClipboardCheck,
    title: 'Valoración Inicial',
    description: 'Evaluamos tu nivel actual, condición física y definimos tus objetivos personales.',
    color: 'from-accent to-accent/60',
  },
  {
    number: '3',
    icon: CreditCard,
    title: 'Elige tu Plan',
    description: 'Selecciona el plan que mejor se adapte a tu ritmo de vida y objetivos.',
    color: 'from-secondary to-secondary/60',
  },
  {
    number: '4',
    icon: Rocket,
    title: '¡Empieza a Entrenar!',
    description: 'Primera semana con onboarding personalizado y acceso a toda la comunidad.',
    color: 'from-adventure-orange to-adventure-orange/60',
  },
];

export function VSEnrollmentSection() {
  const scrollToTrial = () => {
    document.getElementById('prueba-gratis')?.scrollIntoView({ behavior: 'smooth' });
  };

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
            Proceso de <span className="text-gradient">Inscripción</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En 4 sencillos pasos estarás entrenando con nosotros
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}

                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all duration-300 h-full">
                  {/* Number Badge */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${step.color} text-white font-heading font-bold text-2xl mb-4 shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              variant="hero"
              size="xl"
              onClick={scrollToTrial}
              className="group"
            >
              Reservar Clase de Prueba Gratis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sin compromiso · Cancela cuando quieras
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
