CREATE OR REPLACE FUNCTION public.gen_sheet_short_code() RETURNS text LANGUAGE plpgsql VOLATILE SET search_path = public, extensions AS $$
DECLARE alphabet text := 'abcdefghijkmnpqrstuvwxyz23456789'; b bytea := extensions.gen_random_bytes(10); r text := ''; i int;
BEGIN FOR i IN 0..9 LOOP r := r || substr(alphabet, (get_byte(b, i) % 32) + 1, 1); END LOOP; RETURN r; END $$;

ALTER TABLE public.activity_sheets ADD COLUMN IF NOT EXISTS short_code text;
UPDATE public.activity_sheets SET short_code = public.gen_sheet_short_code() WHERE short_code IS NULL;
ALTER TABLE public.activity_sheets ALTER COLUMN short_code SET DEFAULT public.gen_sheet_short_code();
CREATE UNIQUE INDEX IF NOT EXISTS activity_sheets_short_code_key ON public.activity_sheets(short_code);

CREATE OR REPLACE FUNCTION public.resolve_activity_sheet_code(_code text) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT token FROM public.activity_sheets
  WHERE short_code = lower(_code) AND status = 'enviada' AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.resolve_activity_sheet_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_activity_sheet_code(text) TO anon, authenticated, service_role;