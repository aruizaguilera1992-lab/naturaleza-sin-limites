GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;