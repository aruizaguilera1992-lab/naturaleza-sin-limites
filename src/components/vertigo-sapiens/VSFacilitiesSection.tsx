import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const facilities = [
  {
    id: 1,
    title: 'Zona de Boulder y Campus Board',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    description: 'Muro de boulder con problemas desde 4a hasta 8a, más campus board profesional para entrenamiento de fuerza de dedos.',
  },
  {
    id: 2,
    title: 'Área de TRX y Anillas',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    description: 'Estaciones de suspensión para entrenamiento funcional específico de escalada y deportes verticales.',
  },
  {
    id: 3,
    title: 'Espacio de Movilidad',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    description: 'Zona dedicada a estiramientos, yoga y trabajo de movilidad articular.',
  },
  {
    id: 4,
    title: 'Material Técnico Profesional',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    description: 'Equipamiento completo: bloqueadores, descendedores, poleas y material de progresión vertical para práctica.',
  },
];

const features = [
  'Espacio outdoor para técnica de cuerdas',
  'Campus board y moon board',
  'Sistema de poleas para simular rapel',
  'Equipamiento profesional de montaña',
  'Zona de vestuarios y duchas',
  'Aparcamiento gratuito',
];

export function VSFacilitiesSection() {
  const [selectedImage, setSelectedImage] = useState<typeof facilities[0] | null>(null);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-adventure-dark/50" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-section font-heading mb-4">
            Instalaciones y <span className="text-gradient">Equipamiento</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un espacio diseñado específicamente para el entrenamiento de deportes de aventura
          </p>
        </motion.div>

        {/* Image Gallery */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(facility)}
            >
              <img
                src={facility.image}
                alt={facility.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Expand Icon */}
              <div className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4 text-white" />
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-heading font-semibold text-white text-sm md:text-base">
                  {facility.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 max-w-3xl mx-auto"
        >
          <h3 className="font-heading text-lg font-semibold text-foreground text-center mb-6">
            ¿Qué encontrarás en nuestro espacio?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lightbox Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border">
            {selectedImage && (
              <>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-muted-foreground">{selectedImage.description}</p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
