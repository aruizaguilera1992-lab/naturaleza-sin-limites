import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Mountain, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { activityProfiles, getActivityCatalogImage } from '@/data/activityProfiles';
import { getActivityMedia } from '@/data/activityMedia';

const caveImage = getActivityMedia('exploracion');

const DISCIPLINES = [
  {
    name: 'Barranquismo',
    description: 'Descensos guiados entre ríos y cascadas',
    to: '/barranquismo',
    image: getActivityCatalogImage('barranquismo', 'guadalmina') ?? '',
    imageAlt: 'Barranco con toboganes y saltos: actividad de barranquismo guiada en Málaga',
  },
  {
    name: 'Escalada',
    description: 'Vive la pared con seguridad y guía',
    to: '/escalada',
    image: getActivityCatalogImage('escalada', 'chorro-frontales') ?? '',
    imageAlt: 'Escalador deportivo en una pared de roca caliza en Andalucía',
  },
  {
    name: 'Vías ferratas',
    description: 'Itinerarios verticales equipados con cable',
    to: '/vias-ferratas',
    image: getActivityCatalogImage('vias-ferratas', 'ferrata-el-chorro') ?? '',
    imageAlt: 'Vía ferrata con cable y peldaños sobre un desfiladero rocoso',
  },
  {
    name: 'Espeleología',
    description: 'Exploración guiada de cavidades subterráneas',
    to: '/espeleologia',
    image: caveImage?.src ?? '',
    imageAlt: caveImage?.alt ?? 'Espeleólogos explorando una cavidad subterránea iluminada con frontal',
  },
];

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
        <div className="border-b border-border pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
            <span className="mb-3 block text-lg font-bold uppercase text-primary">Explorar por disciplina</span>
            <h2 className="text-3xl font-extrabold sm:text-5xl">Cuatro formas de vivir la montaña</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Elige tu disciplina y te orientamos hacia la salida que mejor encaja contigo. Cada categoría tiene su propio formulario para encontrar tu experiencia ideal.</p>
          </motion.div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {DISCIPLINES.map((discipline, index) => (
              <motion.div key={discipline.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Link
                  to={discipline.to}
                  className="group relative block h-72 overflow-hidden rounded-xl border border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-card sm:h-80"
                >
                  <img
                    src={discipline.image}
                    alt={discipline.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">{discipline.name}</h3>
                      <p className="mt-2 text-sm leading-5 text-muted-foreground sm:text-base">{discipline.description}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-6 w-6" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-10 mt-12 max-w-2xl text-center">
          <span className="mb-3 block text-lg font-bold uppercase text-primary">Experiencias destacadas</span>
          <h2 className="text-3xl font-extrabold sm:text-5xl">Elige tu próxima aventura</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Compara nivel, duración y precio antes de elegir. Todas las salidas se confirman según el perfil del grupo y las condiciones.</p>
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
      </div>
    </section>
  );
}