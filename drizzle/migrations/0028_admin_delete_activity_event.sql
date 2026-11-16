CREATE OR REPLACE FUNCTION public.admin_delete_activity_event(_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE ev public.activity_events%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO ev FROM public.activity_events WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Salida no encontrada'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.activity_event_bookings
     WHERE event_id = _id AND state <> 'liberada'
  ) THEN
    RAISE EXCEPTION 'La salida tiene reservas activas: elimina primero la reserva desde Reservas';
  END IF;
  DELETE FROM public.activity_events WHERE id = _id;
  RETURN jsonb_build_object('ok', true);
END
$function$;

GRANT EXECUTE ON FUNCTION public.admin_delete_activity_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_activity_event(uuid) TO service_role;