import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, CalendarDays, Check, Clock, ExternalLink, MapPin, MessageCircle, Mountain, ShieldCheck, Sparkles, Sun, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getActivityCatalogImage, getActivityProfile, getRelatedProfiles } from '@/data/activityProfiles';
import { getActivityMedia, getActivityMediaCollection } from '@/data/activityMedia';
import { SITE_URL } from '@/lib/site';
import { MobileBookingBar } from '@/components/actividades/MobileBookingBar';
import { ActivityNextDates } from '@/components/actividades/ActivityNextDates';
import { ActivityHeroCarousel } from '@/components/actividades/ActivityHeroCarousel';

function shorten(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

function summarize(value: string, sentences = 2, max = 260) {
  const parts = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  let out = parts.slice(0, sentences).join(' ').trim() || value;
  if (out.length > max) out = `${out.slice(0, max - 1).trimEnd()}…`;
  return out;
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
  const openGroupUrl = `${whatsappBase}${encodeURIComponent(`Hola, quiero consultar una plaza en grupo abierto para ${activity.name}, en ${activity.zone}.`)}`;
  const privateUrl = `${whatsappBase}${encodeURIComponent(`Hola, quiero solicitar una salida privada de ${activity.name}, en ${activity.zone}.`)}`;
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

  const bookingUrl = `/reservar/${activity.category}/${activity.slug}`;
  const highlightIcons = [Sparkles, Mountain, Users, Sun];
  const technicalRows = ([
    ['Tipo de actividad', activity.type], ['Duración total', activity.totalDuration], ['Duración efectiva', activity.effectiveDuration], ['Nivel técnico', activity.technicalLevel], ['Nivel físico', activity.physicalLevel], ['Temporada', activity.season], ['Grupo mínimo/máximo', activity.group], ['Ratio guía-participantes', activity.guideRatio], ['Aproximación y retorno', activity.approachReturn], ['Elementos técnicos', activity.technicalElements.join(', ')], ['Zona de encuentro', activity.meetingPoint],
  ] as [string, string][]).filter(([, value]) => Boolean(value?.trim()));
  const list = (items: string[], Icon = Check, compact = false) => <ul className={compact ? 'grid gap-2 text-sm text-muted-foreground sm:grid-cols-2' : 'space-y-3 text-sm text-muted-foreground'}>{items.map((item) => <li key={item} className="flex gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul>;
  const extraSafety = activity.safetyRequirements.filter((item) =>
    !['Edad mínima', 'Nivel físico', 'Experiencia previa'].some((l) => item.startsWith(`${l}:`)) &&
    !/^(Seguro y acreditación profesional|Permisos y regulación):/i.test(item) &&
    !/^La salida queda condicionada a la meteorología/i.test(item),
  );
  const visibleFaqs = activity.faqs.filter((faq) => /^(¿Dónde se realiza|¿Cuánto dura|¿Necesito experiencia|¿Qué edad mínima|¿Qué ocurre si cambia el tiempo)/.test(faq.question));
  const faqs = visibleFaqs.length > 0 ? visibleFaqs : activity.faqs.slice(0, 5);
  const trigger = 'min-h-14 font-heading text-lg text-left';

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground lg:pb-0">
      <Helmet>
        <title>{metaTitle}</title><meta name="description" content={metaDescription} /><link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} /><meta property="og:description" content={metaDescription} /><meta property="og:type" content="website" /><meta property="og:url" content={canonical} /><meta name="twitter:card" content="summary_large_image" />
        {structuredData.map((data, index) => <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>)}
      </Helmet>
      <Navbar />
      <main className="pt-28 sm:pt-32">
        <ActivityHeroCarousel title={activity.name} media={gallery} fallbackSrc={getActivityCatalogImage(activity.category, activity.slug) ?? undefined} />

        <div className="container mx-auto grid min-w-0 gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-12">
          <article className="min-w-0 space-y-10">
            <header>
              <Link to="/actividades" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
              <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-5xl [overflow-wrap:anywhere]">{activity.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <Badge className="border-primary/40 bg-primary/15 text-primary">{activity.categoryLabel}</Badge>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-foreground/90"><Mountain className="h-4 w-4 text-primary" />{activity.technicalLevel}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-foreground/90"><MapPin className="h-4 w-4 text-primary" />{activity.zone}, {activity.province}</span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-l-2 border-primary pl-4">
                <span className="inline-flex items-center gap-2 text-sm"><Clock className="h-5 w-5 text-primary" />{activity.totalDuration}</span>
                <span className="inline-flex items-center gap-2 text-sm"><Users className="h-5 w-5 text-primary" />Grupos reducidos</span>
                <span className="text-2xl font-extrabold text-primary">{numericPrice ? <>{activity.price} <span className="text-sm font-normal text-muted-foreground">/ persona</span></> : <span className="text-lg">Precio a consultar</span>}</span>
              </div>
            </header>

            <section aria-labelledby="destacados">
              <h2 id="destacados" className="mb-4 font-heading text-2xl font-bold">Lo más destacado</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {activity.highlights.slice(0, 4).map((item, i) => { const Icon = highlightIcons[i % 4]; return (
                  <li key={item} className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold leading-snug">{item}</span>
                  </li>); })}
              </ul>
            </section>

            <ActivityNextDates category={activity.category} slug={activity.slug} />

            <div className="flex flex-col gap-3 sm:flex-row">
              {numericPrice ? <Button variant="hero" size="lg" className="min-h-14 text-lg" asChild><Link to={bookingUrl}>Reservar plaza</Link></Button>
                : <Button variant="hero" size="lg" className="min-h-14 text-lg" asChild><a href={openGroupUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-5 w-5" />Consultar</a></Button>}
              <Button variant="outline" size="lg" className="min-h-14" asChild><Link to="/calendario"><CalendarDays className="mr-2 h-5 w-5" />Ver todas las fechas</Link></Button>
            </div>

            <section aria-label="Información de la actividad">
              <Accordion type="multiple" className="border-t border-border">
                <AccordionItem value="detalles">
                  <AccordionTrigger className={trigger}>Más detalles</AccordionTrigger>
                  <AccordionContent className="space-y-6 text-muted-foreground">
                    <p className="leading-7">{activity.shortDescription}</p>
                    <div><h3 className="mb-3 font-semibold text-foreground">Cómo será la actividad</h3><ol className="space-y-2 text-sm">{activity.itinerary.map((step, i) => <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>{step}</li>)}</ol></div>
                    <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">{technicalRows.map(([label, value]) => <div key={label} className="bg-card p-3"><dt className="text-xs font-semibold text-foreground">{label}</dt><dd className="mt-1 text-sm [overflow-wrap:anywhere]">{value}</dd></div>)}</dl>
                    {activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">Fuente técnica <ExternalLink className="h-4 w-4" /></a>}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="incluye"><AccordionTrigger className={trigger}>Qué incluye</AccordionTrigger><AccordionContent>{list(activity.included)}</AccordionContent></AccordionItem>
                <AccordionItem value="llevar"><AccordionTrigger className={trigger}>Qué llevar</AccordionTrigger><AccordionContent>{list(activity.bring)}</AccordionContent></AccordionItem>
                <AccordionItem value="requisitos">
                  <AccordionTrigger className={trigger}>Requisitos</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <dl className="grid gap-3 text-sm sm:grid-cols-3">{([['Edad mínima', activity.minimumAge], ['Nivel físico', activity.physicalLevel], ['Experiencia previa', activity.previousExperience]] as [string, string][]).filter(([, v]) => v?.trim()).map(([l, v]) => <div key={l}><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                    {list(activity.safetyRequirements, AlertTriangle)}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="condiciones">
                  <AccordionTrigger className={trigger}>Condiciones</AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                    {activity.weatherPolicy && <div><h3 className="font-semibold text-foreground">Meteorología</h3><p>{activity.weatherPolicy}</p></div>}
                    {activity.cancellationPolicy && <div><h3 className="font-semibold text-foreground">Cancelación</h3><p>{activity.cancellationPolicy}</p></div>}
                    {activity.insurancePermits.length > 0 && <div><h3 className="font-semibold text-foreground">Seguros y permisos</h3>{list(activity.insurancePermits, ShieldCheck)}</div>}
                    <p>Señal del 30 % para confirmar la plaza.</p>
                  </AccordionContent>
                </AccordionItem>
                {activity.localSeoSections.length > 0 && (
                  <AccordionItem value="zona">
                    <AccordionTrigger className={trigger}>Sobre la zona y la actividad</AccordionTrigger>
                    <AccordionContent className="space-y-5 text-sm leading-7 text-muted-foreground">
                      {activity.commercialDescription && <p>{activity.commercialDescription}</p>}
                      {activity.localSeoSections.map((section) => <div key={section.heading}><h3 className="mb-2 font-semibold text-foreground">{section.heading}</h3><div className="space-y-3">{section.paragraphs.map((p) => <p key={p}>{p}</p>)}</div></div>)}
                    </AccordionContent>
                  </AccordionItem>
                )}
                <AccordionItem value="faq">
                  <AccordionTrigger className={trigger}>Preguntas frecuentes</AccordionTrigger>
                  <AccordionContent className="space-y-4">{activity.faqs.map((faq) => <div key={faq.question}><h3 className="font-semibold">{faq.question}</h3><p className="mt-1 text-sm leading-7 text-muted-foreground">{faq.answer}</p></div>)}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section><h2 className="mb-5 font-heading text-2xl font-bold">Actividades relacionadas</h2><div className="grid gap-4 sm:grid-cols-3">{related.map((item) => <Link key={item.id} to={`/actividades/${item.category}/${item.slug}`} className="group overflow-hidden rounded-md border border-border bg-card"><img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" className="aspect-video w-full object-cover" /><div className="p-4"><p className="text-xs text-primary">{item.categoryLabel} · {item.zone}</p><h3 className="mt-1 text-base group-hover:text-primary [overflow-wrap:anywhere]">{item.name}</h3></div></Link>)}</div></section>
          </article>

          <aside className="hidden min-w-0 lg:sticky lg:top-32 lg:block lg:self-start"><div className="rounded-md border border-border bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">Desde</p><p className="mt-1 text-3xl font-bold text-primary">{numericPrice ? activity.price : 'Precio a consultar'}</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" /> Grupos reducidos</p><div className="mt-6 space-y-3">{numericPrice && <Button variant="hero" size="lg" className="min-h-12 w-full" asChild><Link to={bookingUrl}>Reservar plaza</Link></Button>}<Button variant="outline" size="lg" className="min-h-12 w-full" asChild><Link to="/calendario"><CalendarDays className="mr-2 h-5 w-5" />Ver todas las fechas</Link></Button><Button variant="ghost" size="lg" className="min-h-12 w-full" asChild><a href={privateUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-5 w-5" /> Salida privada</a></Button></div></div></aside>
        </div>
      </main>
      <Footer />
      {numericPrice && <MobileBookingBar price={activity.price} category={activity.category} slug={activity.slug} />}
      <div className="hidden lg:block"><WhatsAppButton /></div><ScrollToTop />
    </div>
  );
}
