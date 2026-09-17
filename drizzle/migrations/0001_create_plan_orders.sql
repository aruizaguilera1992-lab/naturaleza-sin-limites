CREATE TABLE public.plan_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  price_id text NOT NULL,
  product_name text NOT NULL,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  amount_cents integer,
  currency text NOT NULL DEFAULT 'eur',
  customer_email text,
  customer_name text,
  customer_phone text,
  environment text NOT NULL DEFAULT 'sandbox',
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_end timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_orders_email ON public.plan_orders (customer_email);
CREATE INDEX idx_plan_orders_subscription ON public.plan_orders (stripe_subscription_id);

GRANT SELECT, UPDATE ON public.plan_orders TO authenticated;
GRANT ALL ON public.plan_orders TO service_role;

ALTER TABLE public.plan_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view plan orders"
  ON public.plan_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plan orders"
  ON public.plan_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_plan_orders_updated_at
  BEFORE UPDATE ON public.plan_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();