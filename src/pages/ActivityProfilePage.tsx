import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, Check, Clock, ExternalLink, MapPin, Mountain, ShieldCheck, Sparkles, Sun, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getActivityCatalogImage, getActivityProfile, getRelatedProfiles } from '@/data/activityProfiles';
import { getActivityMedia, getActivityMediaCollection } from '@/data/activityMedia';
import { SITE_URL } from '@/lib/site';
import { MobileBookingBar } from '@/components/actividades/MobileBookingBar';
import { ActivityHeroCarousel } from '@/components/actividades/ActivityHeroCarousel';
import { ActivityBookingPanel } from '@/components/actividades/ActivityBookingPanel';

function shorten(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

function summarize(value: string, sentences = 2, max = 260) {
  const parts = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  let out = parts.slice(0, sentences).join(' ').trim() || value;
  if (out.length > max) out = `${out.slice(0, max - 1).trimEnd()}…`;
  return out;
}

/** Descripción comercial de cabecera: máximo 35 palabras, sin inventar contenido. */
function capWords(value: string, maxWords = 35) {
  const words = value.split(/\s+/).filter(Boolean);
  return words.length <= maxWords ? value : `${words.slice(0, maxWords).join(' ')}…`;
}

export default function ActivityProfilePage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const activity = getActivityProfile(category, slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [category, slug]);
  if (!activity) return <Navigate to="/actividades" replace />;

  const related = getRelatedProfiles(activity);
  const canonical = `${SITE_URL}/actividades/${activity.category}/${activity.slug}`;
  const metaTitle = shorten(`${activity.name} en ${activity.zone} | Naturaleza Sin Límites`, 60);
  const metaDescription = shorten(`${activity.categoryLabel} en ${activity.zone}, ${activity.province}. Consulta nivel, duración, requisitos y disponibilidad de ${activity.name}.`, 155);
  const numericPrice = activity.priceValue && activity.priceValue > 0 ? activity.priceValue : undefined;
  const whatsappBase = 'https://wa.me/34685609542?text=';
  const consultUrl = `${whatsappBase}${encodeURIComponent(`Hola, quiero consultar disponibilidad de ${activity.name}, en ${activity.zone}.`)}`;
  const sourceMedia = getActivityMedia(activity.slug);
  const gallery = getActivityMediaCollection(activity.category, activity.slug, sourceMedia ?? {
    src: activity.image,
    alt: activity.imageAlt,
    sourceUrl: activity.sourceUrl ?? canonical,
    sourceTitle: activity.name,
    license: 'Referencia del catálogo',
    status: 'propia-pendiente',
  });

  const structuredData = [
    { '@context': 'https://schema.org', '@type': 'Product', name: activity.name, description: metaDescription, category: activity.categoryLabel, image: activity.image.startsWith('http') ? activity.image : undefined, url: canonical, brand: { '@type': 'Brand', name: 'Naturaleza Sin Límites' }, ...(numericPrice ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: numericPrice, availability: 'https://schema.org/LimitedAvailability', url: canonical } } : {}) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: activity.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    { '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': `${SITE_URL}/#business`, name: 'Naturaleza Sin Límites', areaServed: `${activity.province}, Andalucía`, telephone: '+34685609542', email: 'naturaleza.s.limites@gmail.com', url: SITE_URL },
  ];

  const highlightIcons = [Sparkles, Mountain, Users, Sun];
  const technicalRows = ([
    ['Tipo de actividad', activity.type], ['Duración total', activity.totalDuration], ['Duración efectiva', activity.effectiveDuration], ['Nivel técnico', activity.technicalLevel], ['Nivel físico', activity.physicalLevel], ['Temporada', activity.season], ['Grupo mínimo/máximo', activity.group], ['Ratio guía-participantes', activity.guideRatio], ['Aproximación y retorno', activity.approachReturn], ['Elementos técnicos', activity.technicalElements.join(', ')], ['Zona de encuentro', activity.meetingPoint],
  ] as [string, string][]).filter(([, value]) => Boolean(value?.trim()));
  const list = (items: string[], Icon = Check) => <ul className="grid gap-2.5 text-sm text-muted-foreground">{items.map((item) => <li key={item} className="flex gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul>;
  const extraSafety = activity.safetyRequirements.filter((item) =>
    !['Edad mínima', 'Nivel físico', 'Experiencia previa'].some((l) => item.startsWith(`${l}:`)) &&
    !/^(Seguro y acreditación profesional|Permisos y regulación):/i.test(item) &&
    !/^La salida queda condicionada a la meteorología/i.test(item),
  );
  const visibleFaqs = activity.faqs.filter((faq) => /^(¿Dónde se realiza|¿Cuánto dura|¿Necesito experiencia|¿Qué edad mínima|¿Cómo se reserva|¿Qué ocurre si cambia el tiempo)/.test(faq.question));
  const faqs = visibleFaqs.length > 0 ? visibleFaqs : activity.faqs.slice(0, 5);
  const trigger = 'min-h-14 font-heading text-lg text-left';
  const itinerary = activity.itinerary.slice(0, 5);
  const headerDescription = capWords(summarize(activity.commercialDescription, 2, 220));

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground lg:pb-0">
      <Helmet>
        <title>{metaTitle}</title><meta name="description" content={metaDescription} /><link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} /><meta property="og:description" content={metaDescription} /><meta property="og:type" content="website" /><meta property="og:url" content={canonical} /><meta name="twitter:card" content="summary_large_image" />
        {structuredData.map((data, index) => <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>)}
      </Helmet>
      <Navbar />
      <main className="pt-20 sm:pt-24 lg:pt-28">
        <ActivityHeroCarousel key={`${activity.category}/${activity.slug}`} title={activity.name} media={gallery} fallbackSrc={getActivityCatalogImage(activity.category, activity.slug) ?? undefined} />

        {/* CABECERA: título, descripción comercial breve y datos clave justo tras la galería */}
        <div className="container mx-auto px-4">
          <header className="border-b border-border py-8 lg:py-10">
            <Link to="/actividades" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
            <Badge className="mb-3 border-primary/40 bg-primary/15 text-primary">{activity.categoryLabel}</Badge>
            <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-5xl [overflow-wrap:anywhere]">{activity.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{headerDescription}</p>
            <ul className="mt-6 flex flex-wrap gap-3 text-sm">
              <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4"><MapPin className="h-4 w-4 text-primary" />{activity.zone}, {activity.province}</li>
              <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4"><Mountain className="h-4 w-4 text-primary" />{activity.technicalLevel}</li>
              <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4"><Clock className="h-4 w-4 text-primary" />{activity.totalDuration}</li>
              <li className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 font-semibold text-primary"><Users className="h-4 w-4" />Máximo 6 participantes</li>
            </ul>
            {activity.category === 'vias-ferratas' && activity.slug === 'ferrata-el-chorro' && (
              <p role="note" data-testid="caminito-note" className="mt-5 rounded-md border border-primary/40 bg-primary/10 p-4 text-sm font-semibold leading-6 text-foreground">
                Actividad distinta del Caminito del Rey. No incluye su entrada; el Caminito es un sendero de pasarelas, no una vía ferrata.
              </p>
            )}
          </header>
        </div>

        <div className="container mx-auto grid min-w-0 gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-12">
          <article className="min-w-0 space-y-12">
            {/* BENEFICIOS: cuatro tarjetas compactas específicas de la actividad */}
            <section aria-labelledby="destacados">
              <h2 id="destacados" className="mb-4 font-heading text-2xl font-bold">Lo más destacado</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {activity.highlights.slice(0, 4).map((item, i) => { const Icon = highlightIcons[i % 4]; return (
                  <li key={item} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold leading-snug">{item}</span>
                  </li>); })}
              </ul>
            </section>

            {/* ITINERARIO visual de 3-5 pasos */}
            <section aria-labelledby="itinerario">
              <h2 id="itinerario" className="mb-5 font-heading text-2xl font-bold">Cómo será la actividad</h2>
              <ol className="relative space-y-5 border-l-2 border-primary/30 pl-6">
                {itinerary.map((step, i) => (
                  <li key={step} className="relative">
                    <span className="absolute -left-[35px] flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                    <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* QUÉ INCLUYE / QUÉ LLEVAR en dos columnas */}
            <section aria-labelledby="incluye-llevar" className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 id="incluye-llevar" className="mb-4 font-heading text-xl font-bold">Qué incluye</h2>
                {list(activity.included)}
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="mb-4 font-heading text-xl font-bold">Qué llevar</h2>
                {list(activity.bring)}
              </div>
            </section>

            {/* TABLA TÉCNICA compacta */}
            <section aria-labelledby="ficha-tecnica">
              <h2 id="ficha-tecnica" className="mb-4 font-heading text-2xl font-bold">Ficha técnica</h2>
              <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {technicalRows.map(([label, value]) => (
                  <div key={label} className="bg-card p-3">
                    <dt className="text-xs font-semibold text-foreground">{label}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">{value}</dd>
                  </div>
                ))}
              </dl>
              {activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline">Fuente técnica <ExternalLink className="h-4 w-4" /></a>}
            </section>

            {/* TU GUÍA Y SEGURIDAD: solo credenciales y requisitos presentes en los datos */}
            <section aria-labelledby="guia-seguridad" className="rounded-lg border border-primary/30 bg-primary/5 p-5 sm:p-6">
              <h2 id="guia-seguridad" className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold"><ShieldCheck className="h-6 w-6 text-primary" /> Tu guía y la seguridad</h2>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                {([['Edad mínima', activity.minimumAge], ['Nivel físico', activity.physicalLevel], ['Experiencia previa', activity.previousExperience]] as [string, string][]).filter(([, v]) => v?.trim()).map(([l, v]) => (
                  <div key={l}><dt className="text-xs text-muted-foreground">{l}</dt><dd className="mt-1 font-semibold">{v}</dd></div>
                ))}
              </dl>
              {activity.guideRatio?.trim() && <p className="mt-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Ratio guía-participantes: </span>{activity.guideRatio}</p>}
              {activity.insurancePermits.length > 0 && <p className="mt-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Seguros y permisos: </span>{activity.insurancePermits.join(' · ')}</p>}
              {extraSafety.length > 0 && <div className="mt-4">{list(extraSafety, AlertTriangle)}</div>}
            </section>

            {/* FAQs y condiciones en acordeones */}
            <section aria-label="Preguntas frecuentes y condiciones">
              <Accordion type="multiple" className="border-t border-border">
                <AccordionItem value="condiciones">
                  <AccordionTrigger className={trigger}>Condiciones</AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                    {activity.weatherPolicy && <p><span className="font-semibold text-foreground">Meteorología: </span>{summarize(activity.weatherPolicy, 1)}</p>}
                    {activity.cancellationPolicy && <p><span className="font-semibold text-foreground">Cancelación: </span>{summarize(activity.cancellationPolicy, 1)}</p>}
                    <p><span className="font-semibold text-foreground">Reserva: </span>señal del 30 % para confirmar la plaza.</p>
                  </AccordionContent>
                </AccordionItem>
                {activity.localSeoSections.length > 0 && (
                  <AccordionItem value="zona">
                    <AccordionTrigger className={trigger}>Sobre la zona y la actividad</AccordionTrigger>
                    <AccordionContent className="space-y-5 text-sm leading-7 text-muted-foreground">
                      {activity.localSeoSections.map((section) => <div key={section.heading}><h3 className="mb-2 font-semibold text-foreground">{section.heading}</h3>{section.paragraphs[0] && <p>{summarize(section.paragraphs[0], 2, 280)}</p>}</div>)}
                    </AccordionContent>
                  </AccordionItem>
                )}
                <AccordionItem value="faq">
                  <AccordionTrigger className={trigger}>Preguntas frecuentes</AccordionTrigger>
                  <AccordionContent className="space-y-4">{faqs.map((faq) => <div key={faq.question}><h3 className="font-semibold">{faq.question}</h3><p className="mt-1 text-sm leading-7 text-muted-foreground">{summarize(faq.answer, 2, 240)}</p></div>)}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section><h2 className="mb-5 font-heading text-2xl font-bold">Actividades relacionadas</h2><div className="grid gap-4 sm:grid-cols-3">{related.map((item) => <Link key={item.id} to={`/actividades/${item.category}/${item.slug}`} className="group overflow-hidden rounded-lg border border-border bg-card"><img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" className="aspect-video w-full object-cover" /><div className="p-4"><p className="text-xs text-primary">{item.categoryLabel} · {item.zone}</p><h3 className="mt-1 text-base group-hover:text-primary [overflow-wrap:anywhere]">{item.name}</h3></div></Link>)}</div></section>
          </article>

          {/* RESERVA: panel lateral sticky con precio, fechas y plazas reales */}
          <aside className="hidden min-w-0 lg:sticky lg:top-32 lg:block lg:self-start">
            <ActivityBookingPanel category={activity.category} slug={activity.slug} price={activity.price} priceValue={numericPrice} whatsappUrl={consultUrl} />
          </aside>
        </div>
      </main>
      <Footer />
      {numericPrice && <MobileBookingBar price={activity.price} category={activity.category} slug={activity.slug} />}
      <div className="hidden lg:block"><WhatsAppButton /></div><ScrollToTop />
    </div>
  );
}
