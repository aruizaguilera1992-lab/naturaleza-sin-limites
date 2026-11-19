import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Devuelve la URL firmada de la foto propia de una actividad del catálogo
 * (subida desde el panel; el almacén es privado y la sirve la función outing-photo).
 * Si la actividad no tiene foto propia (`imagePath` vacío), devuelve null.
 */
export function useOutingPhoto(category: string, slug: string, imagePath?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    setUrl(null);
    if (!imagePath) return;
    let alive = true;
    supabase.functions
      .invoke("outing-photo", { body: { category, slug } })
      .then(({ data }) => {
        if (alive && typeof data?.url === "string") setUrl(data.url);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [imagePath, category, slug]);
  return url;
}
