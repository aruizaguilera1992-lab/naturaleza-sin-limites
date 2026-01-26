import { motion } from 'framer-motion';
import { ArrowRight, Mountain, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BlogCTA() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-primary/10 via-adventure-orange/10 to-adventure-forest/10 rounded-3xl p-8 sm:p-12 text-center border border-primary/20 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-adventure-orange/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Mountain className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                ¿Te ha gustado lo que has leído?
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Deja de leer sobre aventuras y empieza a vivirlas. Reserva tu próxima experiencia 
                o descubre nuestro programa de entrenamiento Vértigo Sapiens.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/contacto">
                    <Mountain className="w-5 h-5 mr-2" />
                    Reservar Aventura
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/vertigo-sapiens">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Vértigo Sapiens
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
