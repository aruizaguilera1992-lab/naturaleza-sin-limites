-- Regresión PASO 1: RPC de plazas solo backend y privacidad de salidas.
-- Ejecutar como postgres. Todo ocurre dentro de una transacción con ROLLBACK:
-- no deja salidas, reservas ni usuarios. Cualquier fallo lanza 'FAIL ...'.
BEGIN;

-- Fixtures (fijos, solo dentro de esta transacción)
INSERT INTO public.activity_events (id, category, slug, title, starts_at, capacity_total, status, event_type,
  meeting_point_public, meeting_point_private, notes, guide_name)
VALUES
 ('00000000-0000-4000-a000-000000000001','barranquismo','test-step1','TEST pub', now()+interval '10 days',6,'publicada','open_group','Zona X','SECRETO-PUNTO','SECRETO-NOTA','SECRETO-GUIA'),
 ('00000000-0000-4000-a000-000000000002','barranquismo','test-step1','TEST draft', now()+interval '10 days',6,'borrador','open_group',null,'SECRETO-PUNTO',null,null),
 ('00000000-0000-4000-a000-000000000003','barranquismo','test-step1','TEST private', now()+interval '10 days',6,'publicada','private',null,'SECRETO-PUNTO',null,null);
INSERT INTO public.bookings (id, activity, contact) VALUES
 ('00000000-0000-4000-b000-000000000001','TEST','test@invalid');
SELECT set_config('test.admin', (SELECT user_id::text FROM public.user_roles WHERE role='admin' LIMIT 1), true);
DO $$BEGIN IF current_setting('test.admin', true) IS NULL OR current_setting('test.admin', true) = '' THEN
  RAISE EXCEPTION 'FAIL fixture: no hay administrador para probar CRUD'; END IF; END$$;

-- ===== anon =====
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
DO $$BEGIN PERFORM public.reserve_event_seats('00000000-0000-4000-a000-000000000001','00000000-0000-4000-b000-000000000001',1,30); RAISE EXCEPTION 'FAIL anon reserve'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM public.confirm_event_seats('00000000-0000-4000-b000-000000000001'); RAISE EXCEPTION 'FAIL anon confirm'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM public.release_event_seats('00000000-0000-4000-b000-000000000001', null); RAISE EXCEPTION 'FAIL anon release'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM public.release_expired_event_holds(); RAISE EXCEPTION 'FAIL anon release_expired'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM 1 FROM public.activity_events; RAISE EXCEPTION 'FAIL anon lee tabla base'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM meeting_point_private FROM public.activity_events; RAISE EXCEPTION 'FAIL anon lee columna privada'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN INSERT INTO public.activity_events (category,slug,title,starts_at) VALUES ('a','b','c',now()); RAISE EXCEPTION 'FAIL anon inserta'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN DELETE FROM public.activity_events_public; RAISE EXCEPTION 'FAIL anon DML en vista'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$DECLARE j text; n int; BEGIN
  SELECT count(*), string_agg(row_to_json(v)::text, ' ') INTO n, j FROM public.activity_events_public v WHERE slug='test-step1';
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL anon vista: esperaba 1 salida pública, hay %', n; END IF;
  IF j LIKE '%SECRETO%' OR j LIKE '%meeting_point_private%' OR j LIKE '%"notes"%' OR j LIKE '%guide_name%' OR j LIKE '%created_by%' THEN
    RAISE EXCEPTION 'FAIL anon vista expone privados: %', j; END IF;
END$$;
RESET ROLE;

