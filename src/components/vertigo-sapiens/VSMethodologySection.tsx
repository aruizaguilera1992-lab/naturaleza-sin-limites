import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Heart, Timer, Grip } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const methodologyTabs = [
  {
    id: 'fuerza',
    label: 'Fuerza Funcional',
    icon: Dumbbell,
    title: 'Fuerza Funcional para Aventura',
    description: 'Desarrollamos la fuerza que realmente necesitas en la pared, el cañón o la cueva.',
    content: [
      { title: 'Fuerza de dedos', desc: 'Entrenamiento específico con hangboard y campus para mejorar tu agarre en escalada.' },
      { title: 'Core para rapel', desc: 'Estabilidad abdominal para mantener el control en descensos técnicos.' },
      { title: 'Resistencia de agarre', desc: 'Capacidad de mantener el agarre durante horas de actividad.' },
      { title: 'Trabajo con TRX y anillas', desc: 'Fuerza funcional que se transfiere directamente a la aventura.' },
    ],
  },
  {
    id: 'movilidad',
    label: 'Movilidad',
    icon: Heart,
    title: 'Movilidad y Prevención de Lesiones',
    description: 'Un cuerpo móvil es un cuerpo que puede explorar sin limitaciones.',
    content: [
      { title: 'Movilidad de hombros', desc: 'Rango de movimiento completo para alcanzar cualquier presa.' },
      { title: 'Flexibilidad de cadera', desc: 'Pisadas altas y movimientos de rana sin esfuerzo.' },
      { title: 'Estabilidad de core', desc: 'Protege tu espalda en movimientos comprometidos.' },
      { title: 'Prevención de lesiones', desc: 'Protocolos específicos para las lesiones más comunes en aventura.' },
    ],
  },
  {
    id: 'resistencia',
    label: 'Resistencia',
    icon: Timer,
    title: 'Resistencia Cardiovascular Específica',
    description: 'Aguanta jornadas de 8 horas sin que la fatiga arruine tu aventura.',
    content: [
      { title: 'Capacidad cardiovascular', desc: 'Base aeróbica para jornadas largas en montaña.' },
      { title: 'Resistencia muscular local', desc: 'Músculos que no se agotan en la cuarta hora.' },
      { title: 'Tolerancia al lactato', desc: 'Sigue escalando cuando tus antebrazos arden.' },
      { title: 'Trail running específico', desc: 'Aproximaciones y retornos sin sufrir.' },
    ],
  },
  {
    id: 'tecnica',
    label: 'Técnica',
    icon: Grip,
    title: 'Técnica y Movimiento Eficiente',
    description: 'La técnica ahorra energía. Aprende a moverte con eficiencia.',
    content: [
      { title: 'Técnica de ascenso', desc: 'Progresión vertical en cuerda con mínimo esfuerzo.' },
      { title: 'Movimiento en boulder', desc: 'Lee los problemas y ejecuta con precisión.' },
      { title: 'Eficiencia en pared', desc: 'Menos fuerza, más técnica, más metros.' },
      { title: 'Equilibrio y propiocepción', desc: 'Pies precisos en cualquier terreno.' },
    ],
  },
];

export function VSMethodologySection() {
  const [activeTab, setActiveTab] = useState('fuerza');

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
            Metodología de <span className="text-gradient">Entrenamiento</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un sistema de 4 pilares diseñado específicamente para deportes de aventura vertical
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto mb-8">
            {methodologyTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-primary/20 data-[state=active]:border-primary border border-border rounded-xl transition-all"
              >
                <tab.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {methodologyTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-xl">
                      <tab.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-foreground">
                        {tab.title}
                      </h3>
                      <p className="text-muted-foreground">{tab.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {tab.content.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 bg-background/50 rounded-xl"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  );
}
