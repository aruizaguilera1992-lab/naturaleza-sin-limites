import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Compass, Mountain, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { ClimbingQuestionnaire } from "@/components/escalada/ClimbingQuestionnaire";
import { CragResults } from "@/components/escalada/CragResults";
import {
  ClimbingOrientation,
  ClimbingPractices,
  ClimbingSectionNav,
  ClimbingTrainingPath,
} from "@/components/escalada/ClimbingTrainingSections";
import { media } from "@/data/media";

interface FilterAnswers {
  nivel: string;
  tipo: string;
  duracion: string;
  provincia: string;
}

const initialFilters: FilterAnswers = { nivel: "", tipo: "", duracion: "", provincia: "" };

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export default function Escalada() {
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<FilterAnswers>(initialFilters);
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      target?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hash]);

  const showFilteredResults = (answers: FilterAnswers) => {
    setFilters(answers);
    setShowResults(true);
    window.setTimeout(() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleShowAll = () => {
    setFilters(initialFilters);
    setShowResults(true);
    window.setTimeout(() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setShowResults(false);
    window.setTimeout(() => document.getElementById("cuestionario")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <motion.div className="min-h-screen overflow-x-clip bg-background" initial="initial" animate="animate" exit="exit" variants={pageTransition}>
      <Seo
        title="Escalada deportiva en Málaga: experiencias y formación | Naturaleza Sin Límites"
        description="Escalada deportiva en Málaga y Andalucía: experiencias guiadas, formación propia NSL E1–E3 y prácticas tutorizadas en vías equipadas de un largo."
        path="/escalada"
      />

      <Navbar />
      <main>
        <section className="relative flex min-h-[78vh] items-end overflow-hidden pb-24 pt-44 sm:min-h-[84vh] md:pt-32">
          <div className="absolute inset-0">
            <img src={media.climbing.src} alt={media.climbing.alt} loading="eager" decoding="async" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/75 px-4 py-2 text-sm font-bold text-primary backdrop-blur-sm"><Mountain className="h-4 w-4" /> Escalada deportiva</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-sm"><Users className="h-4 w-4 text-primary" /> Grupos reducidos</span>
              </div>
              <h1 className="max-w-4xl font-heading text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
                Escalada deportiva: <span className="text-primary">vive, aprende y progresa</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/80 sm:text-xl">
                Experiencias guiadas, formación progresiva y práctica tutorizada en Málaga y Andalucía.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="lg" className="gap-2" asChild><a href="#experiencias">Ver experiencias <ArrowDown className="h-5 w-5" /></a></Button>
                <Button variant="heroOutline" size="lg" className="gap-2" asChild><a href="#orientacion">Encontrar mi nivel <Compass className="h-5 w-5" /></a></Button>
              </div>
            </motion.div>
          </div>

          <a href={media.climbing.sourceUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-16 right-4 z-10 text-xs text-foreground/60 underline underline-offset-4 hover:text-foreground">
            Fotografía provisional · Pexels
          </a>
        </section>

        <ClimbingSectionNav />

        <section id="experiencias" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="experiences-title">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase text-primary">Salidas guiadas existentes</p>
                <h2 id="experiences-title" className="font-heading text-3xl font-extrabold text-foreground sm:text-5xl">Vive la experiencia</h2>
              </div>
              <p className="max-w-2xl leading-7 text-muted-foreground lg:justify-self-end">
                Elige según tu experiencia, tipo de escalada, tiempo y zona. Accederás a las fichas actuales y a su reserva habitual.
              </p>
            </div>

            {!showResults ? (
              <div id="cuestionario" className="mt-10 scroll-mt-24">
                <ClimbingQuestionnaire onComplete={showFilteredResults} onReset={handleReset} />
                <div className="mt-6 text-center">
                  <Button variant="link" onClick={handleShowAll}>Ver todas las escuelas <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              <div id="resultados" className="mt-10 scroll-mt-24"><CragResults filters={filters} onReset={handleReset} /></div>
            )}
          </div>
        </section>

        <ClimbingOrientation />
        <ClimbingTrainingPath />
        <ClimbingPractices />
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </motion.div>
  );
}