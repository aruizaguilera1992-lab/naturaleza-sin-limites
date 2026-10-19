CREATE OR REPLACE FUNCTION public.admin_delete_booking(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE link public.activity_event_bookings%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO link FROM public.activity_event_bookings WHERE booking_id = _id FOR UPDATE;
  IF FOUND AND link.state <> 'liberada' THEN
    UPDATE public.activity_events
       SET seats_reserved = GREATEST(seats_reserved - link.participants, 0),
           status = CASE WHEN status = 'completa' THEN 'publicada' ELSE status END
     WHERE id = link.event_id;
  END IF;
  DELETE FROM public.notification_log WHERE booking_id = _id
     OR payment_request_id IN (SELECT id FROM public.payment_requests WHERE booking_id = _id);
  DELETE FROM public.payment_requests WHERE booking_id = _id;
  DELETE FROM public.activity_event_bookings WHERE booking_id = _id;
  DELETE FROM public.bookings WHERE id = _id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_contact(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  DELETE FROM public.notification_log WHERE contact_id = _id
     OR payment_request_id IN (SELECT id FROM public.payment_requests WHERE contact_id = _id);
  DELETE FROM public.payment_requests WHERE contact_id = _id;
  DELETE FROM public.contact_submissions WHERE id = _id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_reset_all(_confirm text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF _confirm IS DISTINCT FROM 'BORRAR' THEN RAISE EXCEPTION 'Confirmación incorrecta'; END IF;
  DELETE FROM public.notification_log WHERE id IS NOT NULL;
  DELETE FROM public.payment_requests WHERE id IS NOT NULL;
  DELETE FROM public.activity_event_bookings WHERE id IS NOT NULL;
  DELETE FROM public.bookings WHERE id IS NOT NULL;
  DELETE FROM public.contact_submissions WHERE id IS NOT NULL;
  DELETE FROM public.activity_events WHERE id IS NOT NULL;
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE ALL ON FUNCTION public.admin_delete_booking(uuid), public.admin_delete_contact(uuid), public.admin_reset_all(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_booking(uuid), public.admin_delete_contact(uuid), public.admin_reset_all(text) TO authenticated;