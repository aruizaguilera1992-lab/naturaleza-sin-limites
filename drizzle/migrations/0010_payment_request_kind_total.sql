ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS total_cents integer;
ALTER TABLE public.payment_requests
  ADD CONSTRAINT payment_requests_kind_check CHECK (kind IN ('manual','senal'));
UPDATE public.payment_requests SET kind = 'senal' WHERE concept LIKE 'Señal 30%%' AND booking_id IS NOT NULL;