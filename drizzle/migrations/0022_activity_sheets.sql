CREATE TABLE public.activity_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador','enviada','desactivada')),
  contact_id uuid REFERENCES public.contact_submissions(id) ON DELETE SET NULL,
  expires_at timestamptz,
  sent_at timestamptz,
  first_viewed_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_sheets TO authenticated;
GRANT ALL ON public.activity_sheets TO service_role;
ALTER TABLE public.activity_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage activity sheets" ON public.activity_sheets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER activity_sheets_updated_at BEFORE UPDATE ON public.activity_sheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_activity_sheet(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.activity_sheets;
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN jsonb_build_object('available', false); END IF;
  SELECT * INTO s FROM public.activity_sheets WHERE token = _token;
  IF NOT FOUND OR s.status <> 'enviada' OR (s.expires_at IS NOT NULL AND s.expires_at < now()) THEN
    RETURN jsonb_build_object('available', false);
  END IF;
  UPDATE public.activity_sheets SET first_viewed_at = coalesce(first_viewed_at, now()), view_count = view_count + 1 WHERE id = s.id;
  RETURN jsonb_build_object('available', true, 'content', s.content, 'expires_at', s.expires_at);
END $$;
REVOKE ALL ON FUNCTION public.get_activity_sheet(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_activity_sheet(text) TO anon, authenticated, service_role;