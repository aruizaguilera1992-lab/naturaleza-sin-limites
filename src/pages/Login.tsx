import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AccessLayout } from "@/components/auth/AccessLayout";
import { clearAuthNext, googleCallbackUrl, safeNext, storeAuthNext } from "@/lib/authReturn";

export default function Login() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const management = next.split(/[?#]/)[0] === "/admin";
  const connection = next.startsWith("/.lovable/oauth/consent");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const attempt = useRef(0);
  const cancelled = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active || cancelled.current) return;
        if (data.user && !error) { clearAuthNext(); navigate(next, { replace: true }); }
      } catch { if (active) setError("No se pudo comprobar tu sesión. Puedes volver a intentarlo con Google."); }
      finally { if (active) setChecking(false); }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) setTimeout(() => { if (active) void verify(); }, 0);
    });
    void verify();
    return () => { active = false; attempt.current++; sub.subscription.unsubscribe(); };
  }, [next, navigate]);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    cancelled.current = false;
    const id = ++attempt.current;
    try {
      const stored = storeAuthNext(next);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: googleCallbackUrl(window.location.origin, next, stored),
      });
      if (id !== attempt.current) return;
      if (result.error) throw result.error;
      if (result.redirected) return;
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (id !== attempt.current) return;
      if (sessionError || !data.user) throw new Error("No verified session");
      clearAuthNext();
      navigate(next, { replace: true });
    } catch {
      if (id !== attempt.current) return;
      clearAuthNext();
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
    } finally { if (id === attempt.current) setBusy(false); }
  }
  function cancel() {
    cancelled.current = true;
    attempt.current++;
    clearAuthNext();
    setBusy(false);
    navigate("/", { replace: true });
  }

  return (
    <>
      <Helmet>
        <title>{management ? "Acceso a gestión" : connection ? "Acceso a conexiones" : "Acceso"} | Naturaleza Sin Límites</title>
        <meta name="description" content="Acceso con Google a Naturaleza Sin Límites." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <AccessLayout onLeave={() => { cancelled.current = true; attempt.current++; clearAuthNext(); }} title={management ? "Acceso a gestión" : connection ? "Conectar una aplicación" : "Acceso a tu cuenta"} description={management ? "Inicia sesión\u00a0 para acceder al panel de gestión" : connection ? "Inicia sesión con Google para revisar la solicitud de conexión de la aplicación." : "Inicia sesión con Google para continuar en Naturaleza Sin Límites."} busy={busy || checking}>
        {error && <p ref={errorRef} tabIndex={-1} role="alert" className="mb-5 rounded-md border border-destructive bg-card p-4 text-sm leading-relaxed text-foreground focus:outline-none">{error}</p>}
        <Button
          type="button"
          onClick={handleGoogle}
          disabled={busy || checking}
          aria-busy={busy || checking}
          className="w-full gap-3 rounded-md normal-case tracking-normal shadow-none transition-none hover:translate-y-0 active:scale-100"
        >
          {busy || checking ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground font-sans text-lg font-bold text-background">G</span>}
          {checking ? "Comprobando sesión…" : busy ? "Conectando con Google…" : error ? "Reintentar con Google" : "login"}
        </Button>
        {busy && <Button variant="ghost" onClick={cancel} className="mt-3 w-full normal-case tracking-normal">Cancelar y volver a la web</Button>}
      </AccessLayout>
    </>
  );
}
