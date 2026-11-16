CREATE TABLE public.catalog_entries (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  photos text[] NOT NULL DEFAULT '{}',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_entries TO authenticated;
GRANT ALL ON public.catalog_entries TO service_role;
ALTER TABLE public.catalog_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage catalog entries" ON public.catalog_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER catalog_entries_updated_at BEFORE UPDATE ON public.catalog_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public read catalog photos" ON storage.objects FOR SELECT USING (bucket_id = 'catalog-photos');
CREATE POLICY "Admins upload catalog photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update catalog photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete catalog photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'));