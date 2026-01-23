import { motion } from 'framer-motion';
import { Heart, Shield, Leaf, Rocket } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: "Cercanía y confianza",
    description: "Trato directo, grupos reducidos y comunicación clara antes, durante y después de la actividad.",
  },
  {
    icon: Shield,
    title: "Seguridad consciente",
    description: "Decisiones técnicas basadas en formación y experiencia, explicadas de forma comprensible.",
  },
  {
    icon: Leaf,
    title: "Sostenibilidad real",
    description: "Respeto por los espacios naturales, grupos ajustados y enfoque de mínimo impacto.",
  },
  {
    icon: Rocket,
    title: "Crecimiento personal",
    description: "Actividades y entrenamientos pensados para que salgas de tu zona de confort, pero nunca de tu zona de seguridad.",
  },
];

export function QSValuesSection() {
  return (
    <section className="py-20 md:py-28 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Cercanía, sostenibilidad y crecimiento personal
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Cada salida y cada entrenamiento se diseña con una idea: que vivas la naturaleza 
            con profundidad, a tu ritmo y con total confianza. No se trata de hacer 
            "una actividad más", sino de crear experiencias que sumen a tu vida y respeten el entorno.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-10"
        >
          <a 
            href="#experiencia" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors"
          >
            Ver cómo es una actividad paso a paso →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
