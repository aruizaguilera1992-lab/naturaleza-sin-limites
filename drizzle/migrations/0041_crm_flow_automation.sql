ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contact_submissions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS bookings_contact_id_idx ON public.bookings(contact_id);
UPDATE public.bookings b SET contact_id = e.contact_id FROM public.contact_events e WHERE e.booking_id = b.id AND b.contact_id IS NULL;
UPDATE public.bookings b SET contact_id = s.contact_id FROM public.activity_sheets s WHERE s.booking_id = b.id AND s.contact_id IS NOT NULL AND b.contact_id IS NULL;

CREATE OR REPLACE FUNCTION public.stage_rank(_s text) RETURNS int LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE _s WHEN 'nuevo' THEN 0 WHEN 'contactado' THEN 1 WHEN 'propuesta' THEN 2 WHEN 'negociacion' THEN 3 WHEN 'ganado' THEN 4 ELSE -1 END $$;

CREATE OR REPLACE FUNCTION public.advance_contact(_contact uuid, _stage text, _action text DEFAULT NULL, _event text DEFAULT NULL, _booking uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF _contact IS NULL THEN RETURN; END IF;
  UPDATE contact_submissions SET
    pipeline_stage = CASE WHEN _stage IS NOT NULL AND ((pipeline_stage = 'perdido' AND _stage = 'ganado') OR (pipeline_stage <> 'perdido' AND public.stage_rank(_stage) > public.stage_rank(pipeline_stage))) THEN _stage ELSE pipeline_stage END,
    next_action = CASE WHEN _action IS NOT NULL THEN _action ELSE next_action END,
    next_action_at = CASE WHEN _action IS NOT NULL THEN now() ELSE next_action_at END
  WHERE id = _contact;
  IF _event IS NOT NULL THEN
    INSERT INTO contact_events(contact_id, kind, body, origin, booking_id) VALUES (_contact, 'automatico', _event, 'flujo', _booking);
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.advance_contact(uuid,text,text,text,uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_booking_sync_contact()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE cid uuid;
BEGIN
  BEGIN
    cid := public.sync_booking_contact(NEW);
    IF cid IS NOT NULL AND NEW.contact_id IS NULL THEN UPDATE bookings SET contact_id = cid WHERE id = NEW.id; END IF;
  EXCEPTION WHEN others THEN RAISE WARNING 'sync_booking_contact: %', SQLERRM; END;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.admin_sync_bookings_to_contacts()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE b public.bookings; n int := 0; r uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  FOR b IN SELECT * FROM bookings ORDER BY created_at LOOP
    r := public.sync_booking_contact(b);
    IF r IS NOT NULL THEN n := n + 1; UPDATE bookings SET contact_id = coalesce(contact_id, r) WHERE id = b.id; END IF;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'synced', n);
END $$;

CREATE OR REPLACE FUNCTION public.admin_link_booking_contact(_booking uuid, _contact uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  UPDATE bookings SET contact_id = _contact WHERE id = _booking;
  INSERT INTO contact_events(contact_id, kind, body, origin, booking_id, author_id) VALUES (_contact, 'reserva', 'Reserva vinculada manualmente', 'admin', _booking, auth.uid());
  RETURN jsonb_build_object('ok', true);
END $$;
REVOKE ALL ON FUNCTION public.admin_link_booking_contact(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_link_booking_contact(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.trg_payment_paid() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE cid uuid := NEW.contact_id;
BEGIN
  IF NEW.status = 'pagado' AND OLD.status IS DISTINCT FROM 'pagado' THEN
    BEGIN
      IF cid IS NULL AND NEW.booking_id IS NOT NULL THEN SELECT contact_id INTO cid FROM bookings WHERE id = NEW.booking_id; END IF;
      PERFORM public.advance_contact(cid, 'ganado', CASE WHEN NEW.booking_id IS NOT NULL THEN 'Enviar dossier' END, 'Pago recibido: ' || left(NEW.concept,160), NEW.booking_id);
    EXCEPTION WHEN others THEN RAISE WARNING 'advance_contact pago: %', SQLERRM; END;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER payment_requests_paid AFTER UPDATE OF status ON public.payment_requests FOR EACH ROW EXECUTE FUNCTION public.trg_payment_paid();

CREATE OR REPLACE FUNCTION public.trg_sheet_flow() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  BEGIN
    IF NEW.contact_id IS NOT NULL AND NEW.status = 'enviada' AND NEW.sent_at IS NOT NULL AND OLD.sent_at IS NULL THEN
      PERFORM public.advance_contact(NEW.contact_id, 'propuesta', NULL, NULL, NULL);
    END IF;
    IF NEW.booking_id IS NOT NULL AND NEW.contact_id IS NOT NULL THEN
      UPDATE bookings SET contact_id = coalesce(contact_id, NEW.contact_id) WHERE id = NEW.booking_id;
    END IF;
    IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL THEN
      PERFORM public.advance_contact(NEW.contact_id, 'negociacion', 'Enviar enlace de señal', NULL, NULL);
    END IF;
  EXCEPTION WHEN others THEN RAISE WARNING 'trg_sheet_flow: %', SQLERRM; END;
  RETURN NEW;
END $$;
CREATE TRIGGER activity_sheets_flow AFTER UPDATE ON public.activity_sheets FOR EACH ROW EXECUTE FUNCTION public.trg_sheet_flow();

CREATE OR REPLACE FUNCTION public.trg_dossier_flow() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE cid uuid;
BEGIN
  BEGIN
    SELECT contact_id INTO cid FROM bookings WHERE id = NEW.booking_id;
    IF cid IS NULL THEN RETURN NEW; END IF;
    IF NEW.status = 'enviado' AND OLD.status IS DISTINCT FROM 'enviado' THEN
      UPDATE contact_submissions SET next_action = 'Esperar dossier del cliente', next_action_at = now() + interval '2 days' WHERE id = cid AND next_action = 'Enviar dossier';
    END IF;
    IF NEW.status = 'completado' AND OLD.status IS DISTINCT FROM 'completado' THEN
      UPDATE contact_submissions SET next_action = NULL, next_action_at = NULL WHERE id = cid AND next_action IN ('Enviar dossier','Esperar dossier del cliente');
      INSERT INTO contact_events(contact_id, kind, body, origin, booking_id) VALUES (cid, 'automatico', 'Dossier completado: listo para la actividad', 'flujo', NEW.booking_id);
    END IF;
  EXCEPTION WHEN others THEN RAISE WARNING 'trg_dossier_flow: %', SQLERRM; END;
  RETURN NEW;
END $$;
CREATE TRIGGER activity_dossiers_flow AFTER UPDATE OF status ON public.activity_dossiers FOR EACH ROW EXECUTE FUNCTION public.trg_dossier_flow();

CREATE OR REPLACE FUNCTION public.submit_activity_dossier(_token text, _participants jsonb, _rgpd boolean)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE d public.activity_dossiers; n int; p jsonb;
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('ok',false,'reason','not_available'); END IF;
  SELECT * INTO d FROM public.activity_dossiers WHERE token=_token FOR UPDATE;
  IF NOT FOUND OR d.status NOT IN ('enviado','completado') OR (d.expires_at IS NOT NULL AND d.expires_at < now()) THEN RETURN jsonb_build_object('ok',false,'reason','not_available'); END IF;
  IF _rgpd IS DISTINCT FROM true THEN RETURN jsonb_build_object('ok',false,'reason','rgpd'); END IF;
  IF jsonb_typeof(_participants) <> 'array' THEN RETURN jsonb_build_object('ok',false,'reason','invalid'); END IF;
  n := jsonb_array_length(_participants);
  IF n < 1 OR n > 20 OR length(_participants::text) > 60000 THEN RETURN jsonb_build_object('ok',false,'reason','invalid'); END IF;
  FOR p IN SELECT * FROM jsonb_array_elements(_participants) LOOP
    IF length(btrim(coalesce(p->>'fullName',''))) < 3 OR coalesce(p->>'docId','') !~* '^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z0-9]{6,12})$'
       OR coalesce(p->>'birthDate','') !~ '^\d{4}-\d{2}-\d{2}$' OR length(coalesce(p->>'phone','')) < 9
       OR length(btrim(coalesce(p->>'emergencyName',''))) < 2 OR length(coalesce(p->>'emergencyPhone','')) < 9 THEN
      RETURN jsonb_build_object('ok',false,'reason','invalid');
    END IF;
  END LOOP;
  UPDATE public.activity_dossiers SET participants=_participants, rgpd_accepted_at=now(), status='completado', completed_at=now() WHERE id=d.id;
  RETURN jsonb_build_object('ok',true);
END $function$;