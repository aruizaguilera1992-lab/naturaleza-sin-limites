CREATE OR REPLACE FUNCTION public.get_catalog_for_outing(p_category text, p_slug text)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select jsonb_strip_nulls(jsonb_build_object(
    'key', e.key,
    'name', nullif(e.data ->> 'name', ''),
    'zone', nullif(e.data ->> 'zone', ''),
    'province', nullif(e.data ->> 'province', ''),
    'levelLabel', nullif(e.data ->> 'levelLabel', ''),
    'level', case when jsonb_typeof(e.data -> 'level') = 'number' then e.data -> 'level' else null end,
    'grade', nullif(e.data ->> 'grade', ''),
    'duration', nullif(e.data ->> 'duration', ''),
    'pricePerPersonEuros', case when jsonb_typeof(e.data -> 'pricePerPersonEuros') = 'number' then e.data -> 'pricePerPersonEuros' else null end,
    'summary', nullif(e.data ->> 'summary', ''),
    'description', nullif(e.data ->> 'description', ''),
    'includes', case when jsonb_typeof(e.data -> 'includes') = 'array' then e.data -> 'includes' else null end,
    'requirements', case when jsonb_typeof(e.data -> 'requirements') = 'array' then e.data -> 'requirements' else null end,
    'highlights', case when jsonb_typeof(e.data -> 'highlights') = 'array' and jsonb_array_length(e.data -> 'highlights') > 0 then e.data -> 'highlights' else null end,
    'minAge', case when jsonb_typeof(e.data -> 'minAge') = 'number' then e.data -> 'minAge' else null end,
    'fitness', nullif(e.data ->> 'fitness', ''),
    'experience', case when jsonb_typeof(e.data -> 'experience') in ('true', 'false') then e.data -> 'experience' else null end,
    'videoUrl', nullif(e.data ->> 'videoUrl', ''),
    'imagePath', nullif(e.photos[1], '')
  ))
  from public.catalog_entries e
  where e.key = case
      when p_category = 'vias-ferratas' then 'ferratas:' || p_slug
      when p_category in ('barranquismo', 'espeleologia') then p_category || ':' || p_slug
      else null
    end
    and e.key not like '%:ref-%'
    and e.key not like '%:original-%';
$function$;