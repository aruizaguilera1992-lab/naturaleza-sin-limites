import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/naturaleza-sin-limites-logo.webp.asset.json";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

type Payment = {
  kind: "senal" | "manual";
  totalCents: number | null;
  environment: string;
  sessionState: "procesando" | "confirmando" | null;
  bookingState: "confirmada" | "fecha_pendiente" | "en_revision" | null;
  hasEvent: boolean;
  concept: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: string | null;
  activity: string;
  date: string | null;
  people: string | null;
};

const WHATSAPP = "https://wa.me/34685609542?text=" +
  encodeURIComponent("Hola, tengo una duda sobre el pago de mi reserva.");

const formatAmount = (cents: number, currency: string) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

const formatDate = (value: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const hasTime = value.includes("T");
  return d.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" } : {}),
  });
};

const POLL_MS = 3000;
const POLL_LIMIT_MS = 45000;

export default function Pago() {
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const justReturned = !!searchParams.get("session_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"invalid" | "not_found" | "load" | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pollExpired, setPollExpired] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!/^[a-f0-9]{16,80}$/.test(token)) {
      setError("invalid");
      setLoading(false);
      return;
    }
    const { data, error: fnError } = await supabase.functions.invoke("get-payment", {
      body: { token, action: "status", checkSession: justReturned },
    });
    if (data?.payment) {
      setPayment(data.payment as Payment);
      setError(null);
    } else {
      const status = (fnError as { context?: { status?: number } } | null)?.context?.status;
      setError(status === 404 ? "not_found" : "load");
    }
    setLoading(false);
  }, [token, justReturned]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Webhook confirmation can take a few seconds: limited polling.
  const waiting = justReturned && payment?.status === "pendiente";
  useEffect(() => {
    if (!waiting) return;
    setPollExpired(false);
    const timer = setInterval(loadStatus, POLL_MS);
    const stop = setTimeout(() => { clearInterval(timer); setPollExpired(true); }, POLL_LIMIT_MS);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [waiting, loadStatus]);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const returnUrl = `${window.location.origin}/pago/${token}?session_id={CHECKOUT_SESSION_ID}`;
    const { data } = await supabase.functions.invoke("get-payment", {
      body: { token, action: "checkout", returnUrl },
    });
    if (data?.clientSecret) return data.clientSecret as string;
    if (data?.error === "already_paid") {
      await loadStatus();
      setCheckoutOpen(false);
      throw new Error("already_paid");
    }
    setCheckoutOpen(false);
    setCheckoutError(
      "No hemos podido abrir el pago. No se ha realizado ningún cargo: puedes reintentarlo; si ya habías iniciado un pago, se retomará el mismo.",
    );
    throw new Error("checkout_failed");
  }, [token, loadStatus]);

  const help = (
    <p className="text-center text-xs text-muted-foreground">
      <Link to="/terminos" className="underline hover:text-primary">Términos y condiciones</Link>
      {" · "}
      <Link to="/privacidad" className="underline hover:text-primary">Privacidad</Link>
      {" · "}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
        Ayuda por WhatsApp
      </a>
    </p>
  );

  const wrapper = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Completa tu reserva | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PaymentTestModeBanner />
      <div className="container mx-auto max-w-2xl px-4 pt-10 pb-16">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <img src={logoAsset.url} alt="" className="h-14 w-auto" />
          <span className="font-heading text-lg font-bold text-foreground">Naturaleza Sin Límites</span>
        </Link>
        {payment?.environment === "sandbox" && (
          <p className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            Modo de pruebas: este enlace no realiza cobros reales.
          </p>
        )}
        <div className="space-y-6">
          {children}
          {help}
        </div>
      </div>
    </div>
  );

  const card = (icon: React.ReactNode, title: string, body: React.ReactNode, actions?: React.ReactNode) =>
    wrapper(
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex justify-center">{icon}</div>
        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">{title}</h1>
        <div className="mb-6 text-muted-foreground">{body}</div>
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      </div>,
    );

  const contactButtons = (
    <>
      <Button asChild><a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a></Button>
      <Button asChild variant="outline"><Link to="/contacto">Contacto</Link></Button>
    </>
  );

  if (loading) {
    return wrapper(
      <div className="flex justify-center py-20" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Cargando</span>
      </div>,
    );
  }

  const warn = <AlertTriangle className="h-8 w-8 text-primary" />;

  if (error === "invalid" || error === "not_found" || (!payment && error !== "load")) {
    return card(warn, "Enlace no válido",
      "Este enlace de pago no existe o está incompleto. Revisa que lo hayas copiado entero.", contactButtons);
  }
  if (error === "load" || !payment) {
    return card(warn, "No hemos podido cargar el pago",
      "Puede ser un problema temporal de conexión. No se ha realizado ningún cargo.",
      <>
        <Button onClick={() => { setLoading(true); loadStatus(); }}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
        </Button>
        {contactButtons}
      </>);
  }

  const amount = formatAmount(payment.amountCents, payment.currency);
  const isDeposit = payment.kind === "senal";

  // ---- Paid: payment state and booking state shown separately ----
  if (payment.status === "pagado") {
    const ok = <CheckCircle2 className="h-10 w-10 text-primary" />;
    const paidLine = <p>Hemos recibido tu pago de {amount}.</p>;
    if (payment.bookingState === "confirmada") {
      return card(ok, "Reserva confirmada",
        <>{paidLine}<p className="mt-2">Tu plaza en la salida está confirmada.</p></>,
        <Button asChild variant="outline"><Link to="/">Volver al inicio</Link></Button>);
    }
    if (payment.bookingState === "en_revision") {
      return card(<Clock className="h-10 w-10 text-primary" />, "Pago recibido · estamos revisando tu reserva",
        <>{paidLine}<p className="mt-2">Estamos comprobando la disponibilidad de plazas y te contactaremos. No necesitas volver a pagar.</p></>,
        contactButtons);
    }
    if (payment.bookingState === "fecha_pendiente") {
      return card(ok, "Pago recibido · fecha pendiente de confirmación",
        <>{paidLine}<p className="mt-2">Te contactaremos para confirmar la fecha. No necesitas volver a pagar.</p></>,
        contactButtons);
    }
    return card(ok, "Pago recibido", <>{paidLine}<p className="mt-2">No necesitas volver a pagar.</p></>,
      <Button asChild variant="outline"><Link to="/">Volver al inicio</Link></Button>);
  }

  if (payment.status !== "pendiente") {
    const title = payment.status === "caducado" ? "Enlace caducado"
      : payment.status === "cancelado" ? "Cobro cancelado" : "Cobro no disponible";
    return card(warn, title, "Este enlace ya no admite pagos. Escríbenos y te ayudamos.", contactButtons);
  }

  // ---- Returned from checkout but not confirmed yet ----
  if (justReturned && payment.sessionState) {
    const processing = payment.sessionState === "procesando";
    return card(
      pollExpired ? <Clock className="h-8 w-8 text-primary" /> : <Loader2 className="h-8 w-8 animate-spin text-primary" />,
      processing ? "Pago en procesamiento" : "Confirmando tu pago",
      processing
        ? "Tu método de pago tarda en completarse. Actualizaremos el estado cuando se confirme; no vuelvas a pagar."
        : pollExpired
          ? "Aún no tenemos la confirmación. No vuelvas a pagar: actualiza en unos minutos o contáctanos."
          : "Estamos verificando el pago. Esto suele tardar unos segundos.",
      (pollExpired || processing) && (
        <>
          <Button onClick={loadStatus}><RefreshCw className="mr-2 h-4 w-4" /> Actualizar estado</Button>
          {contactButtons}
        </>
      ),
    );
  }

  const date = formatDate(payment.date);
  const payLabel = isDeposit ? `Pagar señal de ${amount}` : `Pagar ${amount}`;
  const balance = isDeposit && payment.totalCents !== null && payment.totalCents >= payment.amountCents
    ? payment.totalCents - payment.amountCents : null;

  return wrapper(
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Completa tu reserva</h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Actividad</p>
        <p className="font-heading text-lg font-semibold text-foreground">{payment.activity}</p>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {date && (
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {payment.hasEvent ? date : `Fecha solicitada: ${date}`}
            </span>
          )}
          {payment.people && (
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> {payment.people} participante(s)
            </span>
          )}
        </div>

        <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          {isDeposit && payment.totalCents !== null && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Precio total</dt><dd>{formatAmount(payment.totalCents, payment.currency)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <dt className="text-foreground">{isDeposit ? "Señal a pagar ahora — 30 %" : payment.concept}</dt>
            <dd className="font-heading text-3xl font-bold text-primary">{amount}</dd>
          </div>
          {balance !== null && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Saldo pendiente el día de la actividad</dt>
              <dd>{formatAmount(balance, payment.currency)}</dd>
            </div>
          )}
        </dl>
        {!payment.hasEvent && payment.kind === "senal" && (
          <p className="mt-3 text-xs text-muted-foreground">
            La fecha solicitada queda pendiente de confirmación por nuestra parte.
          </p>
        )}
      </div>

      {checkoutError && (
        <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-foreground">
          {checkoutError}
        </div>
      )}

      {!checkoutOpen ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Pago seguro procesado por Stripe. Antes de pagar, revisa los términos y la política de cancelación.
          </p>
          <Button
            className="mt-5 w-full transition-all duration-300 active:scale-95"
            size="lg"
            onClick={() => { setCheckoutError(null); setCheckoutKey((k) => k + 1); setCheckoutOpen(true); }}
          >
            {checkoutError ? `Reintentar · ${payLabel}` : payLabel}
          </Button>
        </div>
      ) : (
        <div id="checkout" className="rounded-xl border border-border bg-card p-2">
          <EmbeddedCheckoutProvider key={checkoutKey} stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </>,
  );
}
