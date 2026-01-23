import { motion } from 'framer-motion';
import { GraduationCap, Users, Target, Award, Mountain, Rocket, Flag } from 'lucide-react';

const credentials = [
  { icon: GraduationCap, text: "Formación técnica específica en montaña y progresión vertical." },
  { icon: Users, text: "Experiencia real guiando a perfiles muy distintos, desde iniciación hasta amantes de la montaña con años de práctica." },
  { icon: Target, text: "Visión de competidor: obsesión por la técnica, la seguridad y los detalles." },
];

const timeline = [
  { year: "2010", title: "Primeros pasos", description: "Inicio en actividades de montaña y espeleología", icon: Mountain },
  { year: "2018", title: "Formación técnica", description: "TD2 en Espeleología y certificaciones deportivas", icon: GraduationCap },
  { year: "2022", title: "Competición nacional", description: "Inicio en competiciones de espeleología a nivel nacional", icon: Rocket },
  { year: "2024", title: "Naturaleza Sin Límites", description: "Creación del proyecto personal", icon: Flag },
];

export function QSExperienceSection() {
  return (
    <section id="experiencia" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Experiencia que se nota en el terreno
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Detrás de cada propuesta hay años de práctica en montaña, formación técnica 
            específica y experiencia en competición, para que sientas que estás en manos 
            de alguien que vive lo que enseña.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left - Bio and credentials */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card rounded-2xl p-8 border border-border/50 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-primary" />
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Credenciales y logros
                </h3>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Soy <span className="text-foreground font-semibold">Antonio Ruiz Aguilera</span>, 
                aventurero y técnico deportivo especializado en actividades de montaña y espeleología, 
                con certificación deportiva y técnica que avala mi forma de trabajar. Además de guiar 
                y entrenar, compito a nivel nacional en disciplinas de cuevas, con resultados recientes como:
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">2º de España</p>
                    <p className="text-xs text-muted-foreground">Travesía de Velocidad en Cuevas - Categoría Mayor Masculino 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
                  <span className="text-2xl">🥉</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">3º de España</p>
                    <p className="text-xs text-muted-foreground">Travesía de Velocidad en Cuevas - Categoría Mayor Masculino 2025</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-4">
                {credentials.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right - Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl p-8 border border-border/50 h-full">
              <h3 className="font-heading text-xl font-bold text-foreground mb-8">
                Mi trayectoria
              </h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-8">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="relative pl-12"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary-foreground" />
                      </div>

                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {item.year}
                        </span>
                        <h4 className="font-heading font-bold text-foreground mt-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
