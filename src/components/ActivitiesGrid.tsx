import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import activitySpeleology from '@/assets/activity-speleology.jpg';
import activityCanyoning from '@/assets/activity-canyoning.jpg';
import activityClimbing from '@/assets/activity-climbing.jpg';
import activityFerrata from '@/assets/activity-ferrata.jpg';

const activities = [
  {
    id: 'espeleologia',
    title: 'Espeleología',
    subtitle: 'Explora el Mundo Subterráneo',
    description: 'Descubre cuevas fascinantes con técnicas de progresión vertical. Desde iniciación hasta nivel avanzado.',
    price: 45,
    image: activitySpeleology,
    cta: 'Ver Rutas',
    link: null,
  },
  {
    id: 'barranquismo',
    title: 'Barranquismo',
    subtitle: 'Descensos de Vértigo',
    description: 'Experiencia completa: rapel, saltos, toboganes naturales. Aventura segura adaptada a todos los niveles.',
    price: 55,
    image: activityCanyoning,
    cta: 'Ver Barrancos',
    link: '/barranquismo',
  },
  {
    id: 'escalada',
    title: 'Escalada',
    subtitle: 'Conquista la Vertical',
    description: 'Vías deportivas y clásicas en las mejores escuelas de Málaga. Salidas dirigidas cada fin de semana.',
    price: 49,
    image: activityClimbing,
    cta: 'Ver Escuelas',
    link: '/escalada',
  },
  {
    id: 'vias-ferratas',
    title: 'Vías Ferratas',
    subtitle: 'Adrenalina en las Alturas',
    description: 'Rutas equipadas con cables y clavijas. Vive la sensación de la pared con máxima seguridad.',
    price: 50,
    image: activityFerrata,
    cta: 'Ver Ferratas',
    link: null,
  },
];

export function ActivitiesGrid() {
  return (
    <section id="actividades" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest mb-4 block">
            Nuestras Actividades
          </span>
          <h2 className="text-section font-heading mb-4">
            Vive la <span className="text-gradient">Aventura</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiencias únicas en los mejores escenarios naturales de Málaga y Andalucía
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="card-overlay group-hover:card-overlay-hover transition-all duration-500" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                  Desde {activity.price}€
                </div>

                {/* Title */}
                <div className="transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                  <h3 className="text-2xl font-heading text-foreground mb-1">{activity.title}</h3>
                  <p className="text-primary font-medium mb-3">{activity.subtitle}</p>
                  
                  {/* Description - Hidden by default, shows on hover */}
                  <p className="text-foreground/80 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                    {activity.description}
                  </p>

                  {activity.link ? (
                    <Button 
                      variant="hero" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0"
                      asChild
                    >
                      <Link to={activity.link}>{activity.cta}</Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0"
                    >
                      {activity.cta}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            ¿No sabes cuál elegir? Contacta con nosotros y te asesoraremos
          </p>
          <Button variant="outline" size="lg">
            Solicitar Información
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
