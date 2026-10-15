ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0
  CHECK (discount_percent >= 0 AND discount_percent <= 100);

COMMENT ON COLUMN public.bookings.discount_percent IS 'Admin-applied discount as a whole percentage (0-100) of the gross activity total. discount_cents is kept only as a legacy fixed-euro fallback.';
COMMENT ON COLUMN public.bookings.discount_cents IS 'DEPRECATED: legacy fixed-euro discount. New discounts are stored in discount_percent.';