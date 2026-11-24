import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import escaladaHombre from '@/assets/escalada-techo-hombre.jpg';
import escaladaMujer from '@/assets/escalada-techo-mujer.jpg';

const cardSlides = [escaladaHombre, escaladaMujer];
const CARD_ROTATE_MS = 10000;

function useCardSlide(count: number) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setActive((current) => (current + 1) % count), CARD_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count]);
  return active;
}

const pillars = [
  { number: '01', label: 'Fuerza funcional' },
  { number: '02', label: 'Resistencia' },
  { number: '03', label: 'Movilidad' },
];

export function VertigoSapiens() {
  const active = useCardSlide(cardSlides.length);
  return (
    <section id="vertigo-sapiens" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-2xl lg:flex-row">
          {/* Content side */}
          <div className="flex flex-col justify-center border-l-4 border-primary p-8 sm:p-12 lg:w-1/2 lg:p-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Vértigo Sapiens Online
            </p>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Preparación física online para deportes verticales
            </h2>
            <div className="mt-6 space-y-4">
              <p className="text-lg font-semibold leading-relaxed">
                Domina el medio vertical con un <span className="text-primary">plan guiado de 8 semanas</span>.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Entrenamiento específico en <span className="font-semibold text-foreground">fuerza funcional, resistencia y movilidad</span> diseñado para barranquismo, espeleología y actividades verticales.
              </p>
            </div>
            <div className="mb-10 mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {pillars.map(({ number, label }) => (
                <div key={number}>
                  <div className="text-xl font-extrabold text-primary">{number}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest sm:text-xs">{label}</div>
                </div>
              ))}
            </div>
            <div>
              <Button asChild size="lg" className="w-full uppercase tracking-widest shadow-lg shadow-primary/20 sm:w-auto sm:self-start">
                <Link to="/vertigo-sapiens">
                  Conocer el programa
                  <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Image side */}
          <div className="relative min-h-[420px] overflow-hidden lg:w-1/2 lg:min-h-full">
            <div role="img" aria-label="Escaladores colgados en un techo de roca: un modelo y una modelo alternando cada pocos segundos" className="absolute inset-0">
              {cardSlides.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  width={1536}
                  height={717}
                  className={`absolute inset-0 h-full w-full object-cover object-right transition-opacity duration-[1000ms] ease-in-out ${index === active ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-r lg:from-card lg:via-transparent" aria-hidden="true" />
            <div className="absolute right-6 top-6 rotate-3 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
              8 semanas · Plan guiado
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
