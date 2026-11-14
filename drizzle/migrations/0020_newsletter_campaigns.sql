CREATE TABLE public.newsletter_campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), piece_id uuid REFERENCES public.editorial_pieces(id),
 subject text NOT NULL DEFAULT '' CHECK(length(subject)<=200), preheader text NOT NULL DEFAULT '' CHECK(length(preheader)<=300),
 title text NOT NULL DEFAULT '', content text NOT NULL DEFAULT '' CHECK(length(content)<=100000),
 segments text[] NOT NULL DEFAULT '{}' CHECK(segments <@ ARRAY['barranquismo','ferratas','espeleologia']::text[]),
 status text NOT NULL DEFAULT 'borrador' CHECK(status IN ('borrador','programada','enviando','enviada','cancelada')),
 scheduled_at timestamptz, audience_at timestamptz, created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 lease_id uuid, lease_expires_at timestamptz
);
GRANT SELECT ON public.newsletter_campaigns TO authenticated;
GRANT ALL ON public.newsletter_campaigns TO service_role;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_admin_read ON public.newsletter_campaigns FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.newsletter_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES public.newsletter_campaigns(id), subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id),
 confirmed_at timestamptz NOT NULL, email text NOT NULL, unsubscribe_token text NOT NULL,
 notification_log_id uuid REFERENCES public.notification_log(id),
 status text NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','enviado','fallido','omitido')),
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), last_error text, provider_id text, sent_at timestamptz,
 UNIQUE(campaign_id,subscriber_id)
);
GRANT SELECT ON public.newsletter_deliveries TO authenticated;
GRANT ALL ON public.newsletter_deliveries TO service_role;
ALTER TABLE public.newsletter_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_admin_read ON public.newsletter_deliveries FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE INDEX campaign_due ON public.newsletter_campaigns(status,scheduled_at);
CREATE INDEX delivery_due ON public.newsletter_deliveries(campaign_id,status,next_attempt_at);
CREATE FUNCTION public.manage_newsletter_campaign(_action text, _id uuid, _payload jsonb, _actor uuid, _expected timestamptz DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.newsletter_campaigns%ROWTYPE; result uuid;
BEGIN
 IF NOT public.has_role(_actor,'admin') THEN RAISE EXCEPTION 'No autorizado'; END IF;
 IF _id IS NOT NULL THEN
  SELECT * INTO c FROM public.newsletter_campaigns WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Campaña no encontrada'; END IF;
  IF _expected IS NOT NULL AND c.updated_at<>_expected THEN RAISE EXCEPTION 'La campaña cambió en otra sesión; vuelve a abrirla'; END IF;
 END IF;
 IF _action='save' THEN
  IF _id IS NOT NULL AND c.status<>'borrador' THEN RAISE EXCEPTION 'Solo se editan borradores'; END IF;
  IF _id IS NULL THEN
   INSERT INTO public.newsletter_campaigns(piece_id,subject,preheader,title,content,segments,created_by) VALUES(NULLIF(_payload->>'piece_id','')::uuid,_payload->>'subject',_payload->>'preheader',_payload->>'title',_payload->>'content',ARRAY(SELECT jsonb_array_elements_text(_payload->'segments')),_actor) RETURNING id INTO result;
  ELSE
   UPDATE public.newsletter_campaigns SET piece_id=NULLIF(_payload->>'piece_id','')::uuid,subject=_payload->>'subject',preheader=_payload->>'preheader',title=_payload->>'title',content=_payload->>'content',segments=ARRAY(SELECT jsonb_array_elements_text(_payload->'segments')),updated_at=clock_timestamp() WHERE id=_id RETURNING id INTO result;
  END IF;
 ELSIF _action='start' THEN
  IF c.status<>'borrador' OR length(trim(c.subject))=0 OR length(trim(c.title))=0 OR length(trim(c.content))=0 OR cardinality(c.segments)=0 THEN RAISE EXCEPTION 'Completa asunto, título, contenido y disciplinas del borrador'; END IF;
  IF _payload->>'scheduled_at' IS NOT NULL AND (_payload->>'scheduled_at')::timestamptz<=now() THEN RAISE EXCEPTION 'Elige una fecha futura'; END IF;
  UPDATE public.newsletter_campaigns SET status='programada',scheduled_at=COALESCE((_payload->>'scheduled_at')::timestamptz,now()),updated_at=clock_timestamp() WHERE id=_id RETURNING id INTO result;
 ELSIF _action='cancel' THEN
  IF c.status NOT IN ('borrador','programada','enviando') THEN RAISE EXCEPTION 'Esta campaña no se puede cancelar'; END IF;
  UPDATE public.newsletter_campaigns SET status='cancelada',updated_at=clock_timestamp() WHERE id=_id RETURNING id INTO result;
 ELSE RAISE EXCEPTION 'Acción no válida'; END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.manage_newsletter_campaign(text,uuid,jsonb,uuid,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.manage_newsletter_campaign(text,uuid,jsonb,uuid,timestamptz) TO service_role;
CREATE FUNCTION public.claim_newsletter_campaign(_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.newsletter_campaigns%ROWTYPE; lease uuid:=gen_random_uuid();
BEGIN
 SELECT * INTO c FROM public.newsletter_campaigns WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR c.status NOT IN ('programada','enviando') OR c.scheduled_at>now() OR c.lease_expires_at>now() THEN RETURN jsonb_build_object('claimed',false); END IF;
 IF c.audience_at IS NULL THEN
  INSERT INTO public.newsletter_deliveries(campaign_id,subscriber_id,confirmed_at,email,unsubscribe_token)
   SELECT c.id,s.id,s.confirmed_at,s.email,s.unsubscribe_token FROM public.newsletter_subscribers s
   WHERE s.status='confirmado' AND s.confirmed_at IS NOT NULL AND s.unsubscribed_at IS NULL AND s.segments && c.segments
   ON CONFLICT(campaign_id,subscriber_id) DO NOTHING;
 END IF;
 UPDATE public.newsletter_campaigns SET status='enviando',audience_at=COALESCE(audience_at,now()),lease_id=lease,lease_expires_at=now()+interval '3 minutes',updated_at=clock_timestamp() WHERE id=c.id;
 RETURN jsonb_build_object('claimed',true,'lease_id',lease);
END $$;
REVOKE ALL ON FUNCTION public.claim_newsletter_campaign(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_newsletter_campaign(uuid) TO service_role;
CREATE FUNCTION public.finish_newsletter_campaign(_id uuid,_lease uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.newsletter_campaigns SET status=CASE WHEN status='cancelada' THEN status WHEN EXISTS(SELECT 1 FROM public.newsletter_deliveries WHERE campaign_id=_id AND status='pendiente') THEN 'enviando' ELSE 'enviada' END,lease_id=NULL,lease_expires_at=NULL,updated_at=clock_timestamp() WHERE id=_id AND lease_id=_lease;
END $$;
REVOKE ALL ON FUNCTION public.finish_newsletter_campaign(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_newsletter_campaign(uuid,uuid) TO service_role;