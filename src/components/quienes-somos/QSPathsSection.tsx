import { motion } from 'framer-motion';
import { Mountain, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const paths = [
  {
    icon: Mountain,
    title: "Experiencias de aventura",
    audience: "Para quienes quieren descubrir la naturaleza de forma segura, emocionante y responsable.",
    bullets: [
      "Barranquismo, cuevas, vías ferratas y actividades guiadas en entornos únicos.",
      "Pensado para parejas, grupos de amigos, familias y personas que se inician.",
      "Tú disfrutas; yo me ocupo de la seguridad, el ritmo del grupo y los detalles.",
    ],
    cta: "Quiero vivir una experiencia de aventura",
    link: "/actividades",
    gradient: "from-adventure-orange/20 to-adventure-orange/5",
    iconBg: "bg-adventure-orange",
  },
  {
    icon: TrendingUp,
    title: "Entrenamiento y progreso en montaña",
    audience: "Para quienes sienten que la montaña ya es parte de su vida y quieren ir un paso más allá.",
    bullets: [
      "Entrenamientos estructurados para mejorar tu rendimiento y tu técnica.",
      "Acompañamiento cercano, con seguimiento y feedback individual.",
      "Enfoque en crecimiento personal: no solo llegar más alto, sino hacerlo con cabeza.",
    ],
    cta: "Quiero mejorar mi rendimiento en montaña",
    link: "/vertigo-sapiens",
    gradient: "from-adventure-forest/20 to-adventure-forest/5",
    iconBg: "bg-adventure-forest",
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
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Dos caminos, un mismo propósito
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Naturaleza Sin Límites combina experiencias de turismo activo y entrenamiento 
            específico en montaña para que puedas elegir cómo quieres vivir la naturaleza: 
            disfrutando un día inolvidable o construyendo un proceso de mejora continua.
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
            >
              <Card className={`h-full bg-gradient-to-br ${path.gradient} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-xl ${path.iconBg} flex items-center justify-center mb-6`}>
                    <path.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                    {path.title}
                  </h3>

                  <p className="text-muted-foreground italic mb-6">
                    {path.audience}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {path.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="default" className="w-full text-sm sm:text-base">
                    <Link to={path.link}>
                      <span className="hidden sm:inline">{path.cta}</span>
                      <span className="sm:hidden">{path.title === 'Experiencias de aventura' ? 'Ver experiencias' : 'Ver entrenamiento'}</span>
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
