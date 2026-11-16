ALTER TABLE public.activity_sheets ADD COLUMN IF NOT EXISTS accepted_at timestamptz, ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.get_activity_sheet(_token text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s public.activity_sheets;
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('available', false); END IF;
  SELECT * INTO s FROM public.activity_sheets WHERE token = _token;
  IF NOT FOUND OR s.status <> 'enviada' OR (s.expires_at IS NOT NULL AND s.expires_at < now()) THEN
    RETURN jsonb_build_object('available', false);
  END IF;
  UPDATE public.activity_sheets SET first_viewed_at = coalesce(first_viewed_at, now()), view_count = view_count + 1 WHERE id = s.id;
  RETURN jsonb_build_object('available', true, 'content', s.content, 'expires_at', s.expires_at, 'accepted_at', s.accepted_at);
END $$;

CREATE OR REPLACE FUNCTION public.accept_activity_sheet(_token text, _name text, _email text, _phone text, _rgpd boolean)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s public.activity_sheets; b uuid; ppl int; nm text := left(btrim(coalesce(_name,'')),120); em text := lower(left(btrim(coalesce(_email,'')),254)); ph text := left(btrim(coalesce(_phone,'')),40);
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_available'); END IF;
  SELECT * INTO s FROM public.activity_sheets WHERE token = _token FOR UPDATE;
  IF NOT FOUND OR s.status <> 'enviada' OR (s.expires_at IS NOT NULL AND s.expires_at < now()) THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_available'); END IF;
  IF s.accepted_at IS NOT NULL THEN RETURN jsonb_build_object('ok', true, 'already', true, 'accepted_at', s.accepted_at); END IF;
  IF _rgpd IS DISTINCT FROM true THEN RETURN jsonb_build_object('ok', false, 'reason', 'rgpd'); END IF;
  IF nm = '' OR (em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND ph = '') THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_contact'); END IF;
  ppl := coalesce((s.content->>'people')::int, 1);
  IF ppl < 1 OR ppl > 6 THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_participants'); END IF;
  INSERT INTO public.bookings(activity, preferred_date, number_of_people, contact, email, phone, name, message, status, rgpd_accepted_at)
  VALUES (left(coalesce(s.content->>'title','Ficha de actividad'),200), NULLIF(s.content->>'date','')::date, ppl::text,
          coalesce(NULLIF(em,''), ph), NULLIF(em,''), NULLIF(ph,''), nm,
          'Propuesta aceptada desde ficha privada ' || left(s.token, 8), 'pendiente', now())
  RETURNING id INTO b;
  UPDATE public.activity_sheets SET accepted_at = now(), booking_id = b WHERE id = s.id;
  IF s.contact_id IS NOT NULL THEN
    INSERT INTO public.contact_events(contact_id, kind, body, origin, booking_id)
    VALUES (s.contact_id, 'reserva', 'Propuesta aceptada por el cliente: ' || left(coalesce(s.content->>'title',''),200) || '. Pendiente de enviar enlace de señal.', 'ficha', b);
  END IF;
  RETURN jsonb_build_object('ok', true, 'already', false, 'booking_id', b);
END $$;

REVOKE ALL ON FUNCTION public.accept_activity_sheet(text,text,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_activity_sheet(text,text,text,text,boolean) TO anon, authenticated, service_role;