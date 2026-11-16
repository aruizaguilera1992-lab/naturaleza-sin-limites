DROP POLICY IF EXISTS "Public read catalog photos" ON storage.objects;
CREATE POLICY "Admins read catalog photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'));