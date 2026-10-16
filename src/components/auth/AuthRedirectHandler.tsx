import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { clearAuthNext, readAuthNext } from "@/lib/authReturn";

export function AuthRedirectHandler({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(() => location.pathname === "/" && Boolean(readAuthNext()));
  useEffect(() => {
    if (location.pathname !== "/") { setChecking(false); return; }
    const pending = readAuthNext();
    if (!pending) return;
    let active = true;
    let completed = false;
    const verify = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active || completed) return;
        completed = true;
        clearAuthNext();
        navigate(data.user && !error ? pending : `/login?next=${encodeURIComponent(pending)}`, { replace: true });
      } catch {
        if (active && !completed) {
          completed = true;
          clearAuthNext();
          navigate(`/login?next=${encodeURIComponent(pending)}`, { replace: true });
        }
      } finally { if (active) setChecking(false); }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) setTimeout(() => { if (active) void verify(); }, 0);
    });
    void verify();
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [location.pathname, navigate]);
  if (checking) return <main className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground" aria-busy="true"><p role="status">Comprobando acceso…</p></main>;
  return <>{children}</>;
}