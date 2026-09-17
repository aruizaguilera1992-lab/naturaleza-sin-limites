-- 1. Public forms go through the submit-request edge function (service role),
--    so remove unvalidated public INSERT paths into the request tables.
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- 2. Remove all anon privileges: nothing in this app is read or written
--    with the public key, so tables must not be discoverable pre sign-in.
REVOKE ALL ON public.bookings FROM anon;
REVOKE ALL ON public.contact_submissions FROM anon;
REVOKE ALL ON public.notification_log FROM anon;
REVOKE ALL ON public.payment_requests FROM anon;
REVOKE ALL ON public.user_roles FROM anon;

-- 3. Least privilege for signed-in users: only what admin RLS policies allow.
REVOKE ALL ON public.bookings FROM authenticated;
REVOKE ALL ON public.contact_submissions FROM authenticated;
REVOKE ALL ON public.notification_log FROM authenticated;
REVOKE ALL ON public.payment_requests FROM authenticated;
REVOKE ALL ON public.user_roles FROM authenticated;

GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT SELECT, UPDATE ON public.notification_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_requests TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.contact_submissions TO service_role;
GRANT ALL ON public.notification_log TO service_role;
GRANT ALL ON public.payment_requests TO service_role;
GRANT ALL ON public.user_roles TO service_role;

-- 4. SECURITY DEFINER functions: only the backend may execute the ones that
--    mutate payments/notifications. has_role stays callable because RLS
--    policies evaluate it as the calling role.
REVOKE ALL ON FUNCTION public.begin_checkout_generation(text, text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.claim_notification(uuid, integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.finish_notification(uuid, uuid, text, text, text, integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.record_checkout_session(text, integer, text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text, text, boolean, text, jsonb) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.grant_admin_to_owner_emails() FROM anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.begin_checkout_generation(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_notification(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_notification(uuid, uuid, text, text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_checkout_session(text, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text, text, boolean, text, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;