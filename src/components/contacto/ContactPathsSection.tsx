import { motion } from 'framer-motion';
import { Mountain, Trophy, Users, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import activityCanyoning from '@/assets/activity-canyoning.jpg';
import activityFerrata from '@/assets/activity-ferrata.jpg';

const pathways = [
  {
    id: 'adventure',
    title: 'Quiero vivir una experiencia de aventura',
    description: 'Ideal si buscas una salida de barranquismo, cuevas, vía ferrata u otra actividad puntual para ti, tu pareja, tus amigos o tu familia.',
    image: activityCanyoning,
    icon: Users,
    ctaShort: 'Propuesta de aventura',
    ctaLong: 'Quiero una propuesta de aventura',
    whatsappMessage: 'Hola, me interesa una experiencia de aventura. ¿Podrías darme más información?',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    id: 'training',
    title: 'Quiero mejorar mi rendimiento en montaña',
    description: 'Pensado si quieres dar un salto de nivel, entrenar con estructura y aprovechar la experiencia y resultados en competición para avanzar con seguridad.',
    image: activityFerrata,
    icon: Target,
    ctaShort: 'Hablar de entrenamiento',
    ctaLong: 'Quiero hablar sobre entrenamiento',
    whatsappMessage: 'Hola, quiero mejorar mi rendimiento en montaña. ¿Podemos hablar sobre el programa Vértigo Sapiens?',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconBg: 'bg-amber-500/10 text-amber-500',
  },
];

export function ContactPathsSection() {
  const phone = '+34685609542';

  const handleWhatsApp = (message: string) => {
    const url = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="que-buscas" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Qué estás buscando ahora mismo?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Elige el camino que mejor se adapte a lo que necesitas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-2 sm:px-0">
          {pathways.map((pathway, index) => (
            <motion.div
              key={pathway.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="w-full"
            >
              <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
                {/* Image */}
                <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
                  <img 
                    src={pathway.image} 
                    alt={pathway.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${pathway.gradient} to-transparent`} />
                  <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 p-2 sm:p-3 rounded-full ${pathway.iconBg}`}>
                    <pathway.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight">
                    {pathway.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {pathway.description}
                  </p>

                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full gap-2 text-sm sm:text-base"
                    onClick={() => handleWhatsApp(pathway.whatsappMessage)}
                  >
                    <span className="sm:hidden">{pathway.ctaShort}</span>
                    <span className="hidden sm:inline">{pathway.ctaLong}</span>
                    <ArrowRight className="w-4 h-4" />
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
