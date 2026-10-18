-- LOCAL COMPATIBILITY BASELINE ONLY.
-- The first tracked Supabase migration alters this pre-existing table.
-- Its original CREATE TABLE is absent from the available migration history.
-- Fields below follow the repository's generated table types, not a live dump.
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  contacto text NOT NULL,
  interes text NOT NULL,
  mensaje text,
  personas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
