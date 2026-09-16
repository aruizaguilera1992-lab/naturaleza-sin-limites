import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ConsentPreferences } from '@/lib/cookieConsent';

const categories: {
  key: keyof ConsentPreferences;
  label: string;
  description: string;
  required?: boolean;
}[] = [
  {
    key: 'necessary',
    label: 'Necesarias',
    description: 'Imprescindibles para el funcionamiento básico del sitio. No se pueden desactivar.',
    required: true,
  },
  {
    key: 'analytics',
    label: 'Analítica',
    description: 'Nos permiten medir el tráfico y entender cómo se usa el sitio para mejorarlo.',
  },
  {
    key: 'preferences',
    label: 'Preferencias',
    description: 'Recuerdan tus ajustes como idioma, región u opciones de visualización.',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Utilizadas para mostrarte anuncios relevantes en función de tus intereses.',
  },
];

export function CookiePreferencesModal() {
  const { consent, isPreferencesOpen, closePreferences, acceptAll, rejectAll, savePreferences } =
    useCookieConsent();

  const [local, setLocal] = useState<ConsentPreferences>({ ...consent });

  useEffect(() => {
    if (isPreferencesOpen) setLocal({ ...consent });
  }, [isPreferencesOpen, consent]);

  const toggle = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return;
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent
        className="z-[70] flex flex-col gap-0 p-0 overflow-hidden
          w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)]
          max-h-[calc(100dvh-2rem)]
          sm:w-[min(92vw,560px)] sm:max-w-[min(92vw,560px)]
          sm:max-h-[min(82vh,720px)]
          rounded-xl sm:rounded-xl
          bg-card border-border text-foreground shadow-2xl"
      >
        <DialogHeader className="text-left px-5 sm:px-6 pt-5 sm:pt-6 pb-4 pr-12 shrink-0 border-b border-border/60">
          <DialogTitle className="font-heading text-foreground">Configurar cookies</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Elige qué categorías de cookies deseas permitir. Las cookies necesarias no se pueden
            desactivar porque son imprescindibles para el funcionamiento del sitio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 overscroll-contain">
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3.5 py-3"
              >
                <div className="flex-1 min-w-0">
                  <Label className="font-medium text-sm text-foreground">{cat.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 break-words">{cat.description}</p>
                </div>
                <Switch
                  checked={local[cat.key]}
                  disabled={cat.required}
                  onCheckedChange={() => toggle(cat.key)}
                  aria-label={cat.label}
                  className="mt-0.5 shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-5 sm:px-6 py-4 flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button variant="outline" size="sm" onClick={rejectAll} className="w-full sm:w-auto">
            Rechazar todas
          </Button>
          <Button variant="outline" size="sm" onClick={acceptAll} className="w-full sm:w-auto">
            Aceptar todas
          </Button>
          <Button size="sm" onClick={() => savePreferences(local)} className="w-full sm:w-auto">
            Guardar selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
