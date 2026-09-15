-- 1. Campos separados de contacto (aditivos, sin tocar datos existentes)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS payment_email text;

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text;

-- 2. Refuerzo de payment_requests
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS checkout_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text;

CREATE UNIQUE INDEX IF NOT EXISTS payment_requests_token_unique
  ON public.payment_requests (token);

CREATE UNIQUE INDEX IF NOT EXISTS payment_requests_payment_intent_unique
  ON public.payment_requests (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- 3. Registro de notificaciones
CREATE TABLE IF NOT EXISTS public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  recipient text,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  provider_id text,
  error text,
  attempts integer NOT NULL DEFAULT 0,
  dedupe_key text NOT NULL,
  payload jsonb,
  payment_request_id uuid REFERENCES public.payment_requests(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contact_submissions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_log_status_check
    CHECK (status IN ('pendiente', 'enviado', 'fallido', 'omitido')),
  CONSTRAINT notification_log_dedupe_unique UNIQUE (dedupe_key)
);

CREATE INDEX IF NOT EXISTS notification_log_created_at_idx
  ON public.notification_log (created_at DESC);

GRANT SELECT, UPDATE ON public.notification_log TO authenticated;
GRANT ALL ON public.notification_log TO service_role;

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notification log" ON public.notification_log;
CREATE POLICY "Admins can view notification log"
  ON public.notification_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update notification log" ON public.notification_log;
CREATE POLICY "Admins can update notification log"
  ON public.notification_log FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_notification_log_updated_at ON public.notification_log;
CREATE TRIGGER update_notification_log_updated_at
  BEFORE UPDATE ON public.notification_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Confirmación atómica e idempotente del pago
CREATE OR REPLACE FUNCTION public.confirm_payment_request(
  _token text,
  _reference text,
  _payment_intent_id text,
  _amount_cents integer,
  _currency text,
  _environment text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pr public.payment_requests%ROWTYPE;
  updated public.payment_requests%ROWTYPE;
BEGIN
  SELECT * INTO pr FROM public.payment_requests WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'not_found');
  END IF;

  IF pr.environment IS DISTINCT FROM _environment THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'environment_mismatch');
  END IF;

  IF lower(pr.currency) IS DISTINCT FROM lower(_currency) THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'currency_mismatch');
  END IF;

  IF _amount_cents < pr.amount_cents THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'amount_mismatch');
  END IF;

  IF pr.status = 'pagado' THEN
    RETURN jsonb_build_object(
      'applied', false,
      'reason', 'already_paid',
      'payment_request_id', pr.id,
      'booking_id', pr.booking_id,
      'contact_id', pr.contact_id,
      'concept', pr.concept,
      'customer_email', pr.customer_email,
      'currency', pr.currency
    );
  END IF;

  UPDATE public.payment_requests
     SET status = 'pagado',
         paid_at = now(),
         payment_reference = _reference,
         stripe_payment_intent_id = COALESCE(_payment_intent_id, stripe_payment_intent_id),
         last_error = NULL
   WHERE id = pr.id
     AND status <> 'pagado'
  RETURNING * INTO updated;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'already_paid', 'payment_request_id', pr.id);
  END IF;

  IF updated.booking_id IS NOT NULL THEN
    UPDATE public.bookings
       SET status = 'confirmada',
           paid_amount_cents = _amount_cents,
           paid_at = updated.paid_at,
           payment_reference = _reference
     WHERE id = updated.booking_id;
  ELSIF updated.contact_id IS NOT NULL THEN
    UPDATE public.contact_submissions
       SET status = 'confirmada',
           paid_amount_cents = _amount_cents,
           paid_at = updated.paid_at,
           payment_reference = _reference
     WHERE id = updated.contact_id;
  END IF;

  RETURN jsonb_build_object(
    'applied', true,
    'payment_request_id', updated.id,
    'booking_id', updated.booking_id,
    'contact_id', updated.contact_id,
    'concept', updated.concept,
    'customer_email', updated.customer_email,
    'currency', updated.currency,
    'paid_at', updated.paid_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) TO service_role;