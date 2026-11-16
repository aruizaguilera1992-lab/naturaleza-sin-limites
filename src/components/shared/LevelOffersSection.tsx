import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, MessageCircle, Mountain } from 'lucide-react';
import { LevelVisualStrip } from '@/components/shared/LevelVisualStrip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { levelOfferHref, levelOfferPhotos, levelOffersFor, levelOfferWhatsapp, type LevelDiscipline } from '@/data/levelOffers';

const contactInterest: Record<LevelDiscipline, string> = { barranquismo: 'barranquismo', ferratas: 'vias-ferratas' };

/** Tres tarjetas de nivel con foto ilustrativa de uso libre (no es el recorrido concreto). */
export function LevelOffersSection({ discipline, title, intro }: { discipline: LevelDiscipline; title: string; intro: string }) {
  const offers = levelOffersFor(discipline);
  return (
    <section id="experiencias" className="scroll-mt-32 py-16 bg-background">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Vive la experiencia</p>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl">{intro}</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map((o, i) => (
            <motion.article key={o.id} id={o.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="scroll-mt-32 flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300">
              <figure className="relative h-48 bg-muted">
                {levelOfferPhotos[o.id] && <img src={levelOfferPhotos[o.id].src} alt={levelOfferPhotos[o.id].alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                {levelOfferPhotos[o.id] && <figcaption className="absolute right-2 bottom-2 rounded bg-background/75 px-1.5 py-0.5 text-[10px] text-muted-foreground">Foto ilustrativa: <a href={levelOfferPhotos[o.id].fuente} target="_blank" rel="noopener noreferrer" className="underline">{levelOfferPhotos[o.id].autor}</a>, {levelOfferPhotos[o.id].licencia}</figcaption>}
                <div className="absolute left-4 top-4 flex gap-1">{[1, 2, 3].map((n) => <Mountain key={n} className={n <= o.orden ? 'h-6 w-6 text-primary' : 'h-6 w-6 text-muted-foreground/30'} />)}</div>
                <span className="absolute bottom-4 left-4 font-heading text-4xl font-extrabold text-foreground">Nivel {o.orden}</span>
              </figure>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex flex-wrap gap-2"><Badge className="border-primary/40 bg-primary/15 text-primary">{o.nivel}</Badge><Badge variant="outline">{o.grado}</Badge></div>
                <h3 className="text-xl font-heading font-bold text-foreground">{o.nombre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{o.descripcionCorta}</p>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {o.caracteristicas.map((c) => <li key={c} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{c}</li>)}
                </ul>
                <Link to={levelOfferHref(o)} className="mt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline">¿En qué consiste este nivel?</Link>
                <LevelVisualStrip className="mt-4" level={o.orden} minAge={o.edadMinima} fitness={o.condicionFisica} experience={o.experienciaPrevia} />
                <div className="mt-auto pt-6">
                  {o.precioDesde ? (
                    <p className="text-sm text-muted-foreground">Desde <span className="text-2xl font-extrabold text-primary">{o.precioDesde} €</span> / persona</p>
                  ) : (
                    <p className="text-lg font-bold text-primary">Precio a consultar</p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="hero" size="sm" className="min-h-11" asChild><Link to={`/contacto?interes=${contactInterest[discipline]}`}>Reservar o consultar</Link></Button>
                    <Button variant="outline" size="sm" className="min-h-11" asChild><a href={levelOfferWhatsapp(o)} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</a></Button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">El recorrido concreto se elige contigo según el nivel del grupo, la época y las condiciones.</p>
      </div>
    </section>
  );
}
