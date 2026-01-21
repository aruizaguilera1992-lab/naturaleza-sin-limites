import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Necesito experiencia previa en deportes de aventura?',
    answer: 'No, nuestros programas están diseñados para todos los niveles. Tenemos grupos específicos para principiantes donde empezarás desde cero con total seguridad. El entrenamiento funcional te preparará para afrontar cualquier actividad.',
  },
  {
    question: '¿Qué incluye exactamente el material de las salidas outdoor?',
    answer: 'Todo el material técnico necesario: arneses, cascos, cuerdas, mosquetones, grigris, y material específico según la actividad (neopreno para barrancos, material de espeleo para cuevas). Solo necesitas traer ropa adecuada y calzado.',
  },
  {
    question: '¿Puedo cambiar de plan después de empezar?',
    answer: 'Sí, puedes cambiar de plan en cualquier momento. Si subes de plan, aplicaremos la diferencia prorrateada. Si bajas, el cambio será efectivo en el siguiente ciclo de facturación.',
  },
  {
    question: '¿Las salidas outdoor son obligatorias?',
    answer: 'No son obligatorias, pero sí muy recomendadas. El objetivo del programa es que apliques en la roca real lo que entrenas en la sala. Organizamos varias salidas cada fin de semana con diferentes niveles de dificultad.',
  },
  {
    question: '¿Qué pasa si no puedo asistir a una sesión?',
    answer: 'Ofrecemos flexibilidad total. Puedes recuperar sesiones en otros horarios o grupos. También tienes acceso a la biblioteca de videos para seguir entrenando en casa cuando no puedas venir.',
  },
  {
    question: '¿Hay compromiso de permanencia?',
    answer: 'El plan "Aventurero Activo" es mensual sin compromiso. El plan "Entrenador Personal" tiene un compromiso trimestral para garantizar resultados. El paquete "Outdoor Experiencial" no tiene suscripción.',
  },
  {
    question: '¿Cómo funciona el seguimiento personalizado?',
    answer: 'En el plan "Entrenador Personal", realizamos evaluaciones periódicas de fuerza, movilidad y técnica. Generamos métricas de progreso y ajustamos tu plan cada mes en videollamadas individuales.',
  },
  {
    question: '¿Puedo probar antes de apuntarme?',
    answer: '¡Por supuesto! Ofrecemos una clase de prueba gratuita sin compromiso. Ven a conocernos, entrena con el grupo y decide si Vértigo Sapiens es para ti.',
  },
];

export function VSFAQSection() {
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
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-section font-heading mb-4">
            Preguntas <span className="text-gradient">Frecuentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas saber sobre Vértigo Sapiens
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
