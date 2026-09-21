import { Award, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { media } from '@/data/media';

export function GuideAuthority() {
  return (
    <section className="bg-background py-16 sm:py-20" aria-labelledby="guide-heading">
      <div className="container mx-auto grid items-center gap-8 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-border sm:min-h-[380px]">
          <img src={media.ropeDetail.src} alt={media.ropeDetail.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-foreground">Preparación técnica y revisión del material antes de cada salida</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase text-primary">Quién te acompaña</p>
          <h2 id="guide-heading" className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Antonio Ruiz Aguilera</h2>
          <p className="mt-3 text-lg font-semibold text-foreground/85">Técnico deportivo TD2 especializado en actividades de montaña y espeleología.</p>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">Naturaleza Sin Límites es un proyecto de trato directo. La actividad se valora contigo, se adapta al nivel real del grupo y se desarrolla con atención a la técnica, el entorno y la seguridad.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 border-l-2 border-primary pl-3"><Award className="h-5 w-5 shrink-0 text-primary" /><span className="text-sm font-semibold">Titulación TD2</span></div>
            <div className="flex items-center gap-3 border-l-2 border-primary pl-3"><Users className="h-5 w-5 shrink-0 text-primary" /><span className="text-sm font-semibold">Trato directo</span></div>
            <div className="flex items-center gap-3 border-l-2 border-primary pl-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><span className="text-sm font-semibold">Seguridad primero</span></div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="default" asChild><Link to="/quienes-somos">Conocer al guía</Link></Button>
            <Button variant="ghost" size="default" asChild><a href="https://wa.me/34685609542?text=Hola%2C%20quiero%20consultar%20qué%20actividad%20se%20adapta%20mejor%20a%20mi%20nivel." target="_blank" rel="noopener noreferrer"><MessageCircle /> Consultar mi nivel</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}