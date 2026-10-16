-- LOCAL COMPATIBILITY BASELINE ONLY.
-- 0012 comments on this pre-existing column. No creation is tracked in the
-- available migrations. Match the generated types; do not alter old migrations.
ALTER TABLE public.bookings
  ADD COLUMN discount_cents integer NOT NULL DEFAULT 0;
