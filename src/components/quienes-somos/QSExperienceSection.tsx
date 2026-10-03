import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, Users, Target, Award, Mountain, Rocket, Flag } from 'lucide-react';

const credentials = [
  { icon: GraduationCap, text: 'Formación técnica específica en montaña y progresión vertical.' },
  { icon: Users, text: 'Experiencia real guiando a perfiles muy distintos, de iniciación a montañeros con años de práctica.' },
  { icon: Target, text: 'Visión de competidor: obsesión por la técnica, la seguridad y los detalles.' },
];

const timeline = [
  { year: '2010', title: 'Primeros pasos', description: 'Inicio en montaña y espeleología', icon: Mountain },
  { year: '2018', title: 'Formación técnica', description: 'TD2 en Espeleología y certificaciones deportivas', icon: GraduationCap },
  { year: '2022', title: 'Competición nacional', description: 'Competiciones de espeleología a nivel nacional', icon: Rocket },
  { year: '2024', title: 'Naturaleza Sin Límites', description: 'Creación del proyecto personal', icon: Flag },
];

const BG_IMAGE =
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=85&w=1920&auto=format&fit=crop';

export function QSExperienceSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="experiencia" className="relative py-20 md:py-28 overflow-hidden">
      <motion.img
        src={BG_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        initial={false}
        animate={reduceMotion ? { scale: 1.05 } : { scale: [1.05, 1.14] }}
        transition={{ duration: 26, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background/95" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Experiencia que <span className="text-gradient">se nota en el terreno</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Años de práctica en montaña, formación técnica y competición nacional:
            estarás en manos de alguien que vive lo que enseña.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left - Bio and credentials */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-primary" />
                <h3 className="font-heading text-xl font-bold text-foreground">Credenciales y logros</h3>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                <span className="text-foreground font-semibold">Antonio Ruiz Aguilera</span>,
                técnico deportivo en montaña y espeleología. Además de guiar y entrenar,
                compite a nivel nacional en disciplinas de cuevas:
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-4 bg-primary/10 rounded-xl p-4">
                  <span className="text-3xl">🥈</span>
                  <div>
                    <p className="font-heading font-bold text-foreground text-lg">2º de España</p>
                    <p className="text-xs text-muted-foreground">Travesía de Velocidad en Cuevas · Mayor Masculino 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-primary/10 rounded-xl p-4">
                  <span className="text-3xl">🥉</span>
                  <div>
                    <p className="font-heading font-bold text-foreground text-lg">3º de España</p>
                    <p className="text-xs text-muted-foreground">Travesía de Velocidad en Cuevas · Mayor Masculino 2025</p>
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
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50 h-full">
              <h3 className="font-heading text-xl font-bold text-foreground mb-8">Mi trayectoria</h3>

              <div className="relative">
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
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary-foreground" />
                      </div>

                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.year}</span>
                        <h4 className="font-heading font-bold text-foreground mt-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
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
