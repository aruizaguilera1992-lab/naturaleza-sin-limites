CREATE TABLE public.editorial_pieces (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL DEFAULT '', slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), excerpt text NOT NULL DEFAULT '', content text NOT NULL DEFAULT '', featured_image text NOT NULL DEFAULT '' CHECK (featured_image = '' OR featured_image ~ '^https://[^[:space:]]+$' OR featured_image ~ '^/images/[^[:space:]]+$'), category text NOT NULL DEFAULT 'tecnicas-seguridad' CHECK (category IN ('tecnicas-seguridad','rutas-recomendadas','equipo-material','formacion','historias-experiencias','consejos-principiantes')), tags text[] NOT NULL DEFAULT '{}', author_name text NOT NULL DEFAULT '', author_bio text NOT NULL DEFAULT '', meta_title text NOT NULL DEFAULT '', meta_description text NOT NULL DEFAULT '', created_by uuid DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT editorial_reserved_slugs CHECK (slug NOT IN ('guia-completa-primer-descenso-barrancos-malaga','5-vias-ferratas-mas-espectaculares-andalucia','tecnicas-rappel-basico-avanzado'))
);
GRANT SELECT, INSERT, UPDATE ON public.editorial_pieces TO authenticated;
GRANT ALL ON public.editorial_pieces TO service_role;
ALTER TABLE public.editorial_pieces ENABLE ROW LEVEL SECURITY;
CREATE POLICY editorial_admin_read ON public.editorial_pieces FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY editorial_admin_insert ON public.editorial_pieces FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY editorial_admin_update ON public.editorial_pieces FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.blog_publications (piece_id uuid PRIMARY KEY REFERENCES public.editorial_pieces(id), status text NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador','publicado','retirado')), published_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(), CHECK (status <> 'publicado' OR published_at IS NOT NULL));
GRANT SELECT ON public.blog_publications TO authenticated;
GRANT ALL ON public.blog_publications TO service_role;
ALTER TABLE public.blog_publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY publications_admin_read ON public.blog_publications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.guard_editorial_piece() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.slug <> OLD.slug AND EXISTS (SELECT 1 FROM public.blog_publications WHERE piece_id = OLD.id AND published_at IS NOT NULL) THEN RAISE EXCEPTION 'La dirección de un artículo publicado no puede cambiar.'; END IF;
 IF EXISTS (SELECT 1 FROM public.blog_publications WHERE piece_id = OLD.id AND status = 'publicado') AND (btrim(NEW.title) = '' OR btrim(NEW.excerpt) = '' OR btrim(NEW.content) = '' OR btrim(NEW.featured_image) = '' OR btrim(NEW.author_name) = '' OR btrim(NEW.meta_title) = '' OR btrim(NEW.meta_description) = '') THEN RAISE EXCEPTION 'Completa los campos antes de publicar.'; END IF;
 NEW.updated_at := now(); RETURN NEW;
END $$;
CREATE TRIGGER guard_editorial_update BEFORE UPDATE ON public.editorial_pieces FOR EACH ROW EXECUTE FUNCTION public.guard_editorial_piece();
CREATE FUNCTION public.save_editorial_piece(_piece jsonb, _status text, _expected_updated_at timestamptz DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _existing public.editorial_pieces%ROWTYPE;
BEGIN
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acceso no autorizado' USING ERRCODE = '42501'; END IF;
 IF _status NOT IN ('borrador','publicado','retirado') OR _status IS NULL THEN RAISE EXCEPTION 'Estado no válido'; END IF;
 _id := COALESCE(NULLIF(_piece->>'id','')::uuid, gen_random_uuid());
 SELECT * INTO _existing FROM public.editorial_pieces WHERE id = _id FOR UPDATE;
 IF FOUND AND (_expected_updated_at IS NULL OR _existing.updated_at <> _expected_updated_at) THEN RAISE EXCEPTION 'El artículo cambió en otra sesión. Vuelve a abrirlo antes de guardar.'; END IF;
 INSERT INTO public.editorial_pieces (id,title,slug,excerpt,content,featured_image,category,tags,author_name,author_bio,meta_title,meta_description)
 VALUES (_id, btrim(COALESCE(_piece->>'title','')), btrim(COALESCE(_piece->>'slug','')), btrim(COALESCE(_piece->>'excerpt','')), COALESCE(_piece->>'content',''), btrim(COALESCE(_piece->>'featured_image','')), COALESCE(_piece->>'category','tecnicas-seguridad'), ARRAY(SELECT jsonb_array_elements_text(COALESCE(_piece->'tags','[]'::jsonb))), btrim(COALESCE(_piece->>'author_name','')), COALESCE(_piece->>'author_bio',''), btrim(COALESCE(_piece->>'meta_title','')), btrim(COALESCE(_piece->>'meta_description','')))
 ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, slug=EXCLUDED.slug, excerpt=EXCLUDED.excerpt, content=EXCLUDED.content, featured_image=EXCLUDED.featured_image, category=EXCLUDED.category, tags=EXCLUDED.tags, author_name=EXCLUDED.author_name, author_bio=EXCLUDED.author_bio, meta_title=EXCLUDED.meta_title, meta_description=EXCLUDED.meta_description;
 SELECT * INTO _existing FROM public.editorial_pieces WHERE id = _id;
 IF _status = 'publicado' AND (btrim(_existing.title) = '' OR btrim(_existing.excerpt) = '' OR btrim(_existing.content) = '' OR btrim(_existing.featured_image) = '' OR btrim(_existing.author_name) = '' OR btrim(_existing.meta_title) = '' OR btrim(_existing.meta_description) = '') THEN RAISE EXCEPTION 'Completa título, extracto, contenido, imagen, autor y SEO antes de publicar.'; END IF;
 INSERT INTO public.blog_publications(piece_id,status,published_at) VALUES (_id,_status,CASE WHEN _status='publicado' THEN now() ELSE NULL END)
 ON CONFLICT(piece_id) DO UPDATE SET status=EXCLUDED.status, published_at=COALESCE(blog_publications.published_at,EXCLUDED.published_at), updated_at=now();
 RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.save_editorial_piece(jsonb,text,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_editorial_piece(jsonb,text,timestamptz) TO authenticated;
CREATE VIEW public.blog_posts_public WITH (security_barrier = true) AS SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image, p.category, p.tags, p.author_name, p.author_bio, p.meta_title, p.meta_description, b.published_at FROM public.editorial_pieces p JOIN public.blog_publications b ON b.piece_id = p.id WHERE b.status = 'publicado' AND b.published_at <= now();
REVOKE ALL ON public.blog_posts_public FROM PUBLIC;
GRANT SELECT ON public.blog_posts_public TO anon, authenticated, service_role;
COMMENT ON VIEW public.blog_posts_public IS 'Deliberate owner-executed allowlist: only published editorial content, never internal author IDs or drafts.';