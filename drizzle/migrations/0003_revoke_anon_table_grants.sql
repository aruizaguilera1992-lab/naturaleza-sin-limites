-- Public form submissions go through the submit-request edge function (service role),
-- so the anon role does not need direct table access. Removing these grants also
-- removes the tables from the publicly introspectable GraphQL schema.
REVOKE INSERT ON public.bookings FROM anon;
REVOKE INSERT ON public.contact_submissions FROM anon;