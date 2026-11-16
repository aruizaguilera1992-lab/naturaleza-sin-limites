CREATE OR REPLACE FUNCTION public.admin_delete_activity_sheet(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sheet public.activity_sheets%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO sheet FROM public.activity_sheets WHERE id = _id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ficha no encontrada'; END IF;
  IF sheet.accepted_at IS NOT NULL AND sheet.booking_id IS NOT NULL THEN
    RAISE EXCEPTION 'La ficha fue aceptada y tiene una reserva vinculada: elimina primero la reserva';
  END IF;
  DELETE FROM public.activity_sheets WHERE id = _id;
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE ALL ON FUNCTION public.admin_delete_activity_sheet(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_activity_sheet(uuid) TO authenticated;