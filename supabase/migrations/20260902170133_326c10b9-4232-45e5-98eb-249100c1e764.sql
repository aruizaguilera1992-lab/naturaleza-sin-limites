ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS admin_notes text;