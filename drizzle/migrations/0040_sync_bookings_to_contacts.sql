CREATE OR REPLACE FUNCTION public.sync_booking_contact(_b public.bookings)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE em text; ph text; d text; cid uuid; any_match boolean;
BEGIN
  em := lower(btrim(coalesce(_b.email, _b.payment_email, CASE WHEN _b.contact LIKE '%@%' THEN _b.contact END)));
  IF em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN em := NULL; END IF;
  d := regexp_replace(coalesce(_b.phone, CASE WHEN _b.contact NOT LIKE '%@%' THEN _b.contact END, ''), '[^0-9+]', '', 'g');
  IF d LIKE '00%' THEN d := '+' || substr(d,3); END IF;
  IF d ~ '^[6789][0-9]{8}$' THEN d := '+34' || d; END IF;
  ph := CASE WHEN d ~ '^\+[1-9][0-9]{7,14}$' THEN d END;
  IF em IS NULL AND ph IS NULL THEN RETURN NULL; END IF;
  IF EXISTS (SELECT 1 FROM contact_events WHERE booking_id = _b.id AND kind = 'reserva' AND origin = 'sincronizacion') THEN RETURN NULL; END IF;
  SELECT EXISTS (SELECT 1 FROM contact_submissions c WHERE (em IS NOT NULL AND c.email_normalized = em) OR (ph IS NOT NULL AND c.phone_normalized = ph)) INTO any_match;
  IF NOT any_match THEN
    INSERT INTO contact_submissions(nombre, contacto, email, phone, interes, personas, mensaje, rgpd_accepted_at, source, created_at)
    VALUES (left(coalesce(NULLIF(btrim(_b.name),''), em, ph), 120), coalesce(em, ph), em, ph, left(coalesce(_b.activity,'Reserva web'),200),
            _b.number_of_people, _b.message, _b.rgpd_accepted_at, 'reserva', _b.created_at)
    RETURNING id INTO cid;
  ELSE
    SELECT c.id INTO cid FROM contact_submissions c
     WHERE em IS NOT NULL AND ph IS NOT NULL AND c.email_normalized = em AND c.phone_normalized = ph
     ORDER BY c.created_at LIMIT 1;
    IF cid IS NULL THEN RETURN NULL; END IF;
  END IF;
  INSERT INTO contact_events(contact_id, kind, body, origin, booking_id, occurred_at)
  VALUES (cid, 'reserva', 'Reserva web: ' || left(coalesce(_b.activity,''),200), 'sincronizacion', _b.id, _b.created_at);
  RETURN cid;
END $$;
REVOKE ALL ON FUNCTION public.sync_booking_contact(public.bookings) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_booking_sync_contact()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  BEGIN PERFORM public.sync_booking_contact(NEW);
  EXCEPTION WHEN others THEN RAISE WARNING 'sync_booking_contact: %', SQLERRM; END;
  RETURN NEW;
END $$;
CREATE TRIGGER bookings_sync_contact AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trg_booking_sync_contact();

CREATE OR REPLACE FUNCTION public.admin_sync_bookings_to_contacts()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE b public.bookings; n int := 0; r uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  FOR b IN SELECT * FROM bookings ORDER BY created_at LOOP
    r := public.sync_booking_contact(b);
    IF r IS NOT NULL THEN n := n + 1; END IF;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'synced', n);
END $$;
REVOKE ALL ON FUNCTION public.admin_sync_bookings_to_contacts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_sync_bookings_to_contacts() TO authenticated;