import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, CalendarDays, ShieldCheck, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getActivityCatalogImage, getActivityProfile, PENDING } from "@/data/activityProfiles";
import { ActivityEventPicker } from "@/components/actividades/ActivityEventPicker";
import { useActivityEvents } from "@/hooks/useActivityEvents";
import logoAsset from "@/assets/logo.png";


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
  const [searchParams] = useSearchParams();
  const activity = useMemo(() => getActivityProfile(category, slug), [category, slug]);
  const { events, loading: eventsLoading } = useActivityEvents({ category, slug });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
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

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  // Preselect the outing coming from the calendar link, once it is loaded.
  const requestedEventId = searchParams.get("evento");
  useEffect(() => {
    if (!requestedEventId) return;
    const match = events.find((event) => event.id === requestedEventId && !event.isFull);
    if (match) setSelectedEventId(match.id);
  }, [requestedEventId, events]);

  // A chosen outing fixes the date; free dates keep the manual field.
  useEffect(() => {
    if (selectedEvent) setForm((prev) => ({ ...prev, date: toDateInput(selectedEvent.startDate) }));
  }, [selectedEvent]);

  const maxPeople = selectedEvent ? Math.min(MAX_PEOPLE, selectedEvent.freeSeats) : MAX_PEOPLE;
  const unitPrice = selectedEvent?.pricePerPerson ?? activity?.priceValue ?? 0;
  const total = unitPrice * form.participants;
  const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;

  const wrapper = (children: React.ReactNode) => (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Reservar {activity?.name ?? "actividad"} | Naturaleza Sin Límites</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <PaymentTestModeBanner />
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-5 flex min-h-14 items-center lg:mb-7">
          <Link to="/" aria-label="Naturaleza Sin Límites, inicio" className="inline-flex min-h-12 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <img src={logoAsset} alt="Naturaleza Sin Límites" className="h-16 w-auto object-contain sm:h-20" />
          </Link>
        </header>
        <div className="grid overflow-hidden rounded-lg border border-border bg-card shadow-card lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
          <aside className="relative min-h-56 overflow-hidden bg-secondary sm:min-h-72 lg:min-h-[780px]">
            {activity && getActivityCatalogImage(activity.category, activity.slug) ? (
              <img src={getActivityCatalogImage(activity.category, activity.slug) ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/10" />
            <div className="relative flex h-full min-h-56 flex-col justify-end p-6 sm:min-h-72 sm:p-9 lg:min-h-[780px] lg:p-12">
              <p className="mb-3 text-sm font-semibold uppercase text-primary">{activity?.categoryLabel ?? "Naturaleza Sin Límites"}</p>
              <p className="max-w-lg font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">Reserva tu próxima aventura</p>
              {activity && <p className="mt-3 text-lg font-semibold text-foreground/90">{activity.name}</p>}
            </div>
          </aside>
          <section className="min-w-0 px-5 py-8 sm:px-9 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-2xl">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );

  if (!activity || !activity.priceValue || activity.price === PENDING) {
    return wrapper(
      <div className="flex min-h-[520px] flex-col items-center justify-center py-10 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10"><AlertTriangle className="h-8 w-8 text-primary" /></span>
        <h1 className="mb-3 font-heading text-3xl font-extrabold sm:text-4xl">Reserva no disponible online</h1>
        <p className="mb-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
          Esta actividad todavía no se puede reservar y pagar desde la web. Escríbenos y la
          organizamos contigo.
        </p>
        <Button size="lg" asChild>
          <Link to="/contacto">Contactar</Link>
        </Button>
      </div>,
    );
  }

  const submit = async () => {
    if (!form.date) return setError("Elige una fecha para la actividad.");
    if (new Date(form.date) < new Date(new Date().toDateString()))
      return setError("La fecha debe ser futura.");
    if (selectedEvent && form.participants > selectedEvent.freeSeats)
      return setError(`Esa salida solo tiene ${selectedEvent.freeSeats} plaza(s) libres.`);
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
        eventId: selectedEventId,
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
        selectedEventId
          ? "No hemos podido bloquear la plaza en esa salida. Puede que acaben de ocuparse: prueba con otra fecha."
          : "No hemos podido preparar el pago ahora mismo. Inténtalo en unos minutos o escríbenos por WhatsApp.",
      );
      return;
    }
    navigate(`/pago/${data.token}`);
  };

  return wrapper(
    <div className="space-y-8">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase text-primary">
          {activity.categoryLabel} · {activity.zone}
        </p>
        <h1 className="font-heading text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-[3.25rem]">Completa tu reserva</h1>
        <p className="mt-4 font-heading text-xl font-bold text-foreground">{activity.name}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-base text-muted-foreground">
          {form.date && <span className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />{new Date(`${form.date}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>}
          <span className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />{form.participants} participante(s)</span>
        </div>
        <dl className="mt-7 space-y-3 border-y border-border py-6 text-sm">
          <div>
            <dt className="text-sm font-semibold uppercase text-muted-foreground">Pagas ahora · señal 30 %</dt>
            <dd className="mt-1 font-heading text-[2.75rem] font-extrabold leading-none text-primary sm:text-5xl">{euros(deposit)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-muted-foreground">
            <dt>Precio total · {euros(unitPrice)} × {form.participants}</dt>
            <dd>{euros(total)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-muted-foreground"><dt>Saldo el día de la actividad</dt><dd>{euros(total - deposit)}</dd></div>
          <div className="flex justify-between gap-4 text-muted-foreground"><dt>Impuestos</dt><dd>IVA incluido</dd></div>
        </dl>
      </header>

      <div>
        <h2 className="mb-5 font-heading text-2xl font-bold">Elige los detalles</h2>

        <div className="mb-7">
          <Label className="mb-3 block text-base">Salidas programadas</Label>
          <ActivityEventPicker
            events={events}
            loading={eventsLoading}
            selectedId={selectedEventId}
            onSelect={setSelectedEventId}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="date">Fecha deseada</Label>
            <Input
              id="date"
              type="date"
              className="mt-2 min-h-12 text-foreground"
              value={form.date}
              disabled={Boolean(selectedEvent)}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {selectedEvent && (
              <p className="mt-1 text-xs text-muted-foreground">
                Fecha fijada por la salida programada que has elegido.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="participants">Participantes</Label>
            <Input
              id="participants"
              type="number"
              min={1}
              max={maxPeople}
              className="mt-2 min-h-12 text-foreground"
              value={form.participants}
              onChange={(e) =>
                setForm({
                  ...form,
                  participants: Math.min(maxPeople, Math.max(1, Number(e.target.value) || 1)),
                })
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedEvent
                ? `Quedan ${selectedEvent.freeSeats} plaza(s) en esta salida.`
                : null}
            </p>
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
              className="mt-2 min-h-12 text-foreground"
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
              className="mt-2 min-h-12 text-foreground"
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
              className="mt-2 min-h-12 text-foreground"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="message">Comentarios (opcional)</Label>
            <Textarea
              id="message"
              className="mt-2 min-h-24 text-foreground"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Experiencia previa, alergias, horario preferido..."
            />
          </div>
        </div>

        <label className="mt-6 flex min-h-12 items-start gap-3 text-sm leading-6 text-muted-foreground">
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

        {error && <p role="alert" className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-foreground">{error}</p>}

        <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Pago seguro. Revisamos la disponibilidad de la fecha tras el pago: si no pudiéramos
          realizar la salida, te devolvemos la señal íntegra.
        </p>

        <Button
          className="mt-5 min-h-12 w-full text-base transition-all duration-300 active:scale-95 sm:text-lg"
          size="lg"
          disabled={submitting}
          onClick={submit}
        >
          {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Pagar señal de {euros(deposit)}
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Pago seguro con Stripe</p>
      </div>
    </div>,
  );
}
