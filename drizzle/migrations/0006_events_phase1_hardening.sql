-- 1. Campos adicionales de la Fase 1
ALTER TABLE public.activity_events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'open_group',
  ADD COLUMN IF NOT EXISTS guide_name text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER TABLE public.activity_events
  DROP CONSTRAINT IF EXISTS activity_events_event_type_valid;
ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_event_type_valid
  CHECK (event_type IN ('open_group','private'));

-- Estado 'completada' (salida ya realizada)
ALTER TABLE public.activity_events
  DROP CONSTRAINT IF EXISTS activity_events_status_valid;
ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_status_valid
  CHECK (status IN ('borrador','publicada','completa','cancelada','completada'));

ALTER TABLE public.activity_events
  DROP CONSTRAINT IF EXISTS activity_events_price_non_negative;
ALTER TABLE public.activity_events
  ADD CONSTRAINT activity_events_price_non_negative
  CHECK (price_cents IS NULL OR price_cents >= 0);

-- 2. Lectura pública estrictamente limitada a columnas no sensibles
REVOKE SELECT ON public.activity_events FROM anon;
GRANT SELECT (
  id, category, slug, title, starts_at, ends_at, meeting_point_public,
  latitude, longitude, capacity_total, seats_reserved, price_cents,
  status, event_type
) ON public.activity_events TO anon;

-- 3. Liberación de plazas por cancelación/reembolso
CREATE OR REPLACE FUNCTION public.release_event_seats(_booking_id uuid, _reason text DEFAULT NULL)
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

  IF link.state = 'liberada' THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'event_id', link.event_id);
  END IF;

  UPDATE public.activity_event_bookings
     SET state = 'liberada', hold_expires_at = NULL, updated_at = now()
   WHERE id = link.id;

  UPDATE public.activity_events
     SET seats_reserved = GREATEST(seats_reserved - link.participants, 0),
         status = CASE WHEN status = 'completa' THEN 'publicada' ELSE status END
   WHERE id = link.event_id;

  RETURN jsonb_build_object('ok', true, 'event_id', link.event_id, 'reason', _reason);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_event_seats(uuid, text) FROM anon, authenticated;
