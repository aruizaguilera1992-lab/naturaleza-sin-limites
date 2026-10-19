-- Additive: historical reservations and migration files are not rewritten.
CREATE TABLE public.deposit_intents (
  id uuid PRIMARY KEY,
  payload_hash text NOT NULL,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_request_id uuid NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deposit_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.deposit_intents FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.deposit_intents TO service_role;

CREATE FUNCTION public.create_deposit_intent(_id uuid, _payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  prior public.deposit_intents%ROWTYPE;
  ev public.activity_events%ROWTYPE;
  pr public.payment_requests%ROWTYPE;
  link public.activity_event_bookings%ROWTYPE;
  booking uuid;
  fingerprint text := encode(extensions.digest(_payload::text, 'sha256'), 'hex');
  people integer := (_payload->>'participants')::integer;
  unit_cents integer;
  total integer;
  deposit integer;
  seat jsonb;
BEGIN
  IF _id IS NULL OR people IS NULL OR people NOT BETWEEN 1 AND 6 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_participants');
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(_id::text, 0));
  SELECT * INTO prior FROM public.deposit_intents WHERE id = _id;
  IF FOUND THEN
    IF prior.payload_hash <> fingerprint THEN RETURN jsonb_build_object('ok', false, 'reason', 'intent_mismatch'); END IF;
    SELECT * INTO pr FROM public.payment_requests WHERE id = prior.payment_request_id;
    SELECT * INTO link FROM public.activity_event_bookings WHERE booking_id = prior.booking_id;
    SELECT * INTO ev FROM public.activity_events WHERE id = link.event_id;
    IF pr.status <> 'pagado' AND (pr.status <> 'pendiente' OR link.state IS DISTINCT FROM 'bloqueada' OR link.hold_expires_at <= now()) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'intent_expired');
    END IF;
    RETURN jsonb_build_object('ok', true, 'reused', true, 'booking_id', prior.booking_id,
      'token', pr.token, 'amount_cents', pr.amount_cents, 'total_cents', pr.total_cents, 'starts_at', ev.starts_at);
  END IF;
  IF _payload->>'environment' NOT IN ('sandbox','live') OR (_payload->>'rgpd')::boolean IS DISTINCT FROM true THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_payload');
  END IF;
  SELECT * INTO ev FROM public.activity_events WHERE id = (_payload->>'eventId')::uuid FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF ev.category <> _payload->>'category' OR ev.slug <> _payload->>'slug' THEN RETURN jsonb_build_object('ok', false, 'reason', 'wrong_activity'); END IF;
  IF ev.event_type <> 'open_group' OR ev.status NOT IN ('publicada','completa') THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_bookable'); END IF;
  IF ev.starts_at <= now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'past_event'); END IF;
  unit_cents := CASE WHEN ev.price_cents > 0 THEN ev.price_cents ELSE (_payload->>'catalogueUnitCents')::integer END;
  total := unit_cents * people;
  deposit := round(total * 0.30);
  IF deposit IS NULL OR deposit < 50 THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_amount'); END IF;
  -- Exceptions roll back booking, hold, payment and intent as one transaction.
  INSERT INTO public.bookings(activity,preferred_date,number_of_people,contact,email,phone,payment_email,name,message,status,rgpd_accepted_at)
    VALUES(_payload->>'activityLabel',(ev.starts_at AT TIME ZONE 'Europe/Madrid')::date,people::text,
      _payload->>'email',_payload->>'email',_payload->>'phone',_payload->>'email',_payload->>'name',
      nullif(_payload->>'message',''),'pendiente_pago',now()) RETURNING id INTO booking;
  seat := public.reserve_event_seats(ev.id, booking, people, 30);
  IF NOT coalesce((seat->>'ok')::boolean,false) THEN
    DELETE FROM public.bookings WHERE id = booking;
    RETURN seat;
  END IF;
  INSERT INTO public.payment_requests(booking_id,amount_cents,total_cents,kind,currency,concept,customer_email,environment)
    VALUES(booking,deposit,total,'senal','eur','Señal 30% · ' || (_payload->>'activityLabel') || ' · ' || people || ' pax',
      _payload->>'email',_payload->>'environment') RETURNING * INTO pr;
  INSERT INTO public.deposit_intents(id,payload_hash,booking_id,payment_request_id) VALUES(_id,fingerprint,booking,pr.id);
  RETURN jsonb_build_object('ok',true,'reused',false,'booking_id',booking,'token',pr.token,'amount_cents',deposit,'total_cents',total,'starts_at',ev.starts_at);
END;
$$;
REVOKE ALL ON FUNCTION public.create_deposit_intent(uuid,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_deposit_intent(uuid,jsonb) TO service_role;
