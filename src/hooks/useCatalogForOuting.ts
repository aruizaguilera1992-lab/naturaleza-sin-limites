import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CatalogOverride } from "@/lib/catalogSync";

const cache = new Map<string, CatalogOverride | null>();

/**
 * Lee la ficha del catálogo que corresponde a una salida (`categoria|slug`).
 * La función del backend devuelve solo los campos comerciales; se guarda en memoria
 * para no repetir la consulta al abrir y cerrar la ficha.
 */
export function useCatalogForOuting(category?: string, slug?: string) {
  const key = category && slug ? `${category}|${slug}` : "";
  const [override, setOverride] = useState<CatalogOverride | null>(
    key ? cache.get(key) ?? null : null,
  );
  const [loading, setLoading] = useState(Boolean(key) && !cache.has(key));

  useEffect(() => {
    if (!key || !category || !slug) {
      setOverride(null);
      setLoading(false);
      return;
    }
    if (cache.has(key)) {
      setOverride(cache.get(key) ?? null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const load = async () => {
      try {
        const { data } = await supabase.rpc("get_catalog_for_outing", {
          p_category: category,
          p_slug: slug,
        });
        const value = (data ?? null) as CatalogOverride | null;
        cache.set(key, value);
        if (alive) {
          setOverride(value);
          setLoading(false);
        }
      } catch {
        cache.set(key, null);
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [key, category, slug]);

  return { override, loading };
}
