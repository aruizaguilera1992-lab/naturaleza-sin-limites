import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Mountain } from "lucide-react";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function Login() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.href = next;
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = next;
    });
    return () => sub.subscription.unsubscribe();
  }, [next]);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    // El destino se guarda aparte; el retorno de Google siempre va a la raíz
    // y desde ahí se navega a `next` una vez confirmada la sesión.
    sessionStorage.setItem("auth_next", next);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) {
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
      return;
    }
    if (result.redirected) return;
    window.location.href = next;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <Helmet>
        <title>Acceso | Naturaleza Sin Límites</title>
        <meta name="description" content="Inicia sesión en Naturaleza Sin Límites para gestionar tus conexiones y reservas." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Mountain className="h-6 w-6" />
          <span className="font-heading font-bold tracking-wide">NATURALEZA SIN LÍMITES</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Iniciar sesión
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Accede con tu cuenta para autorizar aplicaciones conectadas.
        </p>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full transition-all duration-300 active:scale-95"
        >
          {busy ? "Conectando…" : "Continuar con Google"}
        </Button>
      </div>
    </div>
  );
}
