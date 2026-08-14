import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain } from "lucide-react";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function Login() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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

  const redirectTo = `${window.location.origin}${next}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (!data.session) {
        setMessage("Te hemos enviado un email de confirmación. Confirma tu cuenta para continuar.");
      }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    window.location.href = next;
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError(error.message);
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
          {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Accede con tu cuenta para autorizar aplicaciones conectadas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background text-foreground"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background text-foreground"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button
            type="submit"
            disabled={busy}
            className="w-full transition-all duration-300 active:scale-95"
          >
            {busy ? "Procesando…" : mode === "signin" ? "Entrar" : "Registrarme"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          className="w-full mt-3 transition-all duration-300 active:scale-95"
        >
          Continuar con Google
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {mode === "signin" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}
