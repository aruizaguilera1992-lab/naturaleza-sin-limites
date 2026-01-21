import { motion } from 'framer-motion';
import { Award, Mountain, Users, BookOpen } from 'lucide-react';

const trainers = [
  {
    name: 'Antonio García',
    role: 'Fundador & Head Coach',
    avatar: 'AG',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    certifications: [
      'Técnico deportivo en escalada',
      'Guía de barranquismo',
      'Entrenador personal NSCA-CPT',
    ],
    experience: [
      '+10 años en deportes de montaña',
      '+50 barrancos explorados',
      'Formador de espeleología',
    ],
    specialty: 'Escalada y fuerza específica',
  },
  {
    name: 'Laura Sánchez',
    role: 'Coach de Movilidad',
    avatar: 'LS',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    certifications: [
      'Fisioterapeuta deportiva',
      'Especialista en movilidad FRC',
      'Instructora de yoga',
    ],
    experience: [
      '+8 años en rehabilitación deportiva',
      'Escaladora desde hace 12 años',
      'Especialista en prevención de lesiones',
    ],
    specialty: 'Movilidad y prevención',
  },
  {
    name: 'Miguel Torres',
    role: 'Coach de Resistencia',
    avatar: 'MT',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    certifications: [
      'Licenciado en CAFYD',
      'Especialista en trail running',
      'Técnico en espeleología',
    ],
    experience: [
      '+15 maratones de montaña',
      'Explorador de cuevas (+100 cavidades)',
      'Guía de alta montaña',
    ],
    specialty: 'Resistencia y espeleología',
  },
];

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
            Equipo de <span className="text-gradient">Entrenadores</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesionales apasionados por la aventura con las mejores credenciales
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Specialty Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {trainer.specialty}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                    {trainer.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-4">{trainer.role}</p>

                  {/* Certifications */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Titulaciones:</span>
                    </div>
                    <ul className="space-y-1">
                      {trainer.certifications.map((cert) => (
                        <li key={cert} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mountain className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Experiencia:</span>
                    </div>
                    <ul className="space-y-1">
                      {trainer.experience.map((exp) => (
                        <li key={exp} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {exp}
                        </li>
                      ))}
                    </ul>
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
