import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Mountain, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { activityProfiles } from '@/data/activityProfiles';

const featuredKeys = [
  'barranquismo/guadalmina',
  'escalada/chorro-frontales',
  'vias-ferratas/ferrata-el-chorro',
  'barranquismo/jorox',
];

const featured = featuredKeys.flatMap((key) => {
  const [category, slug] = key.split('/');
  const match = activityProfiles.find((item) => item.category === category && item.slug === slug && item.priceValue);
  return match ? [match] : [];
});

export function ActivitiesGrid() {
  return (
    <section id="actividades" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-3 block text-sm font-bold uppercase text-primary">Experiencias destacadas</span>
            <h2 className="text-3xl font-extrabold sm:text-5xl">Elige tu próxima aventura</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Compara nivel, duración y precio antes de elegir. Todas las salidas se confirman según el perfil del grupo y las condiciones.</p>
          </div>
          <Button variant="outline" size="default" className="self-start md:self-auto" asChild><Link to="/actividades">Ver catálogo completo <ArrowRight /></Link></Button>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((activity, index) => (
            <motion.article key={activity.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
              <Link to={`/actividades/${activity.category}/${activity.slug}`} className="relative block aspect-[4/3] overflow-hidden">
                <img src={activity.image} alt={activity.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold uppercase text-foreground">{activity.categoryLabel}</span>
                <span className="absolute right-3 top-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur">Máx. 6</span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" />{activity.zone}, {activity.province}</p>
                <h3 className="mt-2 min-h-[3rem] text-lg font-bold leading-6 [overflow-wrap:anywhere]">{activity.name}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 border-y border-border py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mountain className="h-3.5 w-3.5 text-primary" />{activity.technicalLevel}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{activity.totalDuration}</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Desde</p>
                  <p className="text-2xl font-extrabold text-primary">{activity.price} <span className="text-xs font-semibold text-muted-foreground">/ persona</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">Salidas bajo petición</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="min-h-11 px-2" asChild><Link to={`/actividades/${activity.category}/${activity.slug}`}>Ver experiencia</Link></Button>
                  <Button variant="hero" size="sm" className="min-h-11 px-2" asChild><Link to={`/reservar/${activity.category}/${activity.slug}`}>Reservar</Link></Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-7 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Explorar por disciplina:</span>
          <Link to="/barranquismo" className="hover:text-primary">Barranquismo</Link>
          <Link to="/escalada" className="hover:text-primary">Escalada</Link>
          <Link to="/vias-ferratas" className="hover:text-primary">Vías ferratas</Link>
        </div>
      </div>
    </section>
  );
}