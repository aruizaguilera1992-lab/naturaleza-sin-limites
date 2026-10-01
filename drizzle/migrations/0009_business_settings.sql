CREATE TABLE public.business_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  legal_name text,
  trade_name text,
  tax_id text,
  address text,
  tourism_registry text,
  insurer text,
  rc_policy text,
  accident_policy text,
  contact_email text,
  contact_phone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.business_settings TO authenticated;
GRANT ALL ON public.business_settings TO service_role;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read business settings" ON public.business_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert business settings" ON public.business_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update business settings" ON public.business_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER business_settings_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
COMMENT ON TABLE public.business_settings IS 'Single-row legal/Turismo Activo data shown on public legal pages (public by law).';