import { motion } from 'framer-motion';
import { MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContactClosingSection() {
  const phone = '+34685609542';
  const whatsappUrl = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent('Hola, me gustaría hablar sobre mi próxima aventura.')}`;

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-background to-black">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-primary font-heading font-bold uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-3">
            <Shield className="w-5 h-5" />
            Tu seguridad es lo primero
          </p>

          <h2 className="font-heading text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-foreground mb-10 leading-tight">
            La montaña <span className="text-primary">te espera</span>
          </h2>

          {/* Ornament */}
          <div className="flex justify-center gap-4 mb-10">
            <div className="h-px w-20 bg-primary self-center" />
            <div className="w-3 h-3 rotate-45 border-2 border-primary" />
            <div className="h-px w-20 bg-primary self-center" />
          </div>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Escríbeme sin compromiso y vemos juntos qué aventura o proceso de
            entrenamiento tiene más sentido para ti ahora mismo.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="hero"
              size="lg"
              className="gap-2 text-lg px-8 py-6 uppercase tracking-widest"
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              Cuéntame qué buscas
            </Button>
          </motion.div>

          {/* Trust message */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-muted-foreground mt-6"
          >
            Responderé personalmente tu mensaje en menos de 24–48 horas.
            Trato directo, sin intermediarios.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
