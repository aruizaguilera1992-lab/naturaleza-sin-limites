-- 1) Durable notification intents with recoverable lease
ALTER TABLE public.notification_log
  ADD COLUMN IF NOT EXISTS lease_id uuid,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS provider_idempotency_key text;

UPDATE public.notification_log
   SET provider_idempotency_key = dedupe_key
 WHERE provider_idempotency_key IS NULL;

ALTER TABLE public.notification_log DROP CONSTRAINT IF EXISTS notification_log_status_check;
ALTER TABLE public.notification_log ADD CONSTRAINT notification_log_status_check
  CHECK (status = ANY (ARRAY['pendiente','reclamado','enviado','fallido','omitido']));

CREATE INDEX IF NOT EXISTS idx_notification_log_pending
  ON public.notification_log (status, next_attempt_at);

-- 2) Checkout generations
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS checkout_generation integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checkout_session_expired_at timestamptz;

-- 3) Confirmation RPC (new signature, replaces the previous one)
DROP FUNCTION IF EXISTS public.confirm_payment_request(text, text, text, integer, text, text);

CREATE OR REPLACE FUNCTION public.confirm_payment_request(
  _token text,
  _session_id text,
  _payment_intent_id text,
  _amount_cents integer,
  _currency text,
  _environment text,
  _payment_status text,
  _livemode boolean,
  _customer_email text DEFAULT NULL,
  _notifications jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pr public.payment_requests%ROWTYPE;
  updated public.payment_requests%ROWTYPE;
  target_exists boolean;
  note jsonb;
  reference text := COALESCE(_payment_intent_id, _session_id);
  result_ids jsonb;
BEGIN
  SELECT * INTO pr FROM public.payment_requests WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'not_found');
  END IF;

  IF pr.environment IS DISTINCT FROM _environment THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'environment_mismatch');
  END IF;

  IF _livemode IS DISTINCT FROM (_environment = 'live') THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'livemode_mismatch');
  END IF;

  IF _payment_status IS NULL OR _payment_status NOT IN ('paid', 'no_payment_required') THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'payment_status_not_final');
  END IF;

  IF pr.stripe_session_id IS NOT NULL AND pr.stripe_session_id IS DISTINCT FROM _session_id THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'session_mismatch');
  END IF;

  IF lower(pr.currency) IS DISTINCT FROM lower(_currency) THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'currency_mismatch');
  END IF;

  -- Prices are created tax inclusive: the charged total must match exactly.
  IF _amount_cents IS DISTINCT FROM pr.amount_cents THEN
    RETURN jsonb_build_object(
      'applied', false,
      'reason', CASE WHEN _amount_cents > pr.amount_cents THEN 'amount_over' ELSE 'amount_under' END
    );
  END IF;

  result_ids := jsonb_build_object(
    'payment_request_id', pr.id,
    'booking_id', pr.booking_id,
    'contact_id', pr.contact_id,
    'concept', pr.concept,
    'customer_email', COALESCE(pr.customer_email, _customer_email),
    'currency', pr.currency
  );

  IF pr.status = 'pagado' THEN
    -- Repair path: notification intents are (re)ensured, no double charge.
    FOR note IN SELECT * FROM jsonb_array_elements(COALESCE(_notifications, '[]'::jsonb)) LOOP
      INSERT INTO public.notification_log
        (kind, channel, recipient, subject, status, dedupe_key, provider_idempotency_key,
         payload, payment_request_id, booking_id, contact_id)
      VALUES (
        note->>'kind', 'email',
        NULLIF(array_to_string(ARRAY(SELECT jsonb_array_elements_text(note->'recipients')), ', '), ''),
        note->>'subject', 'pendiente', note->>'dedupe_key', note->>'dedupe_key',
        jsonb_build_object('html', note->>'html', 'recipients', note->'recipients'),
        pr.id, pr.booking_id, pr.contact_id
      )
      ON CONFLICT (dedupe_key) DO NOTHING;
    END LOOP;
    RETURN result_ids || jsonb_build_object('applied', false, 'reason', 'already_paid');
  END IF;

  IF pr.status <> 'pendiente' THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'status_not_payable', 'status', pr.status);
  END IF;

  UPDATE public.payment_requests
     SET status = 'pagado',
         paid_at = now(),
         payment_reference = reference,
         stripe_session_id = COALESCE(stripe_session_id, _session_id),
         stripe_payment_intent_id = COALESCE(_payment_intent_id, stripe_payment_intent_id),
         customer_email = COALESCE(customer_email, _customer_email),
         last_error = NULL
   WHERE id = pr.id AND status = 'pendiente'
  RETURNING * INTO updated;

  IF NOT FOUND THEN
    RETURN result_ids || jsonb_build_object('applied', false, 'reason', 'already_paid');
  END IF;

  IF updated.booking_id IS NOT NULL THEN
    UPDATE public.bookings
       SET status = 'confirmada',
           paid_amount_cents = _amount_cents,
           paid_at = updated.paid_at,
           payment_reference = reference
     WHERE id = updated.booking_id;
    GET DIAGNOSTICS target_exists = ROW_COUNT;
  ELSE
    UPDATE public.contact_submissions
       SET status = 'confirmada',
           paid_amount_cents = _amount_cents,
           paid_at = updated.paid_at,
           payment_reference = reference
     WHERE id = updated.contact_id;
    GET DIAGNOSTICS target_exists = ROW_COUNT;
  END IF;

  IF NOT target_exists THEN
    -- Destination missing: roll back the whole confirmation.
    RAISE EXCEPTION 'destino_inexistente para payment_request %', updated.id;
  END IF;

  FOR note IN SELECT * FROM jsonb_array_elements(COALESCE(_notifications, '[]'::jsonb)) LOOP
    INSERT INTO public.notification_log
      (kind, channel, recipient, subject, status, dedupe_key, provider_idempotency_key,
       payload, payment_request_id, booking_id, contact_id)
    VALUES (
      note->>'kind', 'email',
      NULLIF(array_to_string(ARRAY(SELECT jsonb_array_elements_text(note->'recipients')), ', '), ''),
      note->>'subject', 'pendiente', note->>'dedupe_key', note->>'dedupe_key',
      jsonb_build_object('html', note->>'html', 'recipients', note->'recipients'),
      updated.id, updated.booking_id, updated.contact_id
    )
    ON CONFLICT (dedupe_key) DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object(
    'applied', true,
    'payment_request_id', updated.id,
    'booking_id', updated.booking_id,
    'contact_id', updated.contact_id,
    'concept', updated.concept,
    'customer_email', COALESCE(updated.customer_email, _customer_email),
    'currency', updated.currency,
    'paid_at', updated.paid_at
  );
