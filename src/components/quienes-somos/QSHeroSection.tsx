import { motion } from 'framer-motion';
import { User, MessageCircle, Leaf } from 'lucide-react';
import founderImage from '@/assets/founder-antonio.png';

const bullets = [
  { icon: User, text: "Proyecto de autor, no una agencia masiva." },
  { icon: MessageCircle, text: "Trato directo contigo desde el primer mensaje hasta la actividad." },
  { icon: Leaf, text: "Decisiones pensadas para cuidar tanto a las personas como a la naturaleza." },
];

export function QSHeroSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Quién está detrás de{' '}
              <span className="text-primary">Naturaleza Sin Límites</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Naturaleza Sin Límites nace de un aventurero con una idea clara: que la montaña, 
              las cuevas y la naturaleza sean espacios de crecimiento personal para todo tipo 
              de personas, no solo para unos pocos iniciados. Es un proyecto personal, creado 
              para acompañarte de cerca, con confianza, seguridad y mucho respeto por el entorno.
            </p>

            <ul className="space-y-4 mb-8">
              {bullets.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium pt-2">{item.text}</span>
                </motion.li>
              ))}
            </ul>

            <a 
              href="#que-hacemos" 
              className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-2 transition-colors"
            >
              Conoce qué hacemos exactamente →
            </a>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={founderImage}
                alt="Antonio Ruiz Aguilera - Fundador de Naturaleza Sin Límites"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Micro text overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Proyecto personal, trato directo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cada aventura es única porque tú lo eres
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -right-4 w-full h-full rounded-2xl bg-primary/20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
