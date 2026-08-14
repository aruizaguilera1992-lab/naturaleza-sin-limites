import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

type AuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): AuthNamespace {
  return (supabase.auth as unknown as { oauth: AuthNamespace }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Falta el parámetro authorization_id.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthApi().approveAuthorization(authorizationId)
      : await oauthApi().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("El servidor de autorización no devolvió una URL de redirección.");
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "esta aplicación";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <Helmet>
        <title>Autorizar aplicación | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-heading font-bold tracking-wide">AUTORIZACIÓN</span>
        </div>

        {error ? (
          <>
            <h1 className="text-xl font-heading font-bold text-foreground mb-2">
              No se pudo cargar la solicitud
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Cargando solicitud…</p>
        ) : (
          <>
            <h1 className="text-xl font-heading font-bold text-foreground mb-2">
              Conectar {clientName} a tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Permitirás que {clientName} use las herramientas de Naturaleza Sin Límites en tu
              nombre.
            </p>
            <div className="flex gap-3">
              <Button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 transition-all duration-300 active:scale-95"
              >
                Aprobar
              </Button>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() => decide(false)}
                className="flex-1 transition-all duration-300 active:scale-95"
              >
                Denegar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
