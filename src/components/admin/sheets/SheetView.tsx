import { CalendarDays, Check, Clock, MapPin, MessageCircle, Users, Backpack } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LevelVisualStrip } from '@/components/shared/LevelVisualStrip';
import { levelOfferPhotos } from '@/data/levelOffers';
import { STORAGE_PHOTO, sheetTotalEuros, type SheetContent } from '@/lib/activitySheets';
import { usePhotoUrls } from '@/lib/adminCatalog';

const DISC: Record<SheetContent['discipline'], string> = { barranquismo: 'Barranquismo', ferratas: 'Vía ferrata', espeleologia: 'Espeleología' };
const fmtDate = (d: string) => { try { return new Date(`${d}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; } };

function List({ title, icon: Icon, items }: { title: string; icon: typeof Check; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading font-bold text-foreground">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">{items.map((c) => <li key={c} className="flex gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{c}</li>)}</ul>
    </section>
  );
}

/** Ficha de actividad privada; se usa en la vista previa del panel y en el enlace del cliente. */
export function SheetView({ c, reference }: { c: SheetContent; reference?: string }) {
  const ownPath = c.photo?.startsWith(STORAGE_PHOTO) ? c.photo.slice(STORAGE_PHOTO.length) : null;
  const ownUrls = usePhotoUrls(ownPath ? [ownPath] : []);
  const photo = ownPath ? (ownUrls[ownPath] ? { src: ownUrls[ownPath], alt: c.title, autor: '', licencia: '', fuente: '' } : null) : c.photo ? levelOfferPhotos[c.photo] : null;
  const total = sheetTotalEuros(c);
  const wa = `https://wa.me/34685609542?text=${encodeURIComponent(`Hola, quiero confirmar la actividad «${c.title}»${reference ? ` (ficha ${reference})` : ''}.`)}`;
  const facts = [
    c.date && { icon: CalendarDays, text: fmtDate(c.date) },
    c.duration && { icon: Clock, text: c.duration },
    c.place && { icon: MapPin, text: c.place },
    { icon: Users, text: `${c.people} ${c.people === 1 ? 'persona' : 'personas'}` },
  ].filter(Boolean) as { icon: typeof Check; text: string }[];
  return (
    <article className="text-foreground">
      {c.customerName && <p className="text-sm font-semibold uppercase tracking-wide text-primary">Propuesta para {c.customerName}</p>}
      <div className="mt-2 flex flex-wrap gap-2"><Badge className="border-primary/40 bg-primary/15 text-primary">{DISC[c.discipline]} · {c.levelLabel}</Badge></div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-heading font-bold">{c.title || 'Sin título'}</h1>
      {c.summary && <p className="mt-3 text-lg text-muted-foreground">{c.summary}</p>}
      <ul className="mt-5 flex flex-wrap gap-2">
        {facts.map(({ icon: I, text }) => <li key={text} className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm"><I className="h-4 w-4 text-primary" />{text}</li>)}
      </ul>
      <LevelVisualStrip className="mt-5 max-w-xl" level={c.level} minAge={c.minAge} fitness={c.fitness} experience={c.experience} />
      {photo && (
        <figure className="mt-6 overflow-hidden rounded-xl border border-border">
          <img src={photo.src} alt={photo.alt} className="h-56 sm:h-72 w-full object-cover" />
          {!ownPath && <figcaption className="px-3 py-2 text-xs text-muted-foreground">Foto ilustrativa: <a href={photo.fuente} target="_blank" rel="noopener noreferrer" className="underline">{photo.autor}</a>, {photo.licencia}</figcaption>}
        </figure>
      )}
      {c.meetingPoint && <p className="mt-6 flex gap-2 rounded-lg border border-border bg-card p-4"><MapPin className="h-5 w-5 shrink-0 text-primary" /><span><span className="font-semibold">Punto de encuentro: </span>{c.meetingPoint}</span></p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <List title="Incluye" icon={Check} items={c.includes} />
        <List title="Qué llevar" icon={Backpack} items={c.bring} />
        <List title="Requisitos" icon={Check} items={c.requirements} />
      </div>
      {c.notes && <p className="mt-6 whitespace-pre-line rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">{c.notes}</p>}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        {c.pricePerPersonEuros !== null ? (
          <p className="text-muted-foreground"><span className="text-2xl font-extrabold text-primary">{c.pricePerPersonEuros} €</span> / persona{total !== null && c.people > 1 && <> · total <span className="font-bold text-foreground">{total} €</span></>}</p>
        ) : <p className="text-lg font-bold text-primary">Precio a consultar</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {accept}
          <Button variant={accept ? 'outline' : 'hero'} className="min-h-11" asChild><a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />Confirmar por WhatsApp</a></Button>
          <Button variant="outline" className="min-h-11" asChild><a href={`/contacto?interes=${c.discipline === 'ferratas' ? 'vias-ferratas' : c.discipline}`}>Consultar</a></Button>
        </div>
      </div>
    </article>
  );
}
