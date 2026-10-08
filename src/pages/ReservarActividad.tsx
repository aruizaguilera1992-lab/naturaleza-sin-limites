import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, CalendarDays, CheckCircle2, Info, ShieldCheck, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getActivityCatalogImage, getActivityProfile, PENDING } from "@/data/activityProfiles";
import { ActivityEventPicker } from "@/components/actividades/ActivityEventPicker";
import { useActivityEvents } from "@/hooks/useActivityEvents";
import logoAsset from "@/assets/logo-integrated.png";


const DEPOSIT_RATE = 0.3;
const MAX_PEOPLE = 6;
const phoneRegex = /^[+]?[\d\s()./-]{9,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const euros = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromDateInput = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day, 12);
};

export default function ReservarActividad() {
  const { category = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activity = useMemo(() => getActivityProfile(category, slug), [category, slug]);
  const { events, loading: eventsLoading, error: eventsError, reload: reloadEvents } = useActivityEvents({ category, slug });

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
  const [requestSent, setRequestSent] = useState(false);
  const [eventNotice, setEventNotice] = useState<string | null>(null);

  // Only a loaded, bookable outing counts as selected. Anything else is a request.
  const selectedEvent =
    events.find((event) => event.id === selectedEventId && !event.isFull) ?? null;
  const isEventBooking = Boolean(selectedEvent) && !eventsLoading && !eventsError;

  // Outing coming from the calendar link: select it only if it is still bookable.
  const requestedEventId = searchParams.get("evento");
  const [requestHandled, setRequestHandled] = useState(false);
  useEffect(() => {
    if (!requestedEventId || requestHandled || eventsLoading) return;
    setRequestHandled(true);
    if (eventsError) {
      setEventNotice("No hemos podido comprobar la salida que elegiste. Puedes solicitar una fecha sin pago o reintentarlo más tarde.");
      return;
    }
    const match = events.find((event) => event.id === requestedEventId);
    if (match && !match.isFull) {
      chooseEvent(match.id);
    } else {
      setEventNotice(
        match
          ? "La salida que elegiste está completa. Puedes elegir otra salida o solicitar una salida privada (sin pago); aunque propongas la misma fecha, será una solicitud distinta pendiente de confirmación."
          : "La salida que elegiste ya no está disponible (ha pasado, se ha cancelado o no existe). Puedes elegir otra salida o solicitar una fecha sin pago.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedEventId, requestHandled, eventsLoading, eventsError, events]);

  /** Selecting an outing fixes its real date; switching to a request clears it. */
  function chooseEvent(eventId: string | null) {
    setError(null);
    const ev = eventId ? events.find((e) => e.id === eventId && !e.isFull) : null;
    if (ev) {
      setSelectedEventId(ev.id);
      setForm((prev) => ({ ...prev, date: toDateInput(ev.startDate) }));
    } else {
      setSelectedEventId(null);
      setForm((prev) => ({ ...prev, date: "" }));
    }
  }

  const maxPeople = selectedEvent ? Math.min(MAX_PEOPLE, selectedEvent.freeSeats) : MAX_PEOPLE;
  const participantOptions = maxPeople < 2 ? [1] : [2, 3, 4, 5, 6].filter((n) => n <= MAX_PEOPLE);
  // Keep the chosen participant count within the available seats and visible options.
  useEffect(() => {
    setForm((prev) => {
      if (prev.participants > maxPeople) return { ...prev, participants: Math.max(1, maxPeople) };
      if (maxPeople >= 2 && prev.participants < 2) return { ...prev, participants: 2 };
      return prev;
    });
  }, [maxPeople]);

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
            <img src={logoAsset} alt="Naturaleza Sin Límites" className="h-20 w-auto object-contain sm:h-24" />
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
              <p className="max-w-lg font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">Tu próxima aventura te espera</p>
              <p className="mt-2 max-w-md text-base text-foreground/80 sm:text-lg">Elige tu fecha, reserva tu plaza y solo piensa en la montaña.</p>
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

  const readFnError = async (fnError: unknown): Promise<{ reason?: string; error?: string } | null> => {
    try {
      const ctx = (fnError as { context?: Response } | null)?.context;
      return ctx && typeof ctx.json === "function" ? await ctx.json() : null;
    } catch {
      return null;
    }
  };

  const validate = () => {
    if (!form.date) return isEventBooking ? "Elige una salida." : "Elige la fecha que prefieres.";
    if (new Date(`${form.date}T23:59:59`) < new Date()) return "La fecha debe ser futura.";
    if (selectedEvent && form.participants > selectedEvent.freeSeats)
      return `Esa salida solo tiene ${selectedEvent.freeSeats} plaza(s) libres.`;
    if (form.name.trim().length < 2) return "Escribe tu nombre completo.";
    if (!emailRegex.test(form.email.trim())) return "Revisa tu email.";
    if (!phoneRegex.test(form.phone.trim())) return "Revisa tu teléfono.";
    if (!form.rgpd) return "Debes aceptar la política de privacidad.";
    return null;
  };

  const submit = async () => {
    if (submitting) return;
    const problem = validate();
    if (problem) return setError(problem);
    // A previously chosen outing that vanished on reload must never be sent
    // silently as a custom-date request with its inherited date.
    if (selectedEventId && !isEventBooking) {
      chooseEvent(null);
      setEventNotice("La salida que habías elegido ya no está disponible. Elige otra salida o indica una fecha para enviar una solicitud sin pago.");
      return;
    }
    setError(null);
    setSubmitting(true);

    // ---- Custom date: availability request, never a payment ----
    if (!isEventBooking || !selectedEvent) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("submit-request", {
          body: {
            type: "booking",
            activity: `${activity.categoryLabel} · ${activity.name}`,
            preferredDate: form.date,
            numberOfPeople: form.participants,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            message: form.message.trim() || null,
            rgpd: true,
          },
        });
        if (fnError || data?.ok !== true) throw new Error("request_failed");
        setRequestSent(true);
        window.scrollTo({ top: 0 });
      } catch {
        // A lost response may hide a request that WAS stored: be honest.
        setError("No hemos podido confirmar la recepción de tu solicitud. Si vuelves a enviarla podría llegarnos duplicada; si prefieres, escríbenos por WhatsApp y lo comprobamos.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ---- Scheduled outing: server checks and holds seats, then payment ----
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-activity-deposit", {
        body: {
          category,
          slug,
          participants: form.participants,
          eventId: selectedEvent.id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim() || null,
          rgpd: true,
          environment: getStripeEnvironment(),
          origin: window.location.origin,
        },
      });

      if (fnError || !data?.token) {
        const detail = fnError ? await readFnError(fnError) : null;
        if (detail?.reason && detail.reason !== "requires_confirmation") {
          chooseEvent(null);
          void reloadEvents();
          setEventNotice(
            detail.reason === "sin_plazas"
              ? "Esa salida acaba de quedarse sin plazas suficientes. Elige otra salida o solicita una fecha sin pago."
              : "Esa salida ya no admite reservas. Elige otra salida o solicita una fecha sin pago.",
          );
          setError("No se ha bloqueado ninguna plaza ni se ha realizado ningún cargo.");
        } else {
          setError("No hemos podido preparar el pago. No se ha realizado ningún cargo: inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.");
        }
        return;
      }
      navigate(`/pago/${data.token}`);
    } catch {
      // Network failure: a hold may exist server-side; it expires on its own.
      setError("No hemos podido confirmar tu reserva. No se ha realizado ningún cargo; si se llegó a bloquear una plaza se liberará sola en unos minutos. Inténtalo de nuevo o escríbenos por WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  // Outing that disappears/fills on reload: clear it and explain the switch.
  useEffect(() => {
    if (!selectedEventId || eventsLoading) return;
    if (eventsError || !events.some((e) => e.id === selectedEventId && !e.isFull)) {
      setSelectedEventId(null);
      setForm((prev) => ({ ...prev, date: "" }));
      setEventNotice("La salida que habías elegido ya no está disponible. Elige otra salida o indica una fecha para enviar una solicitud sin pago.");
    }
  }, [selectedEventId, eventsLoading, eventsError, events]);

  if (requestSent) {
    return wrapper(
      <div className="flex min-h-[520px] flex-col items-center justify-center py-10 text-center" role="status">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10"><CheckCircle2 className="h-8 w-8 text-primary" /></span>
        <h1 className="mb-3 font-heading text-3xl font-extrabold sm:text-4xl">Solicitud recibida</h1>
        <p className="mb-3 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
          Hemos recibido tu solicitud para <strong className="text-foreground">{activity.name}</strong> el{" "}
          {fromDateInput(form.date)?.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} ({form.participants} participante(s)).
        </p>
        <p className="mb-7 max-w-md text-base leading-7 text-muted-foreground">
          Todavía no es una reserva confirmada y no se ha cobrado nada. Antonio revisará la
          disponibilidad y, si es posible, te enviará un enlace de pago.
        </p>
        <Button size="lg" asChild>
          <Link to={`/actividades/${category}/${slug}`}>Volver a la actividad</Link>
        </Button>
      </div>,
    );
  }

  return wrapper(
    <div className="space-y-8">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase text-primary">
          {activity.categoryLabel} · {activity.zone}
        </p>
        <h1 className="font-heading text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-[3.25rem]">{isEventBooking ? "Completa tu reserva" : "Solicita tu fecha"}</h1>
        <p className="mt-4 font-heading text-xl font-bold text-foreground">{activity.name}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-base text-muted-foreground">
          {form.date && <span className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />{new Date(`${form.date}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>}
          <span className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />{form.participants} participante(s)</span>
        </div>
        {isEventBooking ? (
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
        ) : (
          <dl className="mt-7 space-y-3 border-y border-border py-6 text-sm">
            <div>
              <dt className="text-sm font-semibold uppercase text-muted-foreground">Pagas ahora</dt>
              <dd className="mt-1 font-heading text-[2.75rem] font-extrabold leading-none text-primary sm:text-5xl">0 €</dd>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
              <dt>Precio estimado · {euros(unitPrice)} × {form.participants}</dt>
              <dd>{euros(total)}</dd>
            </div>
            <p className="text-muted-foreground">Solicitud sin pago: primero confirmamos la disponibilidad contigo.</p>
          </dl>
        )}
      </header>

      <div>
        <h2 className="mb-5 font-heading text-2xl font-bold">Elige los detalles</h2>

        {eventNotice && (
          <div role="alert" className="mb-6 rounded-md border border-primary/40 bg-primary/10 p-4 text-sm leading-6 text-foreground">
            <p>{eventNotice}</p>
            {selectedEventId === null && (
              <p className="mt-2 font-semibold">Ahora estás en modo solicitud: elige la fecha que prefieres (sin pago).</p>
            )}
          </div>
        )}

        <div className="mb-7">
          <Label className="mb-3 block text-base">Salidas programadas</Label>
          {eventsError ? (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No hemos podido cargar las salidas programadas, así que no podemos ofrecer pago online
              ahora. Puedes enviar una solicitud de fecha sin pago o{" "}
              <button type="button" onClick={() => void reloadEvents()} className="text-primary underline">reintentar</button>.
            </div>
          ) : (
            <ActivityEventPicker
              events={events}
              loading={eventsLoading}
              selectedId={selectedEvent ? selectedEvent.id : null}
              onSelect={chooseEvent}
            />
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="date">{isEventBooking ? "Fecha de la salida" : "Fecha que prefieres"}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  type="button"
                  variant="outline"
                  disabled={Boolean(selectedEvent)}
                  className="mt-2 min-h-12 w-full justify-start gap-3 px-3 text-left font-normal"
                >
                  <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {form.date
                    ? fromDateInput(form.date)?.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : <span className="text-muted-foreground">Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDateInput(form.date)}
                  onSelect={(date) => {
                    if (date) setForm({ ...form, date: toDateInput(date) });
                  }}
                  disabled={{ before: new Date() }}
                  initialFocus
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
            {selectedEvent && (
              <p className="mt-1 text-xs text-muted-foreground">
                Fecha fijada por la salida programada que has elegido.
              </p>
            )}
            {!selectedEvent && (
              <p className="mt-1 text-xs text-muted-foreground">
                Fecha propuesta: queda pendiente de confirmar disponibilidad.
              </p>
            )}
          </div>
          <div>
            <Label>Participantes</Label>
            <div id="participants" role="radiogroup" aria-label="Participantes" className="mt-2 flex flex-wrap gap-2">
              {participantOptions.map((count) => {
                const isSelected = form.participants === count;
                const isDisabled = count > maxPeople;
                return (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isDisabled}
                    onClick={() => setForm({ ...form, participants: count })}
                    className={`min-h-12 min-w-12 rounded-full border px-5 text-base font-semibold transition-all duration-300 active:scale-95 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary"
                    } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedEvent
                ? selectedEvent.freeSeats === 1
                  ? "Queda 1 plaza en esta salida: reserva individual."
                  : `Quedan ${selectedEvent.freeSeats} plaza(s) en esta salida.`
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

        <p className="mt-5 flex items-start gap-2 rounded-md border border-border bg-muted/30 p-4 text-sm leading-6 text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <strong>Edad mínima: {activity.minimumAge}.</strong> Los menores necesitan autorización y,
            en su caso, acompañamiento según los{" "}
            <Link to="/terminos" className="text-primary underline">términos</Link>.
          </span>
        </p>

        <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {isEventBooking
            ? "Al continuar comprobamos y bloqueamos tus plazas durante 30 minutos mientras pagas la señal. La reserva se confirma con el pago y queda sujeta a la meteorología y a las condiciones publicadas."
            : "No se cobra nada ahora. Antonio revisará la disponibilidad de la fecha y, si es posible, te enviará un enlace de pago. Sujeto a la meteorología y a las condiciones publicadas."}
        </p>

        <Button
          className="mt-5 min-h-12 w-full text-base transition-all duration-300 active:scale-95 sm:text-lg"
          size="lg"
          disabled={submitting || (eventsLoading && Boolean(selectedEventId))}
          onClick={submit}
        >
          {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isEventBooking ? `Pagar señal de ${euros(deposit)}` : "Solicitar disponibilidad sin pago"}
        </Button>
        {isEventBooking && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Pago seguro con Stripe</p>
        )}
      </div>
    </div>,
  );
}
