import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mountain,
  ShieldCheck,
  Users,
} from "lucide-react";

type Payment = {
  concept: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: string | null;
  activity: string;
  date: string | null;
  people: string | null;
  name: string | null;
};

const formatAmount = (cents: number, currency: string) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

export default function Pago() {
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const justReturned = !!searchParams.get("session_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const loadStatus = useCallback(async () => {
    const { data, error: fnError } = await supabase.functions.invoke("get-payment", {
      body: { token, action: "status" },
    });
    if (fnError || !data?.payment) {
      setError("No hemos encontrado este enlace de pago.");
      setPayment(null);
    } else {
      setPayment(data.payment as Payment);
      setError(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Tras volver del pago, el webhook puede tardar unos segundos: reintentamos.
  useEffect(() => {
    if (!justReturned || payment?.status === "pagado") return;
    const timer = setInterval(loadStatus, 3000);
    const stop = setTimeout(() => clearInterval(timer), 30000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [justReturned, payment?.status, loadStatus]);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const returnUrl = `${window.location.origin}/pago/${token}?session_id={CHECKOUT_SESSION_ID}`;
    const { data, error: fnError } = await supabase.functions.invoke("get-payment", {
      body: {
        token,
        action: "checkout",
        environment: getStripeEnvironment(),
        returnUrl,
      },
    });
    if (fnError || !data?.clientSecret) {
      throw new Error("No se pudo iniciar el pago. Inténtalo de nuevo o escríbenos por WhatsApp.");
    }
    return data.clientSecret as string;
  }, [token]);

  const wrapper = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pago de tu reserva | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <PaymentTestModeBanner />
      <div className="container mx-auto max-w-3xl px-4 pt-16 pb-20">
        <div className="mb-8 flex items-center gap-3">
          <Mountain className="h-7 w-7 text-primary" />
          <span className="font-heading text-lg font-bold">Naturaleza Sin Límites</span>
        </div>
        {children}
      </div>
    </div>
  );

  if (loading) {
    return wrapper(
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>,
    );
  }

  if (error || !payment) {
    return wrapper(
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="mb-2 font-heading text-2xl font-bold">Enlace no válido</h1>
        <p className="mb-6 text-muted-foreground">
          {error ?? "Este enlace de pago no existe o ha sido cancelado."}
        </p>
        <Button asChild>
          <Link to="/contacto">Contactar con el equipo</Link>
        </Button>
      </div>,
    );
  }

  if (payment.status === "pagado") {
    return wrapper(
      <div className="rounded-xl border border-primary/40 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="mb-2 font-heading text-2xl font-bold">¡Reserva confirmada!</h1>
        <p className="mb-6 text-muted-foreground">
          Hemos recibido tu pago de {formatAmount(payment.amountCents, payment.currency)}. Te hemos
          enviado un email con la confirmación y los detalles prácticos de la actividad.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>,
    );
  }

  if (payment.status !== "pendiente") {
    return wrapper(
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="mb-2 font-heading text-2xl font-bold">
          {payment.status === "caducado" ? "Enlace caducado" : "Cobro no disponible"}
        </h1>
        <p className="mb-6 text-muted-foreground">
          Escríbenos y te generamos un enlace nuevo en unos minutos.
        </p>
        <Button asChild>
          <Link to="/contacto">Solicitar nuevo enlace</Link>
        </Button>
      </div>,
    );
  }

  return wrapper(
    <div className="space-y-6">
      {justReturned && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Estamos confirmando tu pago. Esto puede tardar unos segundos...
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Resumen de tu reserva</p>
        <h1 className="mt-1 font-heading text-2xl font-bold">{payment.activity}</h1>
        <p className="mt-1 text-muted-foreground">{payment.concept}</p>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Fecha: {payment.date ?? "por concretar"}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Personas: {payment.people ?? "por concretar"}
          </span>
        </div>

        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-muted-foreground">Total a pagar</span>
          <span className="font-heading text-3xl font-bold text-primary">
            {formatAmount(payment.amountCents, payment.currency)}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">IVA incluido.</p>
      </div>

      {!checkoutOpen ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Pago seguro. Al completarlo, tu plaza queda confirmada automáticamente. Consulta las
            condiciones y la política de cancelación en{" "}
            <Link to="/terminos" className="text-primary underline">
              términos y condiciones
            </Link>
            .
          </p>
          <Button
            className="mt-5 w-full transition-all duration-300 active:scale-95"
            size="lg"
            onClick={() => setCheckoutOpen(true)}
          >
            Pagar {formatAmount(payment.amountCents, payment.currency)} y confirmar
          </Button>
        </div>
      ) : (
        <div id="checkout" className="rounded-xl border border-border bg-card p-2">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </div>,
  );
}
