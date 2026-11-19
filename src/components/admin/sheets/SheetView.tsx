import type React from 'react';
import { useState } from 'react';
import { CalendarDays, Check, Clock, MapPin, MessageCircle, Users, Backpack, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LevelVisualStrip } from '@/components/shared/LevelVisualStrip';
import { levelOfferPhotos } from '@/data/levelOffers';
import { STORAGE_PHOTO, sheetFaqs, sheetTotalEuros, type SheetContent } from '@/lib/activitySheets';
import { usePhotoUrls } from '@/lib/adminCatalog';
import { OutingRules, OutingSteps } from '@/components/shared/OutingInstructions';
import { MeetingPoint } from '@/components/shared/MeetingPoint';
import { safeVideoEmbed } from '@/lib/safeVideo';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

/**
 * Preguntas frecuentes de la ficha: la sección llega plegada y se abre al
 * pulsar su cabecera; dentro, una pregunta abierta cada vez.
 */
export function SheetFaqs({ items, className = 'mt-6' }: { items: { question: string; answer: string }[]; className?: string }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <section className={cn('rounded-xl border border-border bg-card', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="sheet-faqs"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition-all duration-300 active:scale-[0.99]"
      >
        <span className="min-w-0">
          <span className="block font-heading font-bold text-foreground">Preguntas frecuentes</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {open ? 'Toca cada pregunta para ver la respuesta.' : `Toca para ver las ${items.length} preguntas.`}
          </span>
        </span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-primary transition-transform duration-300', open && 'rotate-180')} />
      </button>
      {open && (
        <div id="sheet-faqs" className="px-5 pb-5">
          <Accordion type="single" collapsible className="mt-1">
            {items.map((f, i) => (
              <AccordionItem key={`${f.question}-${i}`} value={`f-${i}`} className="border-border">
                <AccordionTrigger className="py-3 text-left font-heading text-sm font-semibold text-foreground hover:text-primary hover:no-underline">
                  <span className="flex items-start gap-2 text-left">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-extrabold text-primary">?</span>
                    {f.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-6 text-sm leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </section>
  );
}

/** Ficha de actividad privada; se usa en la vista previa del panel y en el enlace del cliente. */
export function SheetView({ c, reference, accept, ownPhotoUrl }: { c: SheetContent; reference?: string; accept?: React.ReactNode; /** Customer view: URL signed server-side (the bucket is admin-only). */ ownPhotoUrl?: string | null }) {
  const ownPath = c.photo?.startsWith(STORAGE_PHOTO) ? c.photo.slice(STORAGE_PHOTO.length) : null;
  const adminUrls = usePhotoUrls(ownPath && ownPhotoUrl === undefined ? [ownPath] : []);
  const ownUrls: Record<string, string> = ownPath && ownPhotoUrl ? { [ownPath]: ownPhotoUrl } : adminUrls;
  const photo = ownPath ? (ownUrls[ownPath] ? { src: ownUrls[ownPath], alt: c.title, autor: '', licencia: '', fuente: '' } : null) : c.photo ? levelOfferPhotos[c.photo] : null;
  const total = sheetTotalEuros(c);
  const video = safeVideoEmbed(c.videoUrl);
  const wa = `https://wa.me/34685609542?text=${encodeURIComponent(`Hola, quiero confirmar la actividad «${c.title}»${reference ? ` (ficha ${reference})` : ''}.`)}`;
  const facts = [
    { icon: CalendarDays, text: c.date ? fmtDate(c.date) : 'Fecha a acordar contigo' },
    c.duration && { icon: Clock, text: c.duration },
    c.place && { icon: MapPin, text: c.place },
    { icon: Users, text: `${c.people} ${c.people === 1 ? 'persona' : 'personas'}` },
  ].filter(Boolean) as { icon: typeof Check; text: string }[];
  return (
    <article className="text-foreground">
      {c.customerName && <p className="text-sm font-semibold uppercase tracking-wide text-primary">Propuesta para {c.customerName}</p>}
      <div className="mt-2 flex flex-wrap gap-2"><Badge className="border-primary/40 bg-primary/15 text-primary">{DISC[c.discipline]} · {c.levelLabel}</Badge>{c.grade?.trim() && <Badge variant="outline">Grado {c.grade.trim()}</Badge>}</div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-heading font-bold">{c.title || 'Sin título'}</h1>
      {c.summary && <p className="mt-3 text-lg text-muted-foreground">{c.summary}</p>}
      <ul className="mt-5 flex flex-wrap gap-2">
        {facts.map(({ icon: I, text }) => <li key={text} className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm"><I className="h-4 w-4 text-primary" />{text}</li>)}
      </ul>
      <LevelVisualStrip className="mt-5 max-w-xl" level={c.level} minAge={c.minAge} fitness={c.fitness} experience={c.experience} />
      {photo && (
        <figure className="mt-6 overflow-hidden rounded-xl border border-border">
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="block w-full cursor-zoom-in" aria-label={`Ver la foto «${photo.alt}» a tamaño completo`}>
                <img src={photo.src} alt={photo.alt} className="h-56 sm:h-72 w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
              <DialogTitle className="sr-only">{photo.alt}</DialogTitle>
              <img src={photo.src} alt={photo.alt} className="max-h-[85vh] w-full rounded-xl object-contain" />
            </DialogContent>
          </Dialog>
          {!ownPath && <figcaption className="px-3 py-2 text-xs text-muted-foreground">Foto ilustrativa: <a href={photo.fuente} target="_blank" rel="noopener noreferrer" className="underline">{photo.autor}</a>, {photo.licencia}</figcaption>}
        </figure>
      )}
      {c.description?.trim() && <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{c.description.trim()}</p>}
      {video && (
        <div className="mt-6 aspect-video overflow-hidden rounded-xl border border-border">
          <iframe src={video} title={`Vídeo: ${c.title}`} className="h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      )}
      {c.meetingPoint && <MeetingPoint text={c.meetingPoint} />}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <List title="Incluye" icon={Check} items={c.includes} />
        <List title="Qué llevar" icon={Backpack} items={c.bring} />
        <List title="Requisitos" icon={Check} items={c.requirements} />
        <OutingRules rules={c.rules} className="rounded-xl border border-border bg-card p-5" />
      </div>
      <OutingSteps steps={c.steps} className="mt-4 rounded-xl border border-border bg-card p-5" />
      {c.notes && <p className="mt-6 whitespace-pre-line rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">{c.notes}</p>}
      <SheetFaqs items={sheetFaqs(c)} />
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
