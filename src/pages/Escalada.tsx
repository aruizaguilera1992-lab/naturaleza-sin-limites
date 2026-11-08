import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, MessageCircle, UserCheck } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { climbingLevels } from "@/data/climbingTraining";
import { media } from "@/data/media";

const initiation = climbingLevels.find((level) => level.code === "E1")!;
const whatsappHref = `https://wa.me/34685609542?text=${encodeURIComponent(
  "Hola, me interesa la iniciación a la escalada deportiva. ¿Me podéis informar de fechas y precio?",
)}`;

export default function Escalada() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Seo
        title="Iniciación a la escalada deportiva en Málaga | Naturaleza Sin Límites"
        description={`${initiation.title}: ${initiation.duration}. ${initiation.access} Precio a consultar.`}
        path="/escalada"
      />
      <Navbar />
      <main>
        <section className="relative flex min-h-[78vh] items-end overflow-hidden pb-20 pt-44 md:pt-32">
          <div className="absolute inset-0">
            <img src={media.climbing.src} alt={media.climbing.alt} loading="eager" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          </div>
          <div className="container relative z-10 mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Escalada · Nivel {initiation.code}</p>
              <h1 className="font-heading text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
                {initiation.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3 text-foreground/85">
                <span className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm"><Clock className="h-4 w-4 text-primary" />{initiation.duration}</span>
                <span className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm"><UserCheck className="h-4 w-4 text-primary" />{initiation.access}</span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="hero" size="lg" className="gap-2 transition-all duration-300 active:scale-95" asChild>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" />Consultar por WhatsApp</a>
                </Button>
                <span className="font-heading text-lg font-bold text-foreground">Precio a consultar</span>
              </div>
            </motion.div>
          </div>
          <a href={media.climbing.sourceUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-6 right-4 z-10 text-xs text-foreground/60 underline underline-offset-4 hover:text-foreground">
            Fotografía provisional · Pexels
          </a>
        </section>

        <section className="py-16 sm:py-24" aria-labelledby="learn-title">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2">
            <div>
              <h2 id="learn-title" className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Qué aprenderás</h2>
              <ul className="mt-6 space-y-4">
                {initiation.outcomes.map((item) => (
                  <li key={item} className="flex gap-3 text-foreground/85"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-foreground">Contenidos</h2>
              <ul className="mt-5 space-y-3">
                {initiation.contents.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{item}</li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground"><strong className="text-foreground">Evaluación:</strong> {initiation.assessment}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
