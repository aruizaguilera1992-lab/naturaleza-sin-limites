import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LOGO_SRC } from "@/lib/site";

type View = { title: string; body: string; code?: string };

export default function NewsletterAccion() {
  const [params] = useSearchParams();
  const accion = params.get("accion");
  const token = params.get("token") ?? "";
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    const action = accion === "confirmar" ? "confirm" : accion === "baja" ? "unsubscribe" : null;
    if (!action || !token) { setView({ title: "Enlace no válido", body: "Este enlace está incompleto." }); return; }
    supabase.functions.invoke("newsletter", { body: { action, token } }).then(({ data, error }) => {
      if (error) return setView({ title: "Enlace no válido", body: "El enlace ha caducado o ya no existe. Si quieres, vuelve a suscribirte desde la web." });
      if (action === "confirm") setView({ title: "¡Suscripción confirmada!", body: "Este es tu código de 10 % de descuento para tu primera actividad. También te lo hemos enviado por email.", code: data?.discount_code });
      else setView({ title: "Te has dado de baja", body: "No volverás a recibir la newsletter. Puedes volver a suscribirte cuando quieras." });
    });
  }, [accion, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Helmet><title>Newsletter · Naturaleza Sin Límites</title><meta name="robots" content="noindex" /></Helmet>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <img src={LOGO_SRC} alt="Naturaleza Sin Límites" className="mx-auto h-24 w-auto" />
        <h1 className="mt-4 font-heading text-2xl text-foreground">{view?.title ?? "Un momento…"}</h1>
        {view && <p className="mt-3 text-muted-foreground">{view.body}</p>}
        {view?.code && <p className="mt-4 font-heading text-2xl tracking-widest text-primary">{view.code}</p>}
        <Button asChild variant="hero" className="mt-6"><Link to="/">Volver a la web</Link></Button>
      </div>
    </main>
  );
}
