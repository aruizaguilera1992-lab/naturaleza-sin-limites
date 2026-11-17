import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractUrl, isShortMapLink, type MapsTarget } from '@/lib/meetingPoint';

const memory = new Map<string, MapsTarget | null>();
const STORE_KEY = 'nsl-meeting-point-targets';

const readStore = (): Record<string, MapsTarget | null> => {
  try { return JSON.parse(window.localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, MapsTarget | null>; } catch { return {}; }
};
const writeStore = (url: string, target: MapsTarget | null) => {
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), [url]: target })); } catch { /* sin almacenamiento */ }
};

/**
 * Si el texto trae un enlace corto de Google Maps, devuelve el sitio exacto al
 * que apunta (nombre y coordenadas) para poder abrirlo también en Apple Maps.
 */
export function useMeetingPointTarget(text: string): MapsTarget | null {
  const url = extractUrl(text);
  const resolvable = isShortMapLink(url);
  const key = resolvable && url ? url : null;
  const [target, setTarget] = useState<MapsTarget | null>(() => (key ? memory.get(key) ?? null : null));

  useEffect(() => {
    if (!key) { setTarget(null); return; }
    if (memory.has(key)) { setTarget(memory.get(key) ?? null); return; }
    const stored = readStore();
    if (key in stored) { memory.set(key, stored[key] ?? null); setTarget(stored[key] ?? null); return; }
    let alive = true;
    supabase.functions
      .invoke('meeting-point-links', { body: { url: key } })
      .then(({ data }) => {
        const t = ((data as { target?: MapsTarget | null } | null)?.target ?? null) as MapsTarget | null;
        memory.set(key, t);
        writeStore(key, t);
        if (alive) setTarget(t);
      })
      .catch(() => { memory.set(key, null); if (alive) setTarget(null); });
    return () => { alive = false; };
  }, [key]);

  return target;
}
