REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_request(text, text, text, integer, text, text) TO service_role;