-- Read-only preflight. Run again immediately before migration 0013.
-- Contains no customer details, payment tokens or secrets.
SELECT count(*) AS total_events,
       count(*) FILTER (WHERE capacity_total > 6) AS oversized_events,
       count(*) FILTER (WHERE capacity_total > 6 AND seats_reserved > 0) AS oversized_with_reservations,
       max(capacity_total) AS max_capacity
FROM public.activity_events;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.activity_events'::regclass
  AND conname IN ('activity_events_capacity_positive', 'activity_events_seats_range');
