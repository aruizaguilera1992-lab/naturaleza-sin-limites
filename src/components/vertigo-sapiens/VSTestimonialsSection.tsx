import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos Martínez',
    role: 'Escalador desde 2023',
    avatar: 'CM',
    content: 'Llegué sin poder hacer un 6a y en 8 meses estoy proyectando 7a. El entrenamiento específico marca la diferencia.',
    rating: 5,
  },
  {
    name: 'María García',
    role: 'Aventurera integral',
    avatar: 'MG',
    content: 'Lo mejor es la comunidad. Cada fin de semana salimos a escalar, barrancos o cuevas. He encontrado mi tribu.',
    rating: 5,
  },
  {
    name: 'Javier López',
    role: 'Barranquista',
    avatar: 'JL',
    content: 'Antes me agotaba en el segundo rapel. Ahora completo barrancos de 6 horas sin problemas. El entreno funciona.',
    rating: 5,
  },
  {
    name: 'Ana Rodríguez',
    role: 'Espeleóloga',
    avatar: 'AR',
    content: 'La biblioteca técnica es oro puro. Aprendí técnicas de ascenso que nunca había visto en ningún curso.',
    rating: 5,
  },
];

export function VSTestimonialsSection() {
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
            Lo que dicen nuestros <span className="text-gradient">Aventureros</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Historias reales de transformación y superación
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 h-full hover:border-primary/50 transition-all duration-300">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-primary/30 mb-4" />

                {/* Content */}
                <p className="text-foreground/90 text-sm leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
