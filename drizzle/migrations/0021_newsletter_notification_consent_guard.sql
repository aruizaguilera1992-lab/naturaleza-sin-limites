CREATE FUNCTION public.guard_newsletter_notification_claim() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.kind='newsletter' AND NEW.status='reclamado' THEN
  IF NOT EXISTS (
   SELECT 1 FROM public.newsletter_deliveries d
   JOIN public.newsletter_campaigns c ON c.id=d.campaign_id
   JOIN public.newsletter_subscribers s ON s.id=d.subscriber_id
   WHERE NEW.dedupe_key='campaign:'||c.id::text||':sub:'||s.id::text
    AND c.status='enviando' AND d.status='pendiente' AND d.attempts<3
    AND s.status='confirmado' AND s.confirmed_at=d.confirmed_at AND s.unsubscribed_at IS NULL
    AND NEW.created_at>now()-interval '23 hours'
  ) THEN RAISE EXCEPTION 'Newsletter: campaña o consentimiento no vigentes; envío bloqueado'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER newsletter_notification_claim_guard BEFORE UPDATE OF status ON public.notification_log FOR EACH ROW EXECUTE FUNCTION public.guard_newsletter_notification_claim();