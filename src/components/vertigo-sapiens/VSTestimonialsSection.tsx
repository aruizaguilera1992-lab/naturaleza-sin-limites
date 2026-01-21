import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, TrendingUp, Dumbbell, Mountain, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Carlos Martínez',
    age: 29,
    role: 'Escalador',
    avatar: 'CM',
    content: 'Antes no pasaba del 6b. Después de 3 meses en VS, ya encadeno 7a. El entrenamiento específico marca la diferencia.',
    progress: '6b → 7a en 3 meses',
    rating: 5,
  },
  {
    name: 'María García',
    age: 34,
    role: 'Aventurera integral',
    avatar: 'MG',
    content: 'Lo mejor es la comunidad. Cada fin de semana salimos a escalar, barrancos o cuevas. He encontrado mi tribu de verdad.',
    progress: 'De 0 a 12 barrancos/año',
    rating: 5,
  },
  {
    name: 'Javier López',
    age: 41,
    role: 'Barranquista',
    avatar: 'JL',
    content: 'Antes me agotaba en el segundo rapel. Ahora completo barrancos de 8 horas sin problemas. El entreno funcional funciona.',
    progress: '+60% resistencia en 4 meses',
    rating: 5,
  },
  {
    name: 'Ana Rodríguez',
    age: 27,
    role: 'Espeleóloga',
    avatar: 'AR',
    content: 'La biblioteca técnica es oro puro. Aprendí técnicas de ascenso que nunca había visto en ningún curso presencial.',
    progress: 'De iniciación a avanzado en 6 meses',
    rating: 5,
  },
  {
    name: 'Pablo Fernández',
    age: 36,
    role: 'Escalador y ferratista',
    avatar: 'PF',
    content: 'Empecé con miedo al vacío. Ahora hago ferratas K5 sin problema. El trabajo mental que hacemos es increíble.',
    progress: 'Superó vértigo en 2 meses',
    rating: 5,
  },
];

const metrics = [
  { icon: TrendingUp, value: '+2', label: 'grados de mejora media en escalada', color: 'text-primary' },
  { icon: Dumbbell, value: '+40%', label: 'fuerza de dedos en 6 meses', color: 'text-accent' },
  { icon: Mountain, value: '85%', label: 'asisten a salidas outdoor regulares', color: 'text-secondary' },
  { icon: Award, value: '4.9/5', label: 'satisfacción de miembros', color: 'text-adventure-orange' },
];

export function VSTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section className="py-24 relative overflow-hidden bg-adventure-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Resultados <span className="text-gradient">Reales</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Historias de transformación de nuestra comunidad de aventureros
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300"
            >
              <metric.icon className={`h-8 w-8 mx-auto mb-3 ${metric.color}`} />
              <div className="text-3xl font-heading font-bold text-foreground mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 z-10 bg-card/50 hover:bg-card"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 z-10 bg-card/50 hover:bg-card"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Testimonial Card */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-10"
                >
                  <Quote className="h-10 w-10 text-primary/30 mb-6" />
                  
                  <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                    "{testimonials[currentIndex].content}"
                  </p>

                  {/* Progress Badge */}
                  <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {testimonials[currentIndex].progress}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                        {testimonials[currentIndex].avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-lg">
                          {testimonials[currentIndex].name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonials[currentIndex].role} ({testimonials[currentIndex].age} años)
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-8'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
