ALTER TABLE public.plan_orders
  ADD COLUMN IF NOT EXISTS portal_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  ADD COLUMN IF NOT EXISTS last_invoice_status text,
  ADD COLUMN IF NOT EXISTS last_invoice_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_invoice_amount_cents integer;

CREATE UNIQUE INDEX IF NOT EXISTS plan_orders_portal_token_key ON public.plan_orders(portal_token);
CREATE INDEX IF NOT EXISTS plan_orders_customer_idx ON public.plan_orders(stripe_customer_id);
