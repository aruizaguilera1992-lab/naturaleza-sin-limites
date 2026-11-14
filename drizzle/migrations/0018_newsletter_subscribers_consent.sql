CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','confirmado','baja')),
  segments text[] NOT NULL DEFAULT '{}',
  confirm_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24),'hex'),
  unsubscribe_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24),'hex'),
  discount_code text,
  source text NOT NULL DEFAULT 'web',
  consent_version text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX newsletter_subscribers_confirm_token_idx ON public.newsletter_subscribers(confirm_token);
CREATE UNIQUE INDEX newsletter_subscribers_unsub_token_idx ON public.newsletter_subscribers(unsubscribe_token);
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER newsletter_subscribers_updated_at BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id),
  action text NOT NULL CHECK (action IN ('alta','confirmacion','baja')),
  consent_text text,
  consent_version text,
  ip text,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consent_records_subscriber_idx ON public.consent_records(subscriber_id);
GRANT SELECT ON public.consent_records TO authenticated;
GRANT ALL ON public.consent_records TO service_role;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view consent records" ON public.consent_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));