-- ===== authenticated no admin =====
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
DO $$BEGIN PERFORM public.reserve_event_seats('00000000-0000-4000-a000-000000000001','00000000-0000-4000-b000-000000000001',1,30); RAISE EXCEPTION 'FAIL auth reserve'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM public.confirm_event_seats('00000000-0000-4000-b000-000000000001'); RAISE EXCEPTION 'FAIL auth confirm'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM public.release_event_seats('00000000-0000-4000-b000-000000000001', null); RAISE EXCEPTION 'FAIL auth release'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM public.release_expired_event_holds(); RAISE EXCEPTION 'FAIL auth release_expired'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$DECLARE n int; BEGIN SELECT count(*) INTO n FROM public.activity_events; IF n <> 0 THEN RAISE EXCEPTION 'FAIL no-admin ve % filas de la tabla base', n; END IF; END$$;
DO $$DECLARE n int; BEGIN UPDATE public.activity_events SET title='x' WHERE slug='test-step1'; GET DIAGNOSTICS n = ROW_COUNT; IF n <> 0 THEN RAISE EXCEPTION 'FAIL no-admin actualiza'; END IF; END$$;
DO $$BEGIN INSERT INTO public.activity_events (category,slug,title,starts_at) VALUES ('a','b','c',now()); RAISE EXCEPTION 'FAIL no-admin inserta'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN TRUNCATE public.activity_events CASCADE; RAISE EXCEPTION 'FAIL no-admin TRUNCATE'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$DECLARE j text; n int; BEGIN
  SELECT count(*), string_agg(row_to_json(v)::text, ' ') INTO n, j FROM public.activity_events_public v WHERE slug='test-step1';
  IF n <> 1 OR j LIKE '%SECRETO%' THEN RAISE EXCEPTION 'FAIL no-admin vista: n=% j=%', n, j; END IF;
END$$;
RESET ROLE;

-- ===== authenticated admin =====
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('test.admin'), 'role','authenticated')::text, true);
DO $$DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM public.activity_events WHERE slug='test-step1';
  IF n <> 3 THEN RAISE EXCEPTION 'FAIL admin ve % de 3', n; END IF;
  PERFORM 1 FROM public.activity_events WHERE meeting_point_private='SECRETO-PUNTO';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL admin no lee punto privado'; END IF;
  INSERT INTO public.activity_events (id,category,slug,title,starts_at) VALUES ('00000000-0000-4000-a000-000000000009','barranquismo','test-step1','TEST admin',now()+interval '20 days');
  UPDATE public.activity_events SET title='TEST admin 2' WHERE id='00000000-0000-4000-a000-000000000009';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION 'FAIL admin update'; END IF;
  DELETE FROM public.activity_events WHERE id='00000000-0000-4000-a000-000000000009';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION 'FAIL admin delete'; END IF;
END$$;
DO $$BEGIN PERFORM public.reserve_event_seats('00000000-0000-4000-a000-000000000001','00000000-0000-4000-b000-000000000001',1,30); RAISE EXCEPTION 'FAIL admin reserve directo'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
RESET ROLE;

-- ===== service_role (backend) =====
SET LOCAL ROLE service_role;
DO $$DECLARE r jsonb; BEGIN
  r := public.reserve_event_seats('00000000-0000-4000-a000-000000000001','00000000-0000-4000-b000-000000000001',2,30);
  IF NOT (r->>'ok')::boolean THEN RAISE EXCEPTION 'FAIL service reserve: %', r; END IF;
  r := public.confirm_event_seats('00000000-0000-4000-b000-000000000001');
  IF NOT (r->>'ok')::boolean THEN RAISE EXCEPTION 'FAIL service confirm: %', r; END IF;
  r := public.release_event_seats('00000000-0000-4000-b000-000000000001','test');
  IF NOT (r->>'ok')::boolean THEN RAISE EXCEPTION 'FAIL service release: %', r; END IF;
  PERFORM public.release_expired_event_holds();
  PERFORM 1 FROM public.activity_events WHERE id='00000000-0000-4000-a000-000000000001' AND seats_reserved=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL service plazas no vuelven a 0'; END IF;
END$$;
RESET ROLE;

-- ===== auditoría de privilegios (complementaria) =====
DO $$DECLARE bad text; BEGIN
  SELECT string_agg(p.oid::regprocedure::text, ', ') INTO bad FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname IN ('reserve_event_seats','confirm_event_seats','release_event_seats','release_expired_event_holds')
     AND (has_function_privilege('anon', p.oid, 'EXECUTE') OR has_function_privilege('authenticated', p.oid, 'EXECUTE')
          OR NOT has_function_privilege('service_role', p.oid, 'EXECUTE'));
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'FAIL ACL sobrecargas: %', bad; END IF;
END$$;

SELECT 'STEP1 OK' AS result;
ROLLBACK;
