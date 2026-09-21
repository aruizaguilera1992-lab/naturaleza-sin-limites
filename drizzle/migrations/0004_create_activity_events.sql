CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  meeting_point_public text,
  meeting_point_private text,
  latitude numeric,
  longitude numeric,
  capacity_total integer NOT NULL DEFAULT 6,
  seats_reserved integer NOT NULL DEFAULT 0,
  price_cents integer,
  status text NOT NULL DEFAULT 'borrador',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activity_events_capacity_positive CHECK (capacity_total > 0 AND capacity_total <= 20),
  CONSTRAINT activity_events_seats_range CHECK (seats_reserved >= 0 AND seats_reserved <= capacity_total),
  CONSTRAINT activity_events_status_valid CHECK (status IN ('borrador','publicada','completa','cancelada'))
);

CREATE INDEX idx_activity_events_slug ON public.activity_events (category, slug);
CREATE INDEX idx_activity_events_starts_at ON public.activity_events (starts_at);

GRANT SELECT ON public.activity_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON public.activity_events FOR SELECT
  USING (status IN ('publicada','completa'));

CREATE POLICY "Admins can view all events"
  ON public.activity_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create events"
  ON public.activity_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update events"
  ON public.activity_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete events"
  ON public.activity_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_activity_events_updated_at
  BEFORE UPDATE ON public.activity_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.activity_event_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.activity_events(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  participants integer NOT NULL,
  state text NOT NULL DEFAULT 'bloqueada',
  hold_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activity_event_bookings_booking_unique UNIQUE (booking_id),
  CONSTRAINT activity_event_bookings_participants CHECK (participants > 0),
  CONSTRAINT activity_event_bookings_state CHECK (state IN ('bloqueada','confirmada','liberada'))
);

CREATE INDEX idx_activity_event_bookings_event ON public.activity_event_bookings (event_id);

GRANT SELECT, UPDATE ON public.activity_event_bookings TO authenticated;
GRANT ALL ON public.activity_event_bookings TO service_role;

ALTER TABLE public.activity_event_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view event bookings"
  ON public.activity_event_bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event bookings"
  ON public.activity_event_bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_activity_event_bookings_updated_at
  BEFORE UPDATE ON public.activity_event_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bookings ADD COLUMN event_id uuid REFERENCES public.activity_events(id) ON DELETE SET NULL;
