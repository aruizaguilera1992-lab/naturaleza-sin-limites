import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Necesito experiencia previa para participar?',
    answer:
      'No, la mayoría de actividades están diseñadas para personas sin experiencia. Siempre adaptamos el nivel y el ritmo al grupo. Si tienes dudas sobre tu forma física o alguna limitación, consúltame antes y lo valoramos juntos.',
  },
  {
    question: '¿Qué pasa si tengo miedo a las alturas o a espacios cerrados?',
    answer:
      'Es más común de lo que crees. Trabajamos con grupos pequeños y ritmo adaptado para que puedas gestionar esos miedos en un entorno controlado. Muchas personas descubren que pueden superarlos cuando se sienten acompañadas y seguras.',
  },
  {
    question: '¿Qué forma física necesito para las actividades?',
    answer:
      'Depende de la actividad. Algunas requieren un nivel básico (poder caminar por terreno irregular durante 2-3 horas) y otras son más exigentes. En cada descripción indicamos el nivel recomendado, y siempre puedes consultarme antes de reservar.',
  },
];

const BG_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=85&w=1920&auto=format&fit=crop';

export function QSCTASection() {
  const reduceMotion = useReducedMotion();
  const phoneNumber = '34685609542';
  const message = encodeURIComponent(
    '¡Hola! He visto vuestra web y me gustaría saber más sobre vuestras actividades. ¿Podríamos hablar?'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <motion.img
        src={BG_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        initial={false}
        animate={reduceMotion ? { scale: 1.05 } : { scale: [1.05, 1.14] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background/95" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            ¿Listo para tu <span className="text-gradient">próxima aventura</span>?
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
            Cuéntame qué buscas y lo diseñamos juntos: tu próxima aventura o tu entrenamiento.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Button asChild variant="hero" size="xl" className="shadow-glow">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Cuéntame qué buscas y diseñamos tu próxima aventura</span>
                <span className="sm:hidden">Diseñamos tu aventura</span>
              </a>
            </Button>
          </motion.div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-16">
            <Clock className="w-4 h-4" />
            <span>Responderé personalmente tu mensaje en menos de 24–48 horas.</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-left"
          >
            <h3 className="font-heading text-xl font-bold text-foreground text-center mb-6">
              Preguntas frecuentes
            </h3>

            <Accordion
              type="single"
              collapsible
              className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
            >
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors text-left">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
