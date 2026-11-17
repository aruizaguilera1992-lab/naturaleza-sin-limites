CREATE TABLE public.activity_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24),'hex'),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'borrador',
  participants jsonb NOT NULL DEFAULT '[]'::jsonb,
  rgpd_accepted_at timestamptz,
  sent_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_dossiers TO authenticated;
GRANT ALL ON public.activity_dossiers TO service_role;
ALTER TABLE public.activity_dossiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage dossiers" ON public.activity_dossiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER activity_dossiers_updated_at BEFORE UPDATE ON public.activity_dossiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_activity_dossier(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE d public.activity_dossiers; b public.bookings;
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('available',false); END IF;
  SELECT * INTO d FROM public.activity_dossiers WHERE token=_token;
  IF NOT FOUND OR d.status NOT IN ('enviado','completado') OR (d.expires_at IS NOT NULL AND d.expires_at < now()) THEN RETURN jsonb_build_object('available',false); END IF;
  SELECT * INTO b FROM public.bookings WHERE id=d.booking_id;
  RETURN jsonb_build_object('available',true,'content',d.content,'status',d.status,'participants',d.participants,
    'completed_at',d.completed_at,'activity',b.activity,'date',b.preferred_date,'people',b.number_of_people);
END $$;

CREATE OR REPLACE FUNCTION public.submit_activity_dossier(_token text, _participants jsonb, _rgpd boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE d public.activity_dossiers; n int; p jsonb;
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('ok',false,'reason','not_available'); END IF;
  SELECT * INTO d FROM public.activity_dossiers WHERE token=_token FOR UPDATE;
  IF NOT FOUND OR d.status NOT IN ('enviado','completado') OR (d.expires_at IS NOT NULL AND d.expires_at < now()) THEN RETURN jsonb_build_object('ok',false,'reason','not_available'); END IF;
  IF _rgpd IS DISTINCT FROM true THEN RETURN jsonb_build_object('ok',false,'reason','rgpd'); END IF;
  IF jsonb_typeof(_participants) <> 'array' THEN RETURN jsonb_build_object('ok',false,'reason','invalid'); END IF;
  n := jsonb_array_length(_participants);
  IF n < 1 OR n > 6 OR length(_participants::text) > 20000 THEN RETURN jsonb_build_object('ok',false,'reason','invalid'); END IF;
  FOR p IN SELECT * FROM jsonb_array_elements(_participants) LOOP
    IF length(btrim(coalesce(p->>'fullName',''))) < 3 OR coalesce(p->>'docId','') !~* '^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z0-9]{6,12})$'
       OR coalesce(p->>'birthDate','') !~ '^\d{4}-\d{2}-\d{2}$' OR length(coalesce(p->>'phone','')) < 9
       OR length(btrim(coalesce(p->>'emergencyName',''))) < 2 OR length(coalesce(p->>'emergencyPhone','')) < 9 THEN
      RETURN jsonb_build_object('ok',false,'reason','invalid');
    END IF;
  END LOOP;
  UPDATE public.activity_dossiers SET participants=_participants, rgpd_accepted_at=now(), status='completado', completed_at=now() WHERE id=d.id;
  RETURN jsonb_build_object('ok',true);
END $$;
GRANT EXECUTE ON FUNCTION public.get_activity_dossier(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_activity_dossier(text, jsonb, boolean) TO anon, authenticated;