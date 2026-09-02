const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
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
