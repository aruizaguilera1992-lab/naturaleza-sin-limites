CREATE OR REPLACE FUNCTION public.accept_activity_sheet(_token text, _name text, _email text, _phone text, _rgpd boolean)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE s public.activity_sheets; ct public.contact_submissions; b uuid; ppl int; src uuid; ph_norm text;
  nm text := left(btrim(coalesce(_name,'')),120); em text := lower(left(btrim(coalesce(_email,'')),254)); ph text := left(btrim(coalesce(_phone,'')),40);
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_available'); END IF;
  SELECT * INTO s FROM public.activity_sheets WHERE token = _token FOR UPDATE;
  IF NOT FOUND OR s.status <> 'enviada' OR (s.expires_at IS NOT NULL AND s.expires_at < now()) THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_available'); END IF;
  IF s.accepted_at IS NOT NULL THEN RETURN jsonb_build_object('ok', true, 'already', true, 'accepted_at', s.accepted_at); END IF;
  IF _rgpd IS DISTINCT FROM true THEN RETURN jsonb_build_object('ok', false, 'reason', 'rgpd'); END IF;
  IF s.contact_id IS NOT NULL THEN SELECT * INTO ct FROM public.contact_submissions WHERE id = s.contact_id; END IF;
  IF nm = '' THEN nm := left(coalesce(NULLIF(btrim(ct.nombre),''), NULLIF(btrim(s.content->>'customerName'),''), 'Cliente ficha privada'),120); END IF;
  IF em = '' THEN em := lower(coalesce(ct.email, '')); END IF;
  IF ph = '' THEN ph := coalesce(ct.phone, ''); END IF;
  IF em <> '' AND em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN em := ''; END IF;
  ppl := coalesce((s.content->>'people')::int, 1);
  IF ppl < 1 OR ppl > 6 THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid_participants'); END IF;

  -- 1) Solicitud web de origen indicada por el admin al crear la ficha.
  IF coalesce(s.content->>'sourceBookingId','') ~ '^[0-9a-fA-F-]{36}$' THEN src := (s.content->>'sourceBookingId')::uuid; END IF;
  -- 2) Si no, una solicitud abierta del mismo cliente (email o teléfono coinciden).
  ph_norm := regexp_replace(ph, '\D', '', 'g');
  SELECT bk.id INTO b FROM public.bookings bk
   WHERE bk.event_id IS NULL AND coalesce(bk.paid_amount_cents,0) = 0 AND bk.status IN ('nueva','pendiente')
     AND NOT EXISTS (SELECT 1 FROM public.activity_sheets o WHERE o.booking_id = bk.id)
     AND ((src IS NOT NULL AND bk.id = src)
       OR (src IS NULL AND ((em <> '' AND lower(bk.email) = em) OR (length(ph_norm) >= 9 AND regexp_replace(coalesce(bk.phone,''), '\D', '', 'g') = ph_norm))))
   ORDER BY (bk.id = src) DESC NULLS LAST, bk.created_at DESC LIMIT 1 FOR UPDATE;

  IF b IS NOT NULL THEN
    UPDATE public.bookings SET activity = left(coalesce(s.content->>'title', activity),200),
      preferred_date = coalesce(NULLIF(s.content->>'date','')::date, preferred_date), number_of_people = ppl::text,
      email = coalesce(email, NULLIF(em,'')), phone = coalesce(phone, NULLIF(ph,'')), name = coalesce(NULLIF(name,''), nm),
      status = 'pendiente', rgpd_accepted_at = coalesce(rgpd_accepted_at, now()),
      admin_notes = concat_ws(E'\n', NULLIF(admin_notes,''), 'Unificada con ficha privada ' || left(s.token, 8))
    WHERE id = b;
  ELSE
    INSERT INTO public.bookings(activity, preferred_date, number_of_people, contact, email, phone, name, message, status, rgpd_accepted_at)
    VALUES (left(coalesce(s.content->>'title','Ficha de actividad'),200), NULLIF(s.content->>'date','')::date, ppl::text,
            coalesce(NULLIF(em,''), NULLIF(ph,''), NULLIF(ct.contacto,''), 'Ficha privada ' || left(s.token, 8)), NULLIF(em,''), NULLIF(ph,''), nm,
            'Propuesta aceptada desde ficha privada ' || left(s.token, 8), 'pendiente', now())
    RETURNING id INTO b;
  END IF;
  UPDATE public.activity_sheets SET accepted_at = now(), booking_id = b WHERE id = s.id;
  IF s.contact_id IS NOT NULL THEN
    INSERT INTO public.contact_events(contact_id, kind, body, origin, booking_id)
    VALUES (s.contact_id, 'reserva', 'Propuesta aceptada por el cliente: ' || left(coalesce(s.content->>'title',''),200) || '. Pendiente de enviar enlace de señal.', 'ficha', b);
  END IF;
  RETURN jsonb_build_object('ok', true, 'already', false, 'booking_id', b, 'accepted_at', now());
END $function$;