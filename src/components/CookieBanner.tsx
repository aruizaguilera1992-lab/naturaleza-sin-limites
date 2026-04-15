import { useCookieConsent } from '@/context/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export function CookieBanner() {
  const { hasChoice, acceptAll, rejectAll, openPreferences } = useCookieConsent();

  if (hasChoice) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background/95 backdrop-blur-sm shadow-2xl p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-foreground text-sm mb-1">Cookies</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Utilizamos cookies propias y de terceros para analizar el uso del sitio, personalizar
              contenido y mostrarte publicidad relevante. Puedes aceptar, rechazar o configurar tus
              preferencias en cualquier momento.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={rejectAll}
            className="w-full sm:w-auto"
          >
            Rechazar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openPreferences}
            className="w-full sm:w-auto"
          >
            Configurar
          </Button>
          <Button
            size="sm"
            onClick={acceptAll}
            className="w-full sm:w-auto"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
