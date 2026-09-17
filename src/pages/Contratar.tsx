import { useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { AlertTriangle, Mountain, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getPlanItem } from "@/data/planCatalog";

const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contratar() {
  const { priceId = "" } = useParams();
  const plan = useMemo(() => getPlanItem(priceId), [priceId]);

  const [form, setForm] = useState({ name: "", email: "", phone: "", rgpd: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-plan-checkout", {
      body: {
        priceId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        rgpd: true,
        returnUrl: `${window.location.origin}/gracias?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(
        "No hemos podido iniciar el pago ahora mismo. Inténtalo en unos minutos o escríbenos por WhatsApp.",
      );
    }
    return data.clientSecret as string;
  }, [priceId, form.name, form.email, form.phone]);

  const wrapper = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contratar {plan?.name ?? "plan"} | Naturaleza Sin Límites</title>
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

  if (!plan) {
    return wrapper(
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="mb-2 font-heading text-2xl font-bold">Plan no disponible</h1>
        <p className="mb-6 text-muted-foreground">
          Este plan ya no está a la venta. Escríbenos y te proponemos la mejor alternativa.
        </p>
        <Button asChild>
          <Link to="/vertigo-sapiens">Ver planes disponibles</Link>
        </Button>
      </div>,
    );
  }

  const startCheckout = () => {
    if (form.name.trim().length < 2) return setFormError("Escribe tu nombre completo.");
    if (!emailRegex.test(form.email.trim())) return setFormError("Revisa tu email.");
    if (!phoneRegex.test(form.phone.trim())) return setFormError("Revisa tu teléfono.");
    if (!form.rgpd) return setFormError("Debes aceptar la política de privacidad.");
    setFormError(null);
    setCheckoutOpen(true);
  };

  return wrapper(
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Tu elección</p>
        <h1 className="mt-1 font-heading text-2xl font-bold">{plan.name}</h1>
        <p className="mt-1 text-muted-foreground">{plan.detail}</p>
        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-muted-foreground">
            {plan.recurring ? "Cuota mensual" : "Importe total"}
          </span>
          <span className="font-heading text-3xl font-bold text-primary">{plan.priceLabel}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          IVA incluido.{" "}
          {plan.recurring
            ? "La cuota se renueva cada mes y puedes cancelarla cuando quieras avisándonos."
            : "Pago único, sin suscripción."}
        </p>
      </div>

      {!checkoutOpen ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">Tus datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nombre y apellidos</Label>
              <Input
                id="name"
                className="mt-1 text-foreground"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="mt-1 text-foreground"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                className="mt-1 text-foreground"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
              />
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox
              checked={form.rgpd}
              onCheckedChange={(v) => setForm({ ...form, rgpd: v === true })}
              className="mt-0.5"
            />
            <span>
              He leído y acepto la{" "}
              <Link to="/privacidad" className="text-primary underline">
                política de privacidad
              </Link>{" "}
              y los{" "}
              <Link to="/terminos" className="text-primary underline">
                términos y condiciones
              </Link>
              .
            </span>
          </label>

          {formError && <p className="mt-3 text-sm text-destructive">{formError}</p>}

          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Pago seguro. Al completarlo recibirás un correo de confirmación con los pasos para darte
            de alta en la plataforma de entrenamiento.
          </p>

          <Button
            className="mt-5 w-full transition-all duration-300 active:scale-95"
            size="lg"
            onClick={startCheckout}
          >
            Continuar al pago
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
