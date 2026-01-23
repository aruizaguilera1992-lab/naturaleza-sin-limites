import { motion } from 'framer-motion';
import { MessageCircle, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContactClosingSection() {
  const phone = '+34685609542';
  const whatsappUrl = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent('Hola, me gustaría hablar sobre mi próxima aventura.')}`;

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Heart className="w-6 h-6" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
            Tu seguridad y tu experiencia son lo primero
          </h2>
          
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
              className="gap-2 text-lg px-8 py-6"
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
