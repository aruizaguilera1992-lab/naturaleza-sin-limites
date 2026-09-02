CREATE TABLE public.payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  amount_cents integer NOT NULL CHECK (amount_cents >= 50),
  currency text NOT NULL DEFAULT 'eur',
  concept text NOT NULL,
  customer_email text,
  status text NOT NULL DEFAULT 'pendiente',
  environment text NOT NULL DEFAULT 'sandbox',
  stripe_session_id text,
  payment_reference text,
  paid_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '14 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_requests_target_check CHECK (num_nonnulls(booking_id, contact_id) = 1)
);

CREATE INDEX idx_payment_requests_token ON public.payment_requests(token);
CREATE INDEX idx_payment_requests_booking ON public.payment_requests(booking_id);
CREATE INDEX idx_payment_requests_contact ON public.payment_requests(contact_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment requests" ON public.payment_requests
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can create payment requests" ON public.payment_requests
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update payment requests" ON public.payment_requests
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete payment requests" ON public.payment_requests
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bookings
  ADD COLUMN paid_amount_cents integer,
  ADD COLUMN paid_at timestamp with time zone,
  ADD COLUMN payment_reference text;

ALTER TABLE public.contact_submissions
  ADD COLUMN paid_amount_cents integer,
  ADD COLUMN paid_at timestamp with time zone,
  ADD COLUMN payment_reference text;