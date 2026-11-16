REVOKE EXECUTE ON FUNCTION public.admin_delete_activity_event(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_activity_event(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_activity_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_activity_event(uuid) TO service_role;