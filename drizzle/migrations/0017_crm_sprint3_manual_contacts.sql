GRANT INSERT ON public.contact_submissions TO authenticated;
CREATE POLICY "Admins can create contact submissions" ON public.contact_submissions FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') AND source = 'manual' AND created_by = auth.uid());