import { motion } from 'framer-motion';
import founderImage from '@/assets/founder-antonio.png';

const founder = {
  name: 'Antonio Ruiz Aguilera',
  role: 'Fundador & Coach Especialista en Fuerza, Biomecánica y Aventura',
  image: founderImage,
  bio: `Entrenador personal con Máster en Entrenamiento Deportivo-Físico y más de 5 años de experiencia en centros de referencia, donde ha diseñado programas de fuerza, resistencia y readaptación para más de 100 clientes mensuales. Su trabajo integra biomecánica aplicada, prevención de lesiones y disciplinas como yoga y pilates para construir una base sólida antes de exigir al máximo el rendimiento.

Como Técnico Deportivo en Espeleología TD2, ha coordinado y guiado decenas de expediciones y competiciones oficiales de espeleología y descenso de cañones en Andalucía, lo que le permite llevar el entrenamiento más allá del gimnasio y convertir la naturaleza en una herramienta de transformación personal. Su enfoque une ciencia del entrenamiento, experiencias de aventura y un acompañamiento cercano para que cada persona gane fuerza, confianza y autonomía dentro y fuera de la montaña.`,
};

export function VSTrainersSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-adventure-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Fundador y <span className="text-gradient">Entrenador Principal</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiencia, ciencia del entrenamiento y pasión por la aventura
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
              {/* Photo */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-6 md:p-8">
                <h3 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-2">
                  {founder.name}
                </h3>
                <p className="text-primary text-sm md:text-base font-medium mb-6">{founder.role}</p>

                {/* Bio */}
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {founder.bio}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
