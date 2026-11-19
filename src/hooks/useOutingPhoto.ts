import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Estado de la foto propia de una actividad del catálogo: `url` con la URL
 * firmada cuando existe y `settled` cuando la consulta ha terminado, con o sin
 * foto. `settled` permite mostrar el respaldo local sin que se vea primero una
 * imagen y después otra.
 */
export function useOutingPhotoState(category: string, slug: string, imagePath?: string | null) {
  const [state, setState] = useState<{ url: string | null; settled: boolean }>({
    url: null,
    settled: !imagePath,
  });
  useEffect(() => {
    if (!imagePath) {
      setState({ url: null, settled: true });
      return;
    }
    let alive = true;
    setState({ url: null, settled: false });
    supabase.functions
      .invoke("outing-photo", { body: { category, slug } })
      .then(({ data }) => {
        if (alive) {
          setState({ url: typeof data?.url === "string" ? data.url : null, settled: true });
        }
      })
      .catch(() => {
        if (alive) setState({ url: null, settled: true });
      });
    return () => {
      alive = false;
    };
  }, [imagePath, category, slug]);
  return state;
}

/**
 * Devuelve la URL firmada de la foto propia de una actividad del catálogo
 * (subida desde el panel; el almacén es privado y la sirve la función outing-photo).
 * Si la actividad no tiene foto propia (`imagePath` vacío), devuelve null.
 */
export function useOutingPhoto(category: string, slug: string, imagePath?: string | null) {
  return useOutingPhotoState(category, slug, imagePath).url;
}
