import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/naturaleza-sin-limites-logo.webp.asset.json";
import { absoluteUrl } from "@/lib/site";

export function AccessLayout({ title, description, children, busy = false, onLeave }: { title: string; description: string; children: ReactNode; busy?: boolean; onLeave?: () => void }) {
  return <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground" aria-busy={busy}>
    <div className="w-full max-w-sm">
      <Link to="/" onClick={onLeave} aria-label="Naturaleza Sin Límites · volver a la web" className="mx-auto mb-8 block w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <img src={absoluteUrl(logoAsset.url)} alt="Naturaleza Sin Límites" className="h-28 w-28 object-contain" />
      </Link>
      <div className="mb-8 border-t-2 border-primary pt-8 text-center">
        <h1 className="mb-3 font-heading text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
      <Link to="/" onClick={onLeave} className="mx-auto mt-8 flex min-h-11 w-fit items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />Volver a la web
      </Link>
    </div>
  </main>;
}