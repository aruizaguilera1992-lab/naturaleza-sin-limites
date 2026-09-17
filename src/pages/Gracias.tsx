import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Gracias() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pago completado | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="container mx-auto max-w-2xl px-4 pt-16 pb-20">
        <div className="mb-8 flex items-center gap-3">
          <Mountain className="h-7 w-7 text-primary" />
          <span className="font-heading text-lg font-bold">Naturaleza Sin Límites</span>
        </div>

        <div className="rounded-xl border border-primary/40 bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="mb-3 font-heading text-2xl font-bold">
            {sessionId ? "¡Pago completado!" : "Gracias"}
          </h1>
          <p className="text-muted-foreground">
            Hemos recibido tu pago y tu alta queda confirmada. En unos minutos recibirás un correo de
            confirmación y, en menos de 24 horas laborables, la invitación para darte de alta en la
            plataforma de entrenamiento.
          </p>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            Revisa también la carpeta de spam por si acaso.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="transition-all duration-300 active:scale-95">
              <Link to="/vertigo-sapiens">Volver a Vértigo Sapiens</Link>
            </Button>
            <Button asChild variant="outline" className="transition-all duration-300 active:scale-95">
              <Link to="/contacto">Contactar con el equipo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
