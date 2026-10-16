-- Prepared for an explicitly selected isolated database. No writes, secrets,
-- customer identifiers, names, contacts or payment tokens are selected.
BEGIN TRANSACTION READ ONLY;

SELECT current_setting('transaction_read_only') AS transaction_read_only,
       to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS has_drizzle_history,
       to_regclass('public.activity_events') IS NOT NULL AS has_activity_events,
       to_regclass('public.activity_event_bookings') IS NOT NULL AS has_event_bookings;

-- Only metadata from migration tracking is printed, including when absent.
DO $$
DECLARE history jsonb;
BEGIN
  IF to_regclass('drizzle.__drizzle_migrations') IS NULL THEN
    RAISE NOTICE 'drizzle_history_missing: stop and identify the actual migration runner';
  ELSE
    EXECUTE 'SELECT jsonb_agg(jsonb_build_object(''hash'',hash,''created_at'',created_at) ORDER BY created_at) FROM drizzle.__drizzle_migrations'
      INTO history;
    RAISE NOTICE 'drizzle_history=%', history;
  END IF;
END $$;

SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND ((table_name = 'bookings' AND column_name IN ('discount_cents','discount_percent'))
    OR (table_name = 'payment_requests' AND column_name IN
      ('checkout_expires_at','checkout_expires_generation','hold_extended_at')))
ORDER BY table_name, column_name;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = to_regclass('public.activity_events')
  AND conname IN ('activity_events_capacity_positive','activity_events_seats_range');

DO $$
DECLARE counts jsonb;
BEGIN
  IF to_regclass('public.activity_events') IS NULL THEN
    RAISE NOTICE 'activity_events_missing: stop and establish the baseline schema';
  ELSE
    EXECUTE 'SELECT jsonb_build_object(
      ''events'',count(*),
      ''oversized'',count(*) FILTER (WHERE capacity_total > 6),
      ''oversized_reserved'',count(*) FILTER (WHERE capacity_total > 6 AND seats_reserved > 0),
      ''invalid_seats'',count(*) FILTER (WHERE seats_reserved < 0 OR seats_reserved > capacity_total),
      ''max_capacity'',max(capacity_total)) FROM public.activity_events'
      INTO counts;
    RAISE NOTICE 'capacity_preflight=%', counts;
  END IF;
END $$;

-- This transaction deliberately makes no schema or data changes.
ROLLBACK;
