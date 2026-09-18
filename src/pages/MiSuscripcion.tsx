import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { Loader2, Mountain, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function MiSuscripcion() {
  const { token = "" } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("create-portal-session", {
      body: { token, returnUrl: `${window.location.origin}/mi-suscripcion/${token}` },
    });
    setLoading(false);
    if (fnError || !data?.url) {
      setError(
        "No hemos podido abrir la gestión de tu suscripción. Escríbenos por WhatsApp y lo resolvemos.",
      );
      return;
    }
    window.open(data.url as string, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mi suscripción | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="container mx-auto max-w-xl px-4 pt-20 pb-24">
        <div className="mb-8 flex items-center gap-3">
          <Mountain className="h-7 w-7 text-primary" />
          <span className="font-heading text-lg font-bold">Naturaleza Sin Límites</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Settings className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h1 className="mb-2 font-heading text-2xl font-bold">Gestiona tu suscripción</h1>
          <p className="mb-6 text-muted-foreground">
            Desde aquí puedes ver tus facturas, cambiar la tarjeta o cancelar la renovación. Se abre
            en una pestaña nueva, en la página segura de nuestro proveedor de pagos.
          </p>
          <Button size="lg" className="w-full" onClick={openPortal} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Abrir gestión de pagos
          </Button>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <p className="mt-6 text-sm text-muted-foreground">
            ¿Prefieres que lo hagamos nosotros?{" "}
            <Link to="/contacto" className="text-primary underline">
              Escríbenos
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
