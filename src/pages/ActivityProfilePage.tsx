import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, CalendarDays, Check, Clock, ExternalLink, MapPin, MessageCircle, Mountain, ShieldCheck, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getActivityProfile, getRelatedProfiles } from '@/data/activityProfiles';
import { TrustBar } from '@/components/TrustBar';
import { SITE_URL } from '@/lib/site';
import { MobileBookingBar } from '@/components/actividades/MobileBookingBar';
import { ActivityUpcomingEvents } from '@/components/actividades/ActivityUpcomingEvents';


function shorten(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export default function ActivityProfilePage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const activity = getActivityProfile(category, slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: activity.name,
      description: metaDescription,
      category: activity.categoryLabel,
      image: activity.image.startsWith('http') ? activity.image : undefined,
      url: canonical,
      brand: { '@type': 'Brand', name: 'Naturaleza Sin Límites' },
      ...(numericPrice ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: numericPrice, availability: 'https://schema.org/LimitedAvailability', url: canonical } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: activity.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: 'Naturaleza Sin Límites',
      areaServed: `${activity.province}, Andalucía`,
      telephone: '+34685609542',
      email: 'naturaleza.s.limites@gmail.com',
      url: SITE_URL,
    },
  ];

  const summary = [
    { icon: CalendarDays, label: 'Precio desde', value: activity.price },
    { icon: Clock, label: 'Duración', value: activity.totalDuration },
    { icon: Mountain, label: 'Dificultad', value: activity.technicalLevel },
    { icon: Users, label: 'Grupo', value: 'Máx. 6 personas' },
    { icon: MapPin, label: 'Ubicación', value: `${activity.zone}, ${activity.province}` },
    { icon: CalendarDays, label: 'Modalidad', value: 'Salida bajo petición' },
  ];
  const technicalRows = ([
    ['Nombre comercial', activity.name], ['Tipo de actividad', activity.type], ['Ubicación', `${activity.zone}, ${activity.province}`],
    ['Precio desde', activity.price], ['Duración total', activity.totalDuration], ['Duración efectiva', activity.effectiveDuration],
    ['Nivel técnico', activity.technicalLevel], ['Nivel físico', activity.physicalLevel], ['Edad mínima', activity.minimumAge],
    ['Temporada', activity.season], ['Grupo mínimo/máximo', activity.group], ['Ratio guía-participantes', activity.guideRatio],
    ['Aproximación y retorno', activity.approachReturn], ['Elementos técnicos', activity.technicalElements.join(', ')],
    ['Experiencia previa', activity.previousExperience], ['Punto de encuentro', activity.meetingPoint],
    ['Política meteorológica', activity.weatherPolicy], ['Política de cancelación', activity.cancellationPolicy],
  ] as [string, string][]).filter(([, value]) => Boolean(value && value.trim()));


  return (
    <div className="min-h-screen bg-background pb-20 text-foreground lg:pb-0">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        {structuredData.map((data, index) => <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>)}
      </Helmet>
      <Navbar />
      <main>
        <section className="relative flex min-h-[620px] items-end overflow-hidden pt-44 sm:pt-48 lg:min-h-[72vh] lg:pt-40">
          <img src={activity.image} alt={activity.imageAlt} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/25" />
          <div className="container relative z-10 mx-auto px-4 pb-10 sm:pb-14">
            <Link to="/actividades" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-foreground/80 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
            <Badge className="mb-4 border-primary/40 bg-primary/15 text-primary">{activity.categoryLabel}</Badge>
            <h1 className="max-w-4xl text-3xl font-heading font-extrabold leading-tight sm:text-5xl lg:text-6xl [overflow-wrap:anywhere]">{activity.name} en {activity.zone}</h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/85 sm:text-xl">Una experiencia guiada para conocer {activity.zone} con un recorrido adaptado al nivel y a las condiciones del día.</p>
            {activity.priceValue && <div className="mt-7 flex flex-col gap-4 border-l-2 border-primary pl-4 sm:flex-row sm:items-center sm:gap-6"><div><p className="text-xs uppercase text-foreground/70">Desde</p><p className="text-3xl font-extrabold text-primary">{activity.price} <span className="text-sm text-foreground/70">/ persona</span></p></div><Button variant="hero" size="default" className="min-h-12 self-start" asChild><Link to={`/reservar/${activity.category}/${activity.slug}`}>Reservar y pagar señal</Link></Button></div>}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="container mx-auto grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
            {summary.map(({ icon: Icon, label, value }) => (
              <div key={label} className="min-w-0 bg-card p-4 sm:p-5">
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold [overflow-wrap:anywhere]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <TrustBar />

        <ActivityUpcomingEvents category={activity.category} slug={activity.slug} />



        <div className="container mx-auto grid min-w-0 gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-16">
          <article className="min-w-0 space-y-14">
            <section aria-labelledby="descripcion"><h2 id="descripcion" className="mb-5 text-2xl sm:text-3xl">La experiencia</h2><p className="leading-8 text-muted-foreground">{activity.commercialDescription}</p></section>

            <section aria-labelledby="destacados"><h2 id="destacados" className="mb-5 text-2xl sm:text-3xl">Lo más destacado</h2><ul className="grid gap-3 sm:grid-cols-2">{activity.highlights.map((item) => <li key={item} className="flex gap-3 border-b border-border py-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>{item}</span></li>)}</ul></section>

            <section className="grid gap-8 md:grid-cols-2">
              <div><h2 className="mb-4 flex items-center gap-2 text-2xl"><ShieldCheck className="h-6 w-6 text-primary" /> Seguridad y requisitos</h2><ul className="space-y-3 text-muted-foreground">{activity.safetyRequirements.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></li>)}</ul></div>
              <div><h2 className="mb-4 text-2xl">Qué incluye</h2><ul className="space-y-3 text-muted-foreground">{activity.included.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul><h3 className="mb-3 mt-8 text-xl">Qué debes traer</h3><ul className="space-y-3 text-muted-foreground">{activity.bring.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </section>

            <section><h2 className="mb-4 text-2xl">Punto de encuentro</h2><p className="border-l-2 border-primary pl-4 text-muted-foreground">{activity.meetingPoint}</p></section>

            <section><h2 className="mb-6 text-2xl sm:text-3xl">Cómo será la actividad</h2><ol className="space-y-5">{activity.itinerary.map((step, index) => <li key={step} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{index + 1}</span><p className="pt-1 text-muted-foreground">{step}</p></li>)}</ol></section>

            <section><h2 className="mb-5 text-2xl sm:text-3xl">Ficha técnica</h2><div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[520px] text-left text-sm"><tbody>{technicalRows.map(([label, value], index) => <tr key={label} className={index % 2 ? 'bg-muted/20' : 'bg-card'}><th scope="row" className="w-2/5 px-4 py-3 font-semibold text-foreground">{label}</th><td className="px-4 py-3 text-muted-foreground [overflow-wrap:anywhere]">{value}</td></tr>)}</tbody></table></div>{activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">Consultar {activity.sourceLabel}<ExternalLink className="h-4 w-4" /></a>}<p className="mt-3 text-xs text-muted-foreground">La fuente técnica describe el recorrido; los servicios comerciales deben confirmarse directamente con Naturaleza Sin Límites.</p></section>

            <section><h2 className="mb-5 text-2xl sm:text-3xl">Preguntas frecuentes</h2><Accordion type="single" collapsible className="border-t border-border">{activity.faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="min-h-14 text-left">{faq.question}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></section>

            <section className="space-y-10 border-t border-border pt-12">
              {activity.localSeoSections.map((section, index) => <div key={section.heading}><h2 className="mb-5 text-2xl sm:text-3xl">{section.heading}</h2>{index === 0 && <h3 className="mb-3 text-lg text-primary">Información útil antes de elegir fecha</h3>}<div className="space-y-5 text-base leading-8 text-muted-foreground">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>)}
            </section>

            <section><h2 className="mb-5 text-2xl sm:text-3xl">Actividades relacionadas</h2><div className="grid gap-4 sm:grid-cols-3">{related.map((item) => <Link key={item.id} to={`/actividades/${item.category}/${item.slug}`} className="group overflow-hidden rounded-lg border border-border bg-card"><img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" className="aspect-video w-full object-cover" /><div className="p-4"><p className="text-xs text-primary">{item.categoryLabel} · {item.zone}</p><h3 className="mt-1 text-base group-hover:text-primary [overflow-wrap:anywhere]">{item.name}</h3></div></Link>)}</div></section>
          </article>

          <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <p className="text-sm text-muted-foreground">Desde</p><p className="mt-1 text-3xl font-bold text-primary">{activity.price}</p>
               <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Salidas bajo petición</p>
               <p className="mt-2 text-sm text-muted-foreground">Confirma fecha, servicios y requisitos antes de reservar.</p>
              <div className="mt-6 space-y-3">
                {activity.priceValue ? (
                  <>
                    <Button variant="hero" size="lg" className="min-h-12 w-full gap-2" asChild><Link to={`/reservar/${activity.category}/${activity.slug}`}>Reservar y pagar señal</Link></Button>
                    <p className="text-center text-xs text-muted-foreground">Confirmas tu plaza pagando el 30% ahora; el resto, el día de la actividad.</p>
                  </>
                ) : null}
                <Button variant="outline" size="lg" className="min-h-12 w-full gap-2" asChild><a href={openGroupUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" /> Consultar grupo abierto</a></Button>
                <Button variant="outline" size="lg" className="min-h-12 w-full gap-2" asChild><a href={privateUrl} target="_blank" rel="noopener noreferrer"><Users className="h-5 w-5" /> Solicitar salida privada</a></Button>
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <TrustBar variant="compact" />
              </div>

            </div>
          </aside>
        </div>
      </main>
      <Footer />
      {activity.priceValue && <MobileBookingBar price={activity.price} category={activity.category} slug={activity.slug} />}
      <div className="hidden lg:block"><WhatsAppButton /></div>
      <ScrollToTop />
    </div>
  );
}