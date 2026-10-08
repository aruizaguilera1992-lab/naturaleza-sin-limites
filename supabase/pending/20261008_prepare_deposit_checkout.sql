-- PENDIENTE DE REVISIÓN: NO APLICADA. Se moverá a supabase/migrations en el despliegue coordinado.
-- Aditiva: 3 columnas nullable + 1 función solo service_role. No toca filas existentes.

ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS checkout_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS checkout_expires_generation integer,
  ADD COLUMN IF NOT EXISTS hold_extended_at timestamptz;

COMMENT ON COLUMN public.payment_requests.checkout_expires_at IS
  'Señal: expires_at estable de la sesión de checkout de checkout_expires_generation.';
COMMENT ON COLUMN public.payment_requests.hold_extended_at IS
  'Señal: momento de la única extensión del bloqueo de plazas para cubrir el checkout.';

-- Orden de bloqueo: payment_requests -> activity_event_bookings (igual que
-- begin_checkout_generation / release_event_seats; activity_events solo se lee).
CREATE OR REPLACE FUNCTION public.prepare_deposit_checkout(
  _token text,
  _generation integer,
  _session_seconds integer DEFAULT 1860,
  _webhook_margin_seconds integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pr public.payment_requests%ROWTYPE;
  link public.activity_event_bookings%ROWTYPE;
  ev public.activity_events%ROWTYPE;
  v_expires timestamptz;
  v_hold timestamptz;
BEGIN
  IF _session_seconds < 1800 OR _session_seconds > 3600
     OR _webhook_margin_seconds < 60 OR _webhook_margin_seconds > 900 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_parameters');
  END IF;

  SELECT * INTO pr FROM public.payment_requests WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF pr.kind <> 'senal' THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_deposit'); END IF;
  IF pr.status <> 'pendiente' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'status_not_payable', 'status', pr.status);
  END IF;
  IF pr.checkout_generation IS DISTINCT FROM _generation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'stale_generation');
  END IF;
  IF pr.stripe_session_id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'session_exists');
  END IF;
  IF pr.booking_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'no_event'); END IF;

  SELECT * INTO link FROM public.activity_event_bookings WHERE booking_id = pr.booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'no_event'); END IF;
  IF link.state <> 'bloqueada' THEN RETURN jsonb_build_object('ok', false, 'reason', 'hold_released'); END IF;
  -- Nunca se reactiva un bloqueo ya caducado.
  IF link.hold_expires_at IS NULL OR link.hold_expires_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'hold_expired');
  END IF;

  SELECT * INTO ev FROM public.activity_events WHERE id = link.event_id;
  IF NOT FOUND OR ev.status NOT IN ('publicada', 'completa') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'event_not_bookable');
  END IF;
  IF ev.starts_at <= now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'past_event'); END IF;

  -- Reintento / concurrencia en la misma generación: mismos parámetros.
  IF pr.checkout_expires_generation = _generation AND pr.checkout_expires_at IS NOT NULL THEN
    IF link.hold_expires_at < pr.checkout_expires_at + make_interval(secs => _webhook_margin_seconds) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'hold_not_covering');
    END IF;
    RETURN jsonb_build_object(
      'ok', true, 'reused', true,
      'expires_at', floor(extract(epoch FROM pr.checkout_expires_at))::bigint,
      'hold_expires_at', floor(extract(epoch FROM link.hold_expires_at))::bigint
    );
  END IF;

  -- Una sola extensión por señal: una generación nueva no alarga otra vez.
  IF pr.hold_extended_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'hold_already_extended');
  END IF;

  v_expires := to_timestamp(ceil(extract(epoch FROM now() + make_interval(secs => _session_seconds)) / 60) * 60);
  v_hold := GREATEST(link.hold_expires_at, v_expires + make_interval(secs => _webhook_margin_seconds));
  IF v_hold >= ev.starts_at THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'event_too_close');
  END IF;

  UPDATE public.activity_event_bookings
     SET hold_expires_at = v_hold, updated_at = now()
   WHERE id = link.id;

  UPDATE public.payment_requests
     SET checkout_expires_at = v_expires,
         checkout_expires_generation = _generation,
         hold_extended_at = now()
   WHERE id = pr.id;

  RETURN jsonb_build_object(
    'ok', true, 'reused', false,
    'expires_at', floor(extract(epoch FROM v_expires))::bigint,
    'hold_expires_at', floor(extract(epoch FROM v_hold))::bigint
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.prepare_deposit_checkout(text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_deposit_checkout(text, integer, integer, integer) TO service_role;
