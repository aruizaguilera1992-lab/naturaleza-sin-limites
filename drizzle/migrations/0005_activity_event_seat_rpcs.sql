CREATE OR REPLACE FUNCTION public.release_expired_event_holds()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec record;
  released integer := 0;
BEGIN
  FOR rec IN
    SELECT id, event_id, participants
      FROM public.activity_event_bookings
     WHERE state = 'bloqueada'
       AND hold_expires_at IS NOT NULL
       AND hold_expires_at < now()
     FOR UPDATE
  LOOP
    UPDATE public.activity_event_bookings
       SET state = 'liberada', updated_at = now()
     WHERE id = rec.id;

    UPDATE public.activity_events
       SET seats_reserved = GREATEST(seats_reserved - rec.participants, 0),
           status = CASE WHEN status = 'completa' THEN 'publicada' ELSE status END
     WHERE id = rec.event_id;

    released := released + 1;
  END LOOP;

  RETURN released;
END;
$$;

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

  IF ev.starts_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'past_event');
  END IF;

  free_seats := ev.capacity_total - ev.seats_reserved;
  IF _participants IS NULL OR _participants < 1 THEN
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

CREATE OR REPLACE FUNCTION public.confirm_event_seats(_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  link public.activity_event_bookings%ROWTYPE;
BEGIN
  SELECT * INTO link FROM public.activity_event_bookings WHERE booking_id = _booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_event');
  END IF;

  IF link.state = 'confirmada' THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  IF link.state = 'liberada' THEN
    -- Hold expired before payment landed: re-take the seats if still available.
    PERFORM 1 FROM public.activity_events
      WHERE id = link.event_id
        AND capacity_total - seats_reserved >= link.participants
      FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'sin_plazas');
    END IF;
    UPDATE public.activity_events
       SET seats_reserved = seats_reserved + link.participants,
           status = CASE WHEN seats_reserved + link.participants >= capacity_total THEN 'completa' ELSE status END
     WHERE id = link.event_id;
  END IF;

  UPDATE public.activity_event_bookings
     SET state = 'confirmada', hold_expires_at = NULL, updated_at = now()
   WHERE id = link.id;

  RETURN jsonb_build_object('ok', true, 'event_id', link.event_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reserve_event_seats(uuid, uuid, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_event_seats(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_expired_event_holds() FROM anon, authenticated;
