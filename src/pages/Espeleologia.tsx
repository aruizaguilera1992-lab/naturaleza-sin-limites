import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, Users, MapPin, ShieldCheck, Backpack, Sparkles, MessageCircle, ChevronRight,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { PracticalInfo } from '@/components/shared/PracticalInfo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { media } from '@/data/media';
import { espeleologiaPublicada, espeleologiaContenido } from '@/data/espeleologia';

const whatsappUrl =
  'https://wa.me/34685609542?text=' +
  encodeURIComponent('¡Hola! Me interesa la Espeleología. ¿Podéis contarme las opciones y disponibilidad?');

const Espeleologia = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const actividades = espeleologiaPublicada();
  const c = espeleologiaContenido;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Espeleología en Málaga y Andalucía | Naturaleza Sin Límites"
        description="Espeleología guiada en Málaga y Andalucía: iniciación, progresión vertical y salidas de exploración con guía titulado, material incluido y grupos reducidos."
        path="/espeleologia"
      />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-center pt-44 pb-16 md:pt-40">
          <div className="absolute inset-0">
            <img
              src={media.espeleologiaHero.src}
              alt={media.espeleologiaHero.alt}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          </div>

          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                🕯️ Actividad guiada
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-4">
                {c.titulo}
              </h1>
              <p className="text-lg sm:text-xl text-primary font-medium mb-5">{c.subtitulo}</p>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">{c.introduccion}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/contacto?interes=espeleologia">Reservar o consultar</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Preguntar por WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Actividades */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
              Nuestras salidas de espeleología
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Tres formatos según tu experiencia. La cavidad, la duración y el precio se confirman al cerrar la salida,
              siempre con permisos vigentes.
            </p>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {actividades.map((a, i) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={a.imagen}
                      alt={a.imagenAlt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {a.nivelLabel}
                    </Badge>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-2">{a.nombre}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{a.descripcionCorta}</p>

                    <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> {a.duracion}
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Grupo mínimo {a.grupoMinimo} · desde {a.requisitos.edadMinima} años
                      </li>
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> {a.provincia}
                      </li>
                    </ul>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-primary">{a.precio}</span>
                      <Button variant="hero" size="sm" asChild>
                        <Link to="/contacto?interes=espeleologia">
                          Ver actividad <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Bloques informativos */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-6">
            {[
              { title: '¿Qué vivirás?', icon: Sparkles, items: c.queViviras },
              { title: 'Nivel y requisitos', icon: Users, items: c.nivelRequisitos },
              { title: 'Qué incluye', icon: ShieldCheck, items: c.queIncluye },
              { title: 'Qué traer', icon: Backpack, items: c.queTraer },
            ].map((block) => (
              <div key={block.title} className="bg-card border border-border rounded-xl p-6">
                <h2 className="flex items-center gap-2 text-xl font-heading font-bold text-foreground mb-4">
                  <block.icon className="h-5 w-5 text-primary" />
                  {block.title}
                </h2>
                <ul className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="md:col-span-2 bg-card border border-border rounded-xl p-6">
              <h2 className="flex items-center gap-2 text-xl font-heading font-bold text-foreground mb-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Seguridad y respeto por la cavidad
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {c.seguridad.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Información práctica compartida */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <PracticalInfo />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-6 text-center">
              Preguntas frecuentes
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {c.faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.pregunta}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-xl px-4"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    {faq.pregunta}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.respuesta}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
                ¿Bajamos juntos?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Cuéntanos tu nivel, cuántos sois y qué fechas manejáis. Te proponemos la salida adecuada con la cavidad,
                la duración y el precio confirmados.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/contacto?interes=espeleologia">Solicitar mi salida</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Escribir por WhatsApp
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6">{c.creditosFoto}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default Espeleologia;
