import type React from 'react';
import { sheetPhotoPaths } from '../../../../supabase/functions/_shared/activitySheetPhotos';
import { useEffect, useState } from 'react';
import { CalendarDays, Check, Clock, MapPin, MessageCircle, Users, Backpack, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LevelVisualStrip } from '@/components/shared/LevelVisualStrip';
import { levelOfferPhotos } from '@/data/levelOffers';
import { STORAGE_PHOTO, sheetFaqs, sheetTotalEuros, type SheetContent } from '@/lib/activitySheets';
import { safeWhatsappGroup } from '@/lib/safeWhatsapp';
import { usePhotoUrls } from '@/lib/adminCatalog';
import { OutingRules, OutingSteps } from '@/components/shared/OutingInstructions';
import { MeetingPoint } from '@/components/shared/MeetingPoint';
import { safeVideoEmbed } from '@/lib/safeVideo';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ActivitySection } from '@/components/shared/ActivitySection';

const DISC: Record<SheetContent['discipline'], string> = { barranquismo: 'Barranquismo', ferratas: 'Vía ferrata', espeleologia: 'Espeleología' };
const fmtDate = (d: string) => { try { return new Date(`${d}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; } };

function List({ title, icon: Icon, items }: { title: string; icon: typeof Check; items: string[] }) {
  if (!items.length) return null;
  return (
    <ActivitySection title={title} icon={Icon}>
      <ul className="grid gap-2">{items.map((c) => <li key={c} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 break-words">{c}</span></li>)}</ul>
    </ActivitySection>
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

function SheetGallery({ photos, credit }: { photos: { src: string; alt: string }[]; credit?: React.ReactNode }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (i >= photos.length) setI(0); }, [i, photos.length]);
  const cur = photos[Math.min(i, photos.length - 1)];
  const many = photos.length > 1;
  const go = (d: number) => setI((v) => (v + d + photos.length) % photos.length);
  const Arrows = () => many ? (<>
    <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground transition-all duration-300 active:scale-95"><ChevronLeft className="h-5 w-5" /></button>
    <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground transition-all duration-300 active:scale-95"><ChevronRight className="h-5 w-5" /></button>
  </>) : null;
  return (
    <figure className="mt-6 overflow-hidden rounded-xl border border-border">
      <Dialog>
        <div className="relative">
          <DialogTrigger asChild>
            <button type="button" className="block w-full cursor-zoom-in" aria-label={`Ver la foto «${cur.alt}» a tamaño completo`}>
              <img src={cur.src} alt={cur.alt} className="h-56 sm:h-72 w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
            </button>
          </DialogTrigger>
          <Arrows />
          {many && <span className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">{i + 1} / {photos.length}</span>}
        </div>
        <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{cur.alt}</DialogTitle>
          <div className="relative"><img src={cur.src} alt={cur.alt} className="max-h-[85vh] w-full rounded-xl object-contain" /><Arrows /></div>
        </DialogContent>
      </Dialog>
      {many && (
        <div className="flex gap-2 overflow-x-auto p-2">
          {photos.map((p, k) => (
            <button key={p.src} type="button" onClick={() => setI(k)} aria-label={`Ver foto ${k + 1}`} aria-current={k === i} className={cn('h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-300 active:scale-95', k === i ? 'border-primary' : 'border-transparent opacity-70')}>
              <img src={p.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {credit && <figcaption className="px-3 py-2 text-xs text-muted-foreground">{credit}</figcaption>}
    </figure>
  );
}

/** Ficha de actividad privada; se usa en la vista previa del panel y en el enlace del cliente. */
export function SheetView({ c, reference, accept, ownPhotoUrls }: { c: SheetContent; reference?: string; accept?: React.ReactNode; /** Customer view: URLs signed server-side by path (the bucket is admin-only). */ ownPhotoUrls?: Record<string, string> }) {
  const ownPath = c.photo?.startsWith(STORAGE_PHOTO) ? c.photo.slice(STORAGE_PHOTO.length) : null;
  const paths = sheetPhotoPaths(c.photo, c.gallery);
  const adminUrls = usePhotoUrls(ownPhotoUrls === undefined ? paths : []);
  const ownUrls: Record<string, string> = ownPhotoUrls ?? adminUrls;
  const stock = !ownPath && c.photo ? levelOfferPhotos[c.photo] : null;
  const photos: { src: string; alt: string }[] = [
    ...(stock ? [{ src: stock.src, alt: stock.alt }] : []),
    ...paths.filter((p) => ownUrls[p]).map((p, i) => ({ src: ownUrls[p], alt: `${c.title} · foto ${i + 1}` })),
  ];
  const total = sheetTotalEuros(c);
  const video = safeVideoEmbed(c.videoUrl);
  const wa = `https://wa.me/34685609542?text=${encodeURIComponent(`Hola, tengo una consulta sobre la actividad «${c.title}»${reference ? ` (ficha ${reference})` : ''}.`)}`;
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
      {photos.length > 0 && <SheetGallery photos={photos} credit={stock && <>Foto ilustrativa: <a href={stock.fuente} target="_blank" rel="noopener noreferrer" className="underline">{stock.autor}</a>, {stock.licencia}</>} />}
      <div className="mt-6 border-t border-border">
      {c.description?.trim() && <ActivitySection title="La actividad"><p className="whitespace-pre-line break-words">{c.description.trim()}</p></ActivitySection>}
      <ActivitySection title="Nivel y condiciones"><LevelVisualStrip className="max-w-xl" level={c.level} minAge={c.minAge} fitness={c.fitness} experience={c.experience} /></ActivitySection>
      {video && (
        <ActivitySection title="La actividad en vídeo">
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe src={video} title={`Vídeo: ${c.title}`} className="h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
        </div>
        </ActivitySection>
      )}
      {c.meetingPoint && <ActivitySection title="Punto de encuentro" icon={MapPin}><MeetingPoint text={c.meetingPoint} /></ActivitySection>}
      {safeWhatsappGroup(c.whatsappGroup) && (
        <ActivitySection title="Grupo de WhatsApp de la actividad" icon={MessageCircle}>
          <Button asChild className="min-h-11">
            <a href={safeWhatsappGroup(c.whatsappGroup) ?? undefined} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />Unirme al grupo</a>
          </Button>
        </ActivitySection>
      )}
        <List title="Incluye" icon={Check} items={c.includes} />
        <List title="Qué llevar" icon={Backpack} items={c.bring} />
        <List title="Requisitos" icon={Check} items={c.requirements} />
        {(c.highlights?.length ?? 0) > 0 && <List title="Lo esencial" icon={Check} items={c.highlights ?? []} />}
        {c.rules?.trim() && <ActivitySection title="Normas de participación"><OutingRules rules={c.rules} /></ActivitySection>}
        {c.steps?.trim() && <ActivitySection title="Pasos a seguir"><OutingSteps steps={c.steps} /></ActivitySection>}
        {c.notes && <ActivitySection title="Notas para ti"><p className="whitespace-pre-line break-words">{c.notes}</p></ActivitySection>}
      </div>
      <SheetFaqs items={sheetFaqs(c)} />
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        {c.pricePerPersonEuros !== null ? (
          <p className="text-muted-foreground"><span className="text-2xl font-extrabold text-primary">{c.pricePerPersonEuros} €</span> / persona{total !== null && c.people > 1 && <> · total <span className="font-bold text-foreground">{total} €</span></>}</p>
        ) : <p className="text-lg font-bold text-primary">Precio a consultar</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {accept}
          <Button variant={accept ? 'outline' : 'hero'} className="min-h-11" asChild><a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />Consultar por WhatsApp</a></Button>
        </div>
      </div>
    </article>
  );
}
