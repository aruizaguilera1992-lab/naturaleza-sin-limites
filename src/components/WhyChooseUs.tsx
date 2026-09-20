import { motion } from 'framer-motion';
import { Shield, Award, Users, Heart } from 'lucide-react';

const stats = [
  { value: '50+', label: 'Rutas Exploradas' },
  { value: '10+', label: 'Años en Montaña' },
  { value: '4', label: 'Disciplinas' },
  { value: '100%', label: 'Dedicación' },
];

const differentiators = [
  {
    icon: Shield,
    title: 'Seguridad Prioritaria',
    description: 'Material homologado, protocolos rigurosos y formación continua.',
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


export function WhyChooseUs() {
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

        {/* Reseñas: solo publicaremos opiniones reales y verificables */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12 text-center">
            <h4 className="font-heading text-xl font-bold text-foreground mb-3">
              ¿Ya has salido con nosotros?
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Publicamos únicamente opiniones reales y verificables de personas que han hecho
              alguna de nuestras actividades. Si quieres contar tu experiencia, escríbenos por
              WhatsApp y la añadiremos con tu nombre y la actividad realizada.
            </p>
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
          {['Formación técnica en montaña', 'Compromiso con la seguridad', 'Mejora continua'].map((badge) => (
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
