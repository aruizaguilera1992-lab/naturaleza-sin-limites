import { SITE_URL } from "@/lib/site";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

/** El dominio público del negocio: ahí nunca se muestran avisos internos. */
const productionHost = new URL(SITE_URL).hostname;

function isProductionSite() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === productionHost || host === `www.${productionHost}`;
}

/**
 * Aviso interno del entorno de pagos. Solo se muestra en vista previa y
 * entornos de prueba; en el dominio público del negocio no se renderiza nunca.
 */
export function PaymentTestModeBanner() {
  if (isProductionSite()) return null;

  if (!clientToken) {
    return (
      <div className="w-full bg-destructive/15 border-b border-destructive/40 px-4 py-2 text-center text-sm text-destructive-foreground">
        Los pagos aún no están activados para producción.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-primary/15 border-b border-primary/40 px-4 py-2 text-center text-sm text-primary">
        Modo de prueba: los pagos realizados aquí no son reales.
      </div>
    );
  }
  return null;
}
