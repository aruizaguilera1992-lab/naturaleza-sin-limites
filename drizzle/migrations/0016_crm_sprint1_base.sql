ALTER TABLE public.contact_submissions
  ADD COLUMN source text,
  ADD COLUMN client_type text,
  ADD COLUMN activities_interest text[] NOT NULL DEFAULT '{}',
  ADD COLUMN goal text,
  ADD COLUMN experience_level text,
  ADD COLUMN participants integer,
  ADD COLUMN desired_dates text,
  ADD COLUMN contact_preference text,
  ADD COLUMN priority text,
  ADD COLUMN pipeline_stage text NOT NULL DEFAULT 'nuevo',
  ADD COLUMN next_action text,
  ADD COLUMN next_action_at timestamptz,
  ADD COLUMN recommended_service text,
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN email_normalized text,
  ADD COLUMN phone_normalized text,
  ADD COLUMN marketing_consent_at timestamptz,
  ADD COLUMN created_by uuid;

CREATE OR REPLACE FUNCTION public.normalize_contact_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  em text := lower(btrim(coalesce(NEW.email, CASE WHEN NEW.contacto LIKE '%@%' THEN NEW.contacto END)));
  ph text := coalesce(NEW.phone, CASE WHEN NEW.contacto NOT LIKE '%@%' THEN NEW.contacto END);
  digits text;
BEGIN
  NEW.email_normalized := CASE WHEN em ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN em END;
  IF ph IS NOT NULL THEN
    digits := regexp_replace(ph, '[^0-9+]', '', 'g');
    IF digits LIKE '00%' THEN digits := '+' || substr(digits, 3); END IF;
    IF digits ~ '^[6789][0-9]{8}$' THEN digits := '+34' || digits; END IF;
    NEW.phone_normalized := CASE WHEN digits ~ '^\+[1-9][0-9]{7,14}$' THEN digits END;
  ELSE
    NEW.phone_normalized := NULL;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER contact_submissions_normalize
BEFORE INSERT OR UPDATE OF email, phone, contacto ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.normalize_contact_fields();

UPDATE public.contact_submissions SET contacto = contacto;
UPDATE public.contact_submissions SET source = 'web_vertigo' WHERE source IS NULL AND interes = 'Vértigo Sapiens Online · evaluación inicial';
UPDATE public.contact_submissions SET source = 'desconocido' WHERE source IS NULL;

CREATE INDEX contact_submissions_email_norm_idx ON public.contact_submissions(email_normalized);
CREATE INDEX contact_submissions_phone_norm_idx ON public.contact_submissions(phone_normalized);
CREATE INDEX contact_submissions_next_action_idx ON public.contact_submissions(next_action_at);

CREATE TABLE public.contact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  kind text NOT NULL,
  body text,
  origin text NOT NULL DEFAULT 'sistema',
  author_id uuid,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_request_id uuid REFERENCES public.payment_requests(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_events_contact_idx ON public.contact_events(contact_id, occurred_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_events TO authenticated;
GRANT ALL ON public.contact_events TO service_role;
ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view contact events" ON public.contact_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can create contact events" ON public.contact_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND author_id = auth.uid());
CREATE POLICY "Admins can update contact events" ON public.contact_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete contact events" ON public.contact_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.log_contact_received()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.contact_events(contact_id, kind, body, origin, occurred_at)
  VALUES (NEW.id, 'formulario', 'Contacto recibido', coalesce(NEW.source, 'desconocido'), NEW.created_at);
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.log_contact_received() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER contact_submissions_log_received
AFTER INSERT ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.log_contact_received();

INSERT INTO public.contact_events(contact_id, kind, body, origin, occurred_at)
SELECT id, 'formulario', 'Contacto recibido', source, created_at FROM public.contact_submissions;