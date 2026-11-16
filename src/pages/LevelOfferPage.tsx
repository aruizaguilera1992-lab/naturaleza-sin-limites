import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MessageCircle, Mountain, Users } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { levelOfferExplanation, levelOfferPhotos, levelOffers, levelOfferWhatsapp } from '@/data/levelOffers';

/** Ficha propia de un nivel: explica en qué consiste, sin repetir la página de disciplina. */
export default function LevelOfferPage() {
  const { id } = useParams();
  const o = levelOffers.find((x) => x.id === id);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);
  if (!o) return <Navigate to="/actividades" replace />;
  const ex = levelOfferExplanation[o.id];
  const photo = levelOfferPhotos[o.id];
  const back = o.discipline === 'ferratas' ? { to: '/vias-ferratas', label: 'Vías ferratas' } : { to: '/barranquismo', label: 'Barranquismo' };
  const interes = o.discipline === 'ferratas' ? 'vias-ferratas' : 'barranquismo';
  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${o.nombre} (${o.grado}) | Naturaleza Sin Límites`} description={o.descripcionCorta} path={`/niveles/${o.id}`} />
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 pt-44 sm:pt-48 md:pt-32 lg:pt-40 pb-16">
        <Link to={back.to} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />{back.label}</Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[1, 2, 3].map((n) => <Mountain key={n} className={n <= o.orden ? 'h-6 w-6 text-primary' : 'h-6 w-6 text-muted-foreground/30'} />)}
          <Badge className="border-primary/40 bg-primary/15 text-primary">Nivel {o.orden} · {o.nivel}</Badge>
          <Badge variant="outline">{o.grado}</Badge>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-foreground">{o.nombre}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{o.descripcionCorta}</p>
        {photo && (
          <figure className="mt-6 overflow-hidden rounded-xl border border-border">
            <img src={photo.src} alt={photo.alt} className="h-64 sm:h-80 w-full object-cover" />
            <figcaption className="px-3 py-2 text-xs text-muted-foreground">Foto ilustrativa: <a href={photo.fuente} target="_blank" rel="noopener noreferrer" className="underline">{photo.autor}</a>, {photo.licencia}</figcaption>
          </figure>
        )}
        <section className="mt-8">
          <h2 className="text-2xl font-heading font-bold text-foreground">¿En qué consiste este nivel?</h2>
          {ex?.consiste.map((p) => <p key={p} className="mt-3 text-muted-foreground">{p}</p>)}
          {ex && <p className="mt-4 rounded-lg border border-border bg-card p-4 text-foreground"><span className="font-semibold text-primary">Para quién: </span>{ex.paraQuien}</p>}
        </section>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading font-bold text-foreground">Características</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">{o.caracteristicas.map((c) => <li key={c} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{c}</li>)}</ul>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 text-primary" />Edad mínima {o.edadMinima} años · condición física {o.condicionFisica.toLowerCase()}</p>
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading font-bold text-foreground">Incluye</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">{o.incluye.map((c) => <li key={c} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{c}</li>)}</ul>
          </section>
        </div>
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          {o.precioDesde ? <p className="text-muted-foreground">Desde <span className="text-2xl font-extrabold text-primary">{o.precioDesde} €</span> / persona</p> : <p className="text-lg font-bold text-primary">Precio a consultar</p>}
          <p className="mt-1 text-sm text-muted-foreground">El recorrido concreto se elige contigo según el nivel del grupo, la época y las condiciones.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="hero" className="min-h-11" asChild><Link to={`/contacto?interes=${interes}`}>Reservar o consultar</Link></Button>
            <Button variant="outline" className="min-h-11" asChild><a href={levelOfferWhatsapp(o)} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</a></Button>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
