import { motion } from 'framer-motion';
import { Mountain, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const paths = [
  {
    icon: Mountain,
    title: 'Experiencias de aventura',
    lead: 'Salidas guiadas en barrancos, cuevas, paredes y ferratas de Málaga y Andalucía.',
    benefits: [
      'Grupos reducidos, máximo 6 personas',
      'Guía profesional en cada salida',
      'Tú lo disfrutas; nosotros nos ocupamos de todo',
    ],
    cta: 'Quiero vivir una experiencia de aventura',
    shortCta: 'Ver experiencias',
    link: '/actividades',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=85&w=1920&auto=format&fit=crop',
    iconBg: 'bg-adventure-orange',
  },
  {
    icon: TrendingUp,
    title: 'Entrenamiento y progreso en montaña',
    lead: 'Programa online de 8 semanas para llegar más lejos en la montaña.',
    benefits: [
      'Fuerza funcional, resistencia y movilidad',
      'Plan guiado con seguimiento periódico',
      '100% online, a tu ritmo',
    ],
    cta: 'Quiero mejorar mi rendimiento en montaña',
    shortCta: 'Ver entrenamiento',
    link: '/vertigo-sapiens',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=85&w=1920&auto=format&fit=crop',
    iconBg: 'bg-adventure-forest',
  },
];

export function QSPathsSection() {
  return (
    <section id="que-hacemos" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Dos caminos, <span className="text-gradient">un mismo propósito</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Elige cómo quieres vivir la naturaleza: un día inolvidable o un proceso de mejora continua.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {paths.map((path, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="h-full"
            >
              <Card className="group relative h-full min-h-[440px] overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={path.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/10" />

                <CardContent className="relative z-10 flex h-full flex-col justify-end p-8">
                  <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-5', path.iconBg)}>
                    <path.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {path.title}
                  </h3>

                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-5">
                    {path.lead}
                  </p>

                  <ul className="space-y-2.5 mb-7">
                    {path.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base font-medium text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="hero" className="w-full text-sm sm:text-base mt-auto">
                    <Link to={path.link}>
                      <span className="hidden sm:inline">{path.cta}</span>
                      <span className="sm:hidden">{path.shortCta}</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
