-- Preflight fails safely if historical outings exceed six. Review them manually before retrying.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.activity_events WHERE capacity_total > 6) THEN
    RAISE EXCEPTION 'Oversize outings exist: review capacity and existing reservations before migrating';
  END IF;
END $$;
ALTER TABLE public.activity_events DROP CONSTRAINT activity_events_capacity_positive;
ALTER TABLE public.activity_events ADD CONSTRAINT activity_events_capacity_positive
  CHECK (capacity_total BETWEEN 1 AND 6);
CREATE OR REPLACE FUNCTION public.reserve_event_seats(
  _event_id uuid,
  _booking_id uuid,
  _participants integer,
  _hold_minutes integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ev public.activity_events%ROWTYPE;
  free_seats integer;
BEGIN
  PERFORM public.release_expired_event_holds();

  SELECT * INTO ev FROM public.activity_events WHERE id = _event_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF ev.status NOT IN ('publicada', 'completa') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_bookable', 'status', ev.status);
  END IF;

  IF ev.capacity_total > 6 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_bookable');
  END IF;

  IF ev.starts_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'past_event');
  END IF;

  free_seats := ev.capacity_total - ev.seats_reserved;
  IF _participants IS NULL OR _participants < 1 OR _participants > 6 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_participants');
  END IF;
  IF _participants > free_seats THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'sin_plazas', 'free_seats', free_seats);
  END IF;

  INSERT INTO public.activity_event_bookings (event_id, booking_id, participants, state, hold_expires_at)
  VALUES (_event_id, _booking_id, _participants, 'bloqueada', now() + make_interval(mins => _hold_minutes))
  ON CONFLICT (booking_id) DO NOTHING;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'booking_already_linked');
  END IF;

  UPDATE public.activity_events
     SET seats_reserved = seats_reserved + _participants,
         status = CASE WHEN seats_reserved + _participants >= capacity_total THEN 'completa' ELSE status END
   WHERE id = _event_id
  RETURNING * INTO ev;

  UPDATE public.bookings SET event_id = _event_id WHERE id = _booking_id;

  RETURN jsonb_build_object(
    'ok', true,
    'event_id', _event_id,
    'seats_reserved', ev.seats_reserved,
    'free_seats', ev.capacity_total - ev.seats_reserved,
    'starts_at', ev.starts_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_event_seats(uuid, uuid, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_event_seats(uuid, uuid, integer, integer) TO service_role;
