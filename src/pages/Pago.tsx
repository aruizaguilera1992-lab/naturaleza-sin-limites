import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { activityProfiles, getActivityCatalogImage } from "@/data/activityProfiles";
import logoAsset from "@/assets/logo.png";
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

const DESIGN_PAYMENT: Payment = {
  kind: "senal",
  totalCents: 18000,
  environment: "sandbox",
  sessionState: null,
  bookingState: null,
  hasEvent: true,
  concept: "Señal de reserva",
  amountCents: 5400,
  currency: "eur",
  status: "pendiente",
  paidAt: null,
  activity: "Río Guadalmina",
  date: "2026-10-17",
  people: "2",
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("es-ES");

const getVerifiedActivityImage = (activity?: string) => {
  if (!activity) return null;
  const match = activityProfiles.find((profile) => normalize(profile.name) === normalize(activity));
  return match ? getActivityCatalogImage(match.category, match.slug) : null;
};

export default function Pago() {
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isDesignDemo = import.meta.env.DEV && token === "demo";
  const designState = searchParams.get("state");
  const justReturned = !!searchParams.get("session_id") || (isDesignDemo && designState === "processing");

  const demoPayment = designState === "paid"
    ? { ...DESIGN_PAYMENT, status: "pagado", bookingState: "confirmada" as const }
    : designState === "expired"
      ? { ...DESIGN_PAYMENT, status: "caducado" }
      : designState === "processing"
        ? { ...DESIGN_PAYMENT, sessionState: "confirmando" as const }
        : DESIGN_PAYMENT;

  const [payment, setPayment] = useState<Payment | null>(isDesignDemo ? demoPayment : null);
  const [loading, setLoading] = useState(!isDesignDemo);
  const [error, setError] = useState<"invalid" | "not_found" | "load" | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pollExpired, setPollExpired] = useState(false);

  const loadStatus = useCallback(async () => {
    if (isDesignDemo) {
      setPayment(demoPayment);
      setLoading(false);
      return;
    }
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
  }, [token, justReturned, isDesignDemo, designState]);

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
    <p className="text-center text-sm leading-6 text-muted-foreground">
      <Link to="/terminos" className="underline underline-offset-4 hover:text-primary">Términos y condiciones</Link>
      {" · "}
      <Link to="/privacidad" className="underline underline-offset-4 hover:text-primary">Privacidad</Link>
      {" · "}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
        Ayuda por WhatsApp
      </a>
    </p>
  );

  const wrapper = (children: React.ReactNode) => (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Completa tu reserva | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PaymentTestModeBanner />
      <div className="mx-auto flex min-h-[calc(100vh-41px)] max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-5 flex min-h-14 items-center justify-between gap-4 lg:mb-7">
          <Link to="/" aria-label="Naturaleza Sin Límites, inicio" className="inline-flex min-h-12 items-center rounded-md focus-visible:ring-offset-background">
            <img src={logoAsset} alt="Naturaleza Sin Límites" className="h-16 w-auto object-contain sm:h-20" />
          </Link>
          <div className="flex flex-col items-end gap-2">
            {isDesignDemo && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Vista de diseño · sin pago
              </span>
            )}
            {payment?.environment === "sandbox" && !isDesignDemo && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Pago de prueba
              </span>
            )}
          </div>
        </header>
        <div className="grid flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-card lg:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)]">
          <PaymentVisual activity={payment?.activity} image={getVerifiedActivityImage(payment?.activity)} />
          <section className="flex min-w-0 flex-col justify-center px-5 py-8 sm:px-9 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-xl space-y-6">
              {children}
              {help}
            </div>
          </section>
        </div>
      </div>
    </main>
  );

  const card = (icon: React.ReactNode, title: string, body: React.ReactNode, actions?: React.ReactNode) =>
    wrapper(
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">{icon}</div>
        <h1 className="mb-3 font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">{title}</h1>
        <div className="mx-auto mb-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">{body}</div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
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
      <div className="flex flex-col items-center justify-center gap-5 py-20 text-center" aria-live="polite">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Preparando tu pago</h1>
        <p className="text-base text-muted-foreground">Estamos cargando los datos de tu reserva.</p>
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
      <div>
        <p className="mb-2 text-sm font-semibold uppercase text-primary">Pago de reserva</p>
        <h1 className="font-heading text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-[3.25rem]">Completa tu reserva</h1>
        <p className="mt-5 font-heading text-xl font-bold leading-snug text-foreground">{payment.activity}</p>

        <div className="mt-4 grid gap-3 text-base text-muted-foreground sm:grid-cols-2">
          {date && (
            <span className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
              {payment.hasEvent ? date : `Fecha solicitada: ${date}`}
            </span>
          )}
          {payment.people && (
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 shrink-0 text-primary" /> {payment.people} participante(s)
            </span>
          )}
        </div>

        <dl className="mt-7 space-y-3 border-y border-border py-6 text-sm">
          <div>
            <dt className="text-sm font-semibold uppercase text-muted-foreground">Pagas ahora</dt>
            <dd className="mt-1 font-heading text-[2.75rem] font-extrabold leading-none text-primary sm:text-5xl">{amount}</dd>
          </div>
          {isDeposit && payment.totalCents !== null && (
            <div className="flex justify-between gap-4 pt-2 text-muted-foreground">
              <dt>Señal — 30 % del total</dt><dd className="font-semibold text-foreground">{amount}</dd>
            </div>
          )}
          {isDeposit && payment.totalCents !== null && (
            <div className="flex justify-between gap-4 text-muted-foreground">
              <dt>Precio total</dt><dd>{formatAmount(payment.totalCents, payment.currency)}</dd>
            </div>
          )}
          {balance !== null && (
            <div className="flex justify-between gap-4 text-muted-foreground">
              <dt>Saldo el día de la actividad</dt>
              <dd>{formatAmount(balance, payment.currency)}</dd>
            </div>
          )}
        </dl>
        {!payment.hasEvent && payment.kind === "senal" && (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            La fecha solicitada queda pendiente de confirmación por nuestra parte.
          </p>
        )}
      </div>

      {checkoutError && (
        <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm leading-6 text-foreground">
          {checkoutError}
        </div>
      )}

      {!checkoutOpen ? (
        <div>
          <Button
            className="w-full text-base normal-case sm:text-lg"
            size="lg"
            disabled={isDesignDemo}
            onClick={() => { setCheckoutError(null); setCheckoutKey((k) => k + 1); setCheckoutOpen(true); }}
          >
            {isDesignDemo ? `${payLabel} · deshabilitado` : checkoutError ? `Reintentar · ${payLabel}` : payLabel}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            Pago seguro con Stripe
          </p>
        </div>
      ) : (
        <div id="checkout" className="overflow-hidden rounded-md border border-border bg-card p-2">
          <EmbeddedCheckoutProvider key={checkoutKey} stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </>,
  );
}

function PaymentVisual({ activity, image }: { activity?: string; image: string | null }) {
  return (
    <aside className="relative min-h-56 overflow-hidden bg-secondary sm:min-h-72 lg:min-h-[680px]">
      {image ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-background" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/10" />
      <div className="relative flex h-full min-h-56 flex-col justify-end p-6 sm:min-h-72 sm:p-9 lg:min-h-[680px] lg:p-12">
        <p className="mb-3 text-sm font-semibold uppercase text-primary">Naturaleza Sin Límites</p>
        <p className="max-w-lg font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
          Tu próxima aventura empieza aquí
        </p>
        {activity && <p className="mt-4 text-base font-semibold text-foreground/90 sm:text-lg">{activity}</p>}
      </div>
    </aside>
  );
}
