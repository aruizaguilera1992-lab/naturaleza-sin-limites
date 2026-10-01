-- PASO 1 estabilización: RPC de plazas solo backend + lectura pública por vista de proyección fija.

-- 1) RPC de plazas: solo service_role (todas las sobrecargas existentes con esos nombres).
DO $$
DECLARE f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public'
             AND p.proname IN ('reserve_event_seats','confirm_event_seats','release_event_seats','release_expired_event_holds')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- Las funciones futuras de public no se conceden a PUBLIC por defecto.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 2) Tabla base privada: solo administradores (RLS) y service_role.
DROP POLICY IF EXISTS "Anyone can view published events" ON public.activity_events;
REVOKE ALL ON public.activity_events FROM PUBLIC, anon;
REVOKE ALL ON public.activity_events FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_events TO authenticated; -- RLS: solo admin
GRANT ALL ON public.activity_events TO service_role;

-- 3) Vista pública con allowlist fija de columnas.
-- Intencional: NO security_invoker. Corre con permisos del propietario (postgres) y
-- omite el RLS de la tabla base; es seguro porque la proyección es fija (nunca
-- meeting_point_private, notes, guide_name, created_by) y el filtro fija
-- status publicada/completa + event_type open_group. security_barrier impide
-- que predicados del cliente se evalúen antes del filtro.
CREATE VIEW public.activity_events_public
WITH (security_barrier = true) AS
SELECT id, category, slug, title, starts_at, ends_at, meeting_point_public,
       latitude, longitude, capacity_total, seats_reserved, price_cents, status, event_type
FROM public.activity_events
WHERE status IN ('publicada', 'completa')
  AND event_type = 'open_group';

ALTER VIEW public.activity_events_public OWNER TO postgres;
COMMENT ON VIEW public.activity_events_public IS
  'Lectura pública de salidas. Bypass RLS intencional: proyección fija sin campos privados y filtro publicada/completa + open_group.';
REVOKE ALL ON public.activity_events_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.activity_events_public TO anon, authenticated;
GRANT SELECT ON public.activity_events_public TO service_role;