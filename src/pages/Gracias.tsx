import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, Mountain, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Order = {
  found: boolean;
  productName?: string;
  mode?: string;
  status?: string;
  portalToken?: string | null;
};

export default function Gracias() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    supabase.functions
      .invoke("get-plan-order", { body: { sessionId } })
      .then(({ data }) => {
        if (active && data) setOrder(data as Order);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [sessionId]);

  const isPack = order?.mode === "paquete";

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
          {order?.productName && (
            <p className="mb-3 font-heading text-lg text-primary">{order.productName}</p>
          )}
          <p className="text-muted-foreground">
            {isPack
              ? "Hemos recibido tu pago. En unos minutos recibirás el correo de confirmación y, en menos de 24 horas laborables, te escribimos para reservar las fechas de tus salidas y enviarte el punto de encuentro."
              : "Hemos recibido tu pago y tu alta queda confirmada. En unos minutos recibirás un correo de confirmación y, en menos de 24 horas laborables, la invitación para darte de alta en la plataforma de entrenamiento."}
          </p>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            Revisa también la carpeta de spam por si acaso.
          </p>

          {order?.portalToken && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-primary" />
              <Link to={`/mi-suscripcion/${order.portalToken}`} className="text-primary underline">
                Gestionar mi suscripción (facturas, tarjeta, cancelación)
              </Link>
            </p>
          )}

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
