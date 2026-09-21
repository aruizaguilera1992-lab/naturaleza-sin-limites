import { ArrowRight, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { media } from '@/data/media';

export function VertigoSapiens() {
  return (
    <section id="vertigo-sapiens" className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="grid overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase text-primary"><Dumbbell className="h-5 w-5" /> Vértigo Sapiens</div>
            <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">Fuerza funcional para rendir mejor en la montaña</h2>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">Entrenamiento, técnica y sesiones outdoor como complemento para quienes quieren ganar autonomía y preparación.</p>
            <div className="mt-7"><Button variant="outline" asChild><Link to="/vertigo-sapiens">Conocer el programa <ArrowRight /></Link></Button></div>
          </div>
          <img src={media.functionalTraining.src} alt={media.functionalTraining.alt} loading="lazy" decoding="async" className="min-h-[260px] h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}