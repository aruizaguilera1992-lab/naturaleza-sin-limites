import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, Mountain, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getActivityProfile, PENDING } from "@/data/activityProfiles";
import { TrustBar } from "@/components/TrustBar";
import { ActivityEventPicker } from "@/components/actividades/ActivityEventPicker";
import { useActivityEvents } from "@/hooks/useActivityEvents";


const DEPOSIT_RATE = 0.3;
const MAX_PEOPLE = 6;
const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const euros = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function ReservarActividad() {
  const { category = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const activity = useMemo(() => getActivityProfile(category, slug), [category, slug]);

  const [form, setForm] = useState({
    participants: 2,
    date: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    rgpd: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = activity?.priceValue ?? 0;
  const total = unitPrice * form.participants;
  const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;

  const wrapper = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Reservar {activity?.name ?? "actividad"} | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex, follow" />
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

  if (!activity || !activity.priceValue || activity.price === PENDING) {
    return wrapper(
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="mb-2 font-heading text-2xl font-bold">Reserva no disponible online</h1>
        <p className="mb-6 text-muted-foreground">
          Esta actividad todavía no se puede reservar y pagar desde la web. Escríbenos y la
          organizamos contigo.
        </p>
        <Button asChild>
          <Link to="/contacto">Contactar</Link>
        </Button>
      </div>,
    );
  }

  const submit = async () => {
    if (!form.date) return setError("Elige una fecha para la actividad.");
    if (new Date(form.date) < new Date(new Date().toDateString()))
      return setError("La fecha debe ser futura.");
    if (form.name.trim().length < 2) return setError("Escribe tu nombre completo.");
    if (!emailRegex.test(form.email.trim())) return setError("Revisa tu email.");
    if (!phoneRegex.test(form.phone.trim())) return setError("Revisa tu teléfono.");
    if (!form.rgpd) return setError("Debes aceptar la política de privacidad.");
    setError(null);
    setSubmitting(true);

    const { data, error: fnError } = await supabase.functions.invoke("create-activity-deposit", {
      body: {
        category,
        slug,
        participants: form.participants,
        preferredDate: form.date,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim() || null,
        rgpd: true,
        environment: getStripeEnvironment(),
        origin: window.location.origin,
      },
    });

    setSubmitting(false);
    if (fnError || !data?.token) {
      setError(
        "No hemos podido preparar el pago ahora mismo. Inténtalo en unos minutos o escríbenos por WhatsApp.",
      );
      return;
    }
    navigate(`/pago/${data.token}`);
  };

  return wrapper(
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {activity.categoryLabel} · {activity.zone}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold">{activity.name}</h1>
        <p className="mt-1 text-muted-foreground">{activity.shortDescription}</p>
        <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {euros(unitPrice)} × {form.participants} persona(s)
            </span>
            <span className="font-semibold">{euros(total)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Señal a pagar ahora (30%)</span>
            <span className="font-heading text-2xl font-bold text-primary">{euros(deposit)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            El resto ({euros(total - deposit)}) se abona el día de la actividad. IVA incluido.
          </p>
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <TrustBar variant="compact" />
        </div>
      </div>


      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-heading text-lg font-bold">Tu reserva</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="date">Fecha deseada</Label>
            <Input
              id="date"
              type="date"
              className="mt-1 text-foreground"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="participants">Participantes</Label>
            <Input
              id="participants"
              type="number"
              min={1}
              max={MAX_PEOPLE}
              className="mt-1 text-foreground"
              value={form.participants}
              onChange={(e) =>
                setForm({
                  ...form,
                  participants: Math.min(MAX_PEOPLE, Math.max(1, Number(e.target.value) || 1)),
                })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Para grupos de más de {MAX_PEOPLE} personas,{" "}
              <Link to="/contacto" className="text-primary underline">
                escríbenos
              </Link>
              .
            </p>
          </div>
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
          <div className="sm:col-span-2">
            <Label htmlFor="message">Comentarios (opcional)</Label>
            <Textarea
              id="message"
              className="mt-1 text-foreground"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Experiencia previa, alergias, horario preferido..."
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

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Pago seguro. Revisamos la disponibilidad de la fecha tras el pago: si no pudiéramos
          realizar la salida, te devolvemos la señal íntegra.
        </p>

        <Button
          className="mt-5 w-full transition-all duration-300 active:scale-95"
          size="lg"
          disabled={submitting}
          onClick={submit}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pagar señal de {euros(deposit)}
        </Button>
      </div>
    </div>,
  );
}
