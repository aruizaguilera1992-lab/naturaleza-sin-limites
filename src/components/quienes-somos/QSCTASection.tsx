import { motion } from 'framer-motion';
import { MessageCircle, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "¿Necesito experiencia previa para participar?",
    answer: "No, la mayoría de actividades están diseñadas para personas sin experiencia. Siempre adaptamos el nivel y el ritmo al grupo. Si tienes dudas sobre tu forma física o alguna limitación, consúltame antes y lo valoramos juntos.",
  },
  {
    question: "¿Qué pasa si tengo miedo a las alturas o a espacios cerrados?",
    answer: "Es más común de lo que crees. Trabajamos con grupos pequeños y ritmo adaptado para que puedas gestionar esos miedos en un entorno controlado. Muchas personas descubren que pueden superarlos cuando se sienten acompañadas y seguras.",
  },
  {
    question: "¿Qué forma física necesito para las actividades?",
    answer: "Depende de la actividad. Algunas requieren un nivel básico (poder caminar por terreno irregular durante 2-3 horas) y otras son más exigentes. En cada descripción indicamos el nivel recomendado, y siempre puedes consultarme antes de reservar.",
  },
];

export function QSCTASection() {
  const phoneNumber = '34685609542';
  const message = encodeURIComponent('¡Hola! He visto vuestra web y me gustaría saber más sobre vuestras actividades. ¿Podríamos hablar?');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Si has llegado hasta aquí, seguramente la naturaleza ya significa algo importante para ti. 
            El siguiente paso es sencillo: contarme qué buscas y diseñar juntos tu próxima aventura 
            o proceso de entrenamiento.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Button
              asChild
              variant="hero"
              size="xl"
              className="shadow-glow"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Cuéntame qué buscas y diseñamos tu próxima aventura
              </a>
            </Button>
          </motion.div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-16">
            <Clock className="w-4 h-4" />
            <span>Responderé personalmente tu mensaje en menos de 24–48 horas. Trato directo, sin intermediarios.</span>
          </div>

          {/* Mini FAQ */}
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

            <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors text-left">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