END;
$function$;

-- 4) Notification lease helpers
CREATE OR REPLACE FUNCTION public.claim_notification(_id uuid, _lease_seconds integer DEFAULT 120)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  n public.notification_log%ROWTYPE;
  new_lease uuid := gen_random_uuid();
BEGIN
  SELECT * INTO n FROM public.notification_log WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'not_found');
  END IF;
  IF n.status = 'enviado' THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_sent', 'provider_id', n.provider_id);
  END IF;
  IF n.status = 'reclamado' AND n.lease_expires_at IS NOT NULL AND n.lease_expires_at > now() THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'leased');
  END IF;

  UPDATE public.notification_log
     SET status = 'reclamado',
         lease_id = new_lease,
         lease_expires_at = now() + make_interval(secs => _lease_seconds),
         attempts = attempts + 1,
         updated_at = now()
   WHERE id = _id;

  RETURN jsonb_build_object(
    'claimed', true,
    'lease_id', new_lease,
    'attempt', n.attempts + 1,
    'kind', n.kind,
    'subject', n.subject,
    'payload', n.payload,
    'recipient', n.recipient,
    'idempotency_key', COALESCE(n.provider_idempotency_key, n.dedupe_key)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.finish_notification(
  _id uuid,
  _lease_id uuid,
  _status text,
  _provider_id text DEFAULT NULL,
  _error text DEFAULT NULL,
  _retry_in_seconds integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  n public.notification_log%ROWTYPE;
BEGIN
  IF _status NOT IN ('enviado', 'fallido', 'omitido', 'pendiente') THEN
    RAISE EXCEPTION 'estado no válido: %', _status;
  END IF;

  SELECT * INTO n FROM public.notification_log WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF n.lease_id IS DISTINCT FROM _lease_id THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'lease_lost', 'status', n.status);
  END IF;

  UPDATE public.notification_log
     SET status = _status,
         provider_id = COALESCE(_provider_id, provider_id),
         error = _error,
         lease_id = NULL,
         lease_expires_at = NULL,
         next_attempt_at = CASE WHEN _status = 'enviado' THEN now()
                                ELSE now() + make_interval(secs => _retry_in_seconds) END,
         updated_at = now()
   WHERE id = _id;

  RETURN jsonb_build_object('ok', true, 'status', _status);
END;
$function$;

-- 5) Checkout generation helpers
CREATE OR REPLACE FUNCTION public.begin_checkout_generation(_token text, _expired_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pr public.payment_requests%ROWTYPE;
BEGIN
  SELECT * INTO pr FROM public.payment_requests WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF pr.status <> 'pendiente' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'status_not_payable', 'status', pr.status);
  END IF;

  IF _expired_session_id IS NOT NULL AND pr.stripe_session_id = _expired_session_id THEN
    UPDATE public.payment_requests
       SET checkout_generation = checkout_generation + 1,
           checkout_session_expired_at = now(),
           stripe_session_id = NULL
     WHERE id = pr.id
    RETURNING * INTO pr;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'generation', pr.checkout_generation,
    'session_id', pr.stripe_session_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_checkout_session(_token text, _generation integer, _session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pr public.payment_requests%ROWTYPE;
BEGIN
  SELECT * INTO pr FROM public.payment_requests WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF pr.checkout_generation IS DISTINCT FROM _generation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'stale_generation', 'session_id', pr.stripe_session_id);
  END IF;
  IF pr.stripe_session_id IS NOT NULL AND pr.stripe_session_id IS DISTINCT FROM _session_id THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'session_conflict', 'session_id', pr.stripe_session_id);
  END IF;

  UPDATE public.payment_requests
     SET stripe_session_id = _session_id,
         checkout_created_at = now(),
         last_error = NULL
   WHERE id = pr.id;

  RETURN jsonb_build_object('ok', true, 'session_id', _session_id);
END;
$function$;

-- 6) Internal-only execution
REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text, text, boolean, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_notification(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_notification(uuid, uuid, text, text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.begin_checkout_generation(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_checkout_session(text, integer, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text, text, boolean, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_notification(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_notification(uuid, uuid, text, text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.begin_checkout_generation(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_checkout_session(text, integer, text) TO service_role;