ALTER TABLE public.activity_events ADD COLUMN IF NOT EXISTS catalog_snapshot jsonb;

CREATE OR REPLACE VIEW public.activity_events_public AS
 SELECT id, category, slug, title, starts_at, ends_at, meeting_point_public, latitude, longitude,
    capacity_total, seats_reserved, price_cents, status, event_type, rules, steps, catalog_snapshot
   FROM public.activity_events
  WHERE status = ANY (ARRAY['publicada'::text, 'completa'::text]) AND event_type = 'open_group'::text;