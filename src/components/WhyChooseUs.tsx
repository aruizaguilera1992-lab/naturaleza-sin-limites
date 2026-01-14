import { motion } from 'framer-motion';
import { Shield, Award, Users, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const stats = [
  { value: '500+', label: 'Aventureros Entrenados' },
  { value: '100+', label: 'Rutas Exploradas' },
  { value: '15', label: 'Años de Experiencia' },
  { value: '98%', label: 'Satisfacción' },
];

const differentiators = [
  {
    icon: Shield,
    title: 'Seguridad Certificada',
    description: 'Guías TD2 titulados, material homologado y protocolos rigurosos.',
  },
  {
    icon: Award,
    title: 'Experiencia Única',
    description: 'No solo te llevamos, te preparamos para vivir cada aventura al máximo.',
  },
  {
    icon: Users,
    title: 'Grupos Reducidos',
    description: 'Máximo 6 personas por grupo para atención 100% personalizada.',
  },
  {
    icon: Heart,
    title: 'Comunidad 365 días',
    description: 'Mantente conectado con otros aventureros todo el año.',
  },
];

const testimonials = [
  {
    name: 'María García',
    role: 'Escaladora nivel intermedio',
    text: 'Gracias a Vértigo Sapiens he mejorado muchísimo mi técnica. Los entrenamientos específicos y las salidas de fin de semana son increíbles.',
    rating: 5,
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Principiante en barranquismo',
    text: 'Mi primera experiencia de barranquismo fue espectacular. Los guías transmiten una seguridad total y te hacen disfrutar cada momento.',
    rating: 5,
  },
  {
    name: 'Laura Martínez',
    role: 'Deportista de aventura',
    text: 'El programa de entrenamiento funcional es exactamente lo que necesitaba. He notado la diferencia en mis salidas a la montaña.',
    rating: 5,
  },
];

export function WhyChooseUs() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="nosotros" className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Stats Counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-4 block">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-section font-heading mb-4">
            La Diferencia <span className="text-gradient">Naturaleza Sin Límites</span>
          </h2>
        </motion.div>

        {/* Differentiators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-xl mb-4 group-hover:bg-primary/30 transition-colors">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h4 className="font-heading font-semibold text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12">
            {/* Quote Mark */}
            <div className="absolute top-6 left-8 text-6xl text-primary/20 font-serif">"</div>

            {/* Testimonial Content */}
            <div className="relative z-10">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>

              <motion.p
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-lg md:text-xl text-foreground/90 text-center mb-6 leading-relaxed"
              >
                {testimonials[currentTestimonial].text}
              </motion.p>

              <motion.div
                key={`author-${currentTestimonial}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <p className="font-heading font-semibold text-foreground">
                  {testimonials[currentTestimonial].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[currentTestimonial].role}
                </p>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                aria-label="Testimonio anterior"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                    }`}
                    aria-label={`Ver testimonio ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                aria-label="Siguiente testimonio"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {['CICMA Registrado', 'Guías TD2 Certificados', 'Seguro RC 2M€'].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
