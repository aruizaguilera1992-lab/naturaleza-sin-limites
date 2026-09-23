import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, CalendarDays, Check, Clock, ExternalLink, Gauge, MapPin, MessageCircle, Mountain, ShieldCheck, Sparkles, Sun, UserRound, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getActivityProfile, getRelatedProfiles } from '@/data/activityProfiles';
import { getActivityMedia, getActivityMediaCollection } from '@/data/activityMedia';
import { TrustBar } from '@/components/TrustBar';
import { SITE_URL } from '@/lib/site';
import { MobileBookingBar } from '@/components/actividades/MobileBookingBar';
import { ActivityUpcomingEvents } from '@/components/actividades/ActivityUpcomingEvents';
import { ActivityMediaGallery } from '@/components/ActivityMediaGallery';

function shorten(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

export default function ActivityProfilePage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const activity = getActivityProfile(category, slug);

  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [category, slug]);
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

  const quickMetrics = [
    { icon: Clock, label: 'Duración', value: activity.totalDuration },
    { icon: Mountain, label: 'Nivel', value: activity.technicalLevel },
    { icon: Users, label: 'Grupo', value: 'Máx. 6' },
    { icon: UserRound, label: 'Edad mínima', value: activity.minimumAge },
    { icon: Sun, label: 'Temporada', value: activity.season },
  ];
  const technicalCards = [
    { icon: CalendarDays, label: 'Precio desde', value: activity.price },
    { icon: Clock, label: 'Duración', value: activity.totalDuration },
    { icon: Mountain, label: 'Nivel técnico', value: activity.technicalLevel },
    { icon: Gauge, label: 'Nivel físico', value: activity.physicalLevel },
    { icon: UserRound, label: 'Edad mínima', value: activity.minimumAge },
    { icon: Users, label: 'Grupo', value: activity.group },
    { icon: Sun, label: 'Temporada', value: activity.season },
    { icon: MapPin, label: 'Ubicación', value: `${activity.zone}, ${activity.province}` },
    { icon: ArrowLeft, label: 'Aproximación / retorno', value: activity.approachReturn },
    { icon: Sparkles, label: 'Experiencia previa', value: activity.previousExperience },
  ];
  const technicalRows = ([
    ['Nombre comercial', activity.name], ['Tipo de actividad', activity.type], ['Ubicación', `${activity.zone}, ${activity.province}`], ['Precio desde', activity.price], ['Duración total', activity.totalDuration], ['Duración efectiva', activity.effectiveDuration], ['Nivel técnico', activity.technicalLevel], ['Nivel físico', activity.physicalLevel], ['Edad mínima', activity.minimumAge], ['Temporada', activity.season], ['Grupo mínimo/máximo', activity.group], ['Ratio guía-participantes', activity.guideRatio], ['Aproximación y retorno', activity.approachReturn], ['Elementos técnicos', activity.technicalElements.join(', ')], ['Experiencia previa', activity.previousExperience], ['Zona de encuentro', activity.meetingPoint], ['Política meteorológica', activity.weatherPolicy], ['Política de cancelación', activity.cancellationPolicy],
  ] as [string, string][]).filter(([, value]) => Boolean(value?.trim()));

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground lg:pb-0">
      <Helmet>
        <title>{metaTitle}</title><meta name="description" content={metaDescription} /><link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} /><meta property="og:description" content={metaDescription} /><meta property="og:type" content="website" /><meta property="og:url" content={canonical} /><meta name="twitter:card" content="summary_large_image" />
        {structuredData.map((data, index) => <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>)}
      </Helmet>
      <Navbar />
      <main>
        <section className="relative flex min-h-[580px] items-end overflow-hidden pt-44 sm:pt-48 lg:min-h-[70vh] lg:pt-40">
          <img src={activity.image} alt={activity.imageAlt} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/20" />
          <div className="container relative z-10 mx-auto px-4 pb-10 sm:pb-14">
            <Link to="/actividades" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-foreground/80 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
            <div className="mb-4 flex flex-wrap items-center gap-2"><Badge className="border-primary/40 bg-primary/15 text-primary">{activity.categoryLabel}</Badge><span className="inline-flex items-center gap-1 text-sm text-foreground/80"><MapPin className="h-4 w-4" />{activity.zone}, {activity.province}</span></div>
            <h1 className="max-w-4xl font-heading text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl [overflow-wrap:anywhere]">{activity.name}</h1>
            {activity.priceValue && <div className="mt-7 flex flex-col gap-4 border-l-2 border-primary pl-4 sm:flex-row sm:items-center sm:gap-6"><div><p className="text-xs uppercase text-foreground/70">Desde</p><p className="text-3xl font-extrabold text-primary">{activity.price} <span className="text-sm text-foreground/70">/ persona</span></p></div><Button variant="hero" className="min-h-12 self-start" asChild><Link to={`/reservar/${activity.category}/${activity.slug}`}>Reservar</Link></Button></div>}
          </div>
        </section>

        <section className="border-y border-border bg-card" aria-label="Datos rápidos">
          <div className="container mx-auto grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5">
            {quickMetrics.map(({ icon: Icon, label, value }) => <div key={label} className="min-w-0 bg-card p-4 sm:p-5"><Icon className="mb-2 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold [overflow-wrap:anywhere]">{value}</p></div>)}
          </div>
        </section>
        <TrustBar />
        <ActivityUpcomingEvents category={activity.category} slug={activity.slug} />

        <div className="container mx-auto grid min-w-0 gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-16">
          <article className="min-w-0 space-y-12">
            <ActivityMediaGallery title={activity.name} media={gallery} />

            <section aria-labelledby="descripcion"><h2 id="descripcion" className="mb-4 font-heading text-2xl font-bold">La experiencia</h2><p className="line-clamp-3 leading-7 text-muted-foreground">{activity.shortDescription}</p><Accordion type="single" collapsible><AccordionItem value="experiencia"><AccordionTrigger className="justify-start gap-2 py-3 text-sm text-primary">Ver más</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{activity.commercialDescription}</AccordionContent></AccordionItem></Accordion></section>

            <section aria-labelledby="destacados"><h2 id="destacados" className="mb-4 font-heading text-2xl font-bold">Lo más destacado</h2><ul className="flex flex-wrap gap-2">{activity.highlights.slice(0, 4).map((item) => <li key={item} className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></section>

            <section aria-labelledby="ficha-tecnica"><h2 id="ficha-tecnica" className="mb-5 font-heading text-2xl font-bold">Ficha técnica</h2><div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">{technicalCards.map(({ icon: Icon, label, value }) => <div key={label} className="min-w-0 bg-card p-4"><Icon className="mb-2 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold [overflow-wrap:anywhere]">{value}</p></div>)}</div><Accordion type="single" collapsible className="mt-3"><AccordionItem value="completa"><AccordionTrigger>Ver ficha técnica completa</AccordionTrigger><AccordionContent><dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">{technicalRows.map(([label, value]) => <div key={label} className="bg-card p-3"><dt className="text-xs font-semibold text-foreground">{label}</dt><dd className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">{value}</dd></div>)}</dl>{activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">Fuente técnica <ExternalLink className="h-4 w-4" /></a>}</AccordionContent></AccordionItem></Accordion></section>

            <section aria-labelledby="preparacion"><h2 id="preparacion" className="mb-5 font-heading text-2xl font-bold">Preparación</h2><Tabs defaultValue="seguridad"><TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="seguridad" className="whitespace-normal">Seguridad</TabsTrigger><TabsTrigger value="incluye" className="whitespace-normal">Incluye</TabsTrigger><TabsTrigger value="llevar" className="whitespace-normal">Qué llevar</TabsTrigger></TabsList><TabsContent value="seguridad" className="pt-4"><ul className="space-y-3 text-sm text-muted-foreground">{activity.safetyRequirements.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></TabsContent><TabsContent value="incluye" className="pt-4"><ul className="space-y-3 text-sm text-muted-foreground">{activity.included.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></TabsContent><TabsContent value="llevar" className="pt-4"><ul className="space-y-3 text-sm text-muted-foreground">{activity.bring.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></TabsContent></Tabs></section>

            <section><h2 className="mb-6 font-heading text-2xl font-bold">Cómo será la actividad</h2><ol className="relative space-y-0 border-l border-border pl-6">{activity.itinerary.map((step, index) => <li key={step} className="relative pb-6"><span className="absolute -left-[2.15rem] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><p className="text-sm leading-6 text-muted-foreground">{step}</p></li>)}</ol></section>

            <section><h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold"><MapPin className="h-5 w-5 text-primary" /> Zona de encuentro</h2><p className="border-l-2 border-primary pl-4 text-sm leading-7 text-muted-foreground">{activity.meetingPoint}</p></section>

            <section><h2 className="mb-4 font-heading text-2xl font-bold">Preguntas frecuentes</h2><Accordion type="single" collapsible className="border-t border-border">{activity.faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="min-h-14 text-left">{faq.question}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></section>

            <section><Accordion type="single" collapsible className="border-y border-border"><AccordionItem value="zona" className="border-0"><AccordionTrigger className="font-heading text-xl">Información de la zona</AccordionTrigger><AccordionContent className="space-y-8">{activity.localSeoSections.map((section) => <div key={section.heading}><h2 className="mb-3 text-lg font-semibold">{section.heading}</h2><div className="space-y-4 leading-7 text-muted-foreground">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>)}</AccordionContent></AccordionItem></Accordion></section>

            <section><h2 className="mb-5 font-heading text-2xl font-bold">Actividades relacionadas</h2><div className="grid gap-4 sm:grid-cols-3">{related.map((item) => <Link key={item.id} to={`/actividades/${item.category}/${item.slug}`} className="group overflow-hidden rounded-md border border-border bg-card"><img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" className="aspect-video w-full object-cover" /><div className="p-4"><p className="text-xs text-primary">{item.categoryLabel} · {item.zone}</p><h3 className="mt-1 text-base group-hover:text-primary [overflow-wrap:anywhere]">{item.name}</h3></div></Link>)}</div></section>

            {activity.priceValue && <section className="border-y border-border py-8 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-primary" /><h2 className="mt-3 font-heading text-2xl font-bold">¿Preparado para salir?</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Grupo reducido y señal del 30% para confirmar tu plaza.</p><Button variant="hero" className="mt-5" asChild><Link to={`/reservar/${activity.category}/${activity.slug}`}>Reservar {activity.name}</Link></Button></section>}
          </article>

          <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start"><div className="rounded-md border border-border bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">Desde</p><p className="mt-1 text-3xl font-bold text-primary">{activity.price}</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-primary" /> Grupos de máximo 6</p><div className="mt-6 space-y-3">{activity.priceValue && <Button variant="hero" size="lg" className="min-h-12 w-full" asChild><Link to={`/reservar/${activity.category}/${activity.slug}`}>Reservar y pagar señal</Link></Button>}<Button variant="outline" size="lg" className="min-h-12 w-full" asChild><a href={openGroupUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-5 w-5" /> Consultar grupo</a></Button><Button variant="outline" size="lg" className="min-h-12 w-full" asChild><a href={privateUrl} target="_blank" rel="noopener noreferrer"><Users className="mr-2 h-5 w-5" /> Salida privada</a></Button></div><div className="mt-5 border-t border-border pt-4"><TrustBar variant="compact" /></div></div></aside>
        </div>
      </main>
      <Footer />
      {activity.priceValue && <MobileBookingBar price={activity.price} category={activity.category} slug={activity.slug} />}
      <div className="hidden lg:block"><WhatsAppButton /></div><ScrollToTop />
    </div>
  );
}
