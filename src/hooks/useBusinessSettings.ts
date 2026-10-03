import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Datos legales de negocio usados en las superficies de confianza (TrustBar,
 * SafetyAssuranceSection). Se leen de business_settings para que se actualicen
 * desde el panel; los fallback reflejan los valores verificados documentalmente.
 * NO incluir aquí datos no verificados (nº de póliza de accidentes, coberturas).
 */

const FALLBACK_INSURER = 'W. R. Berkley Europe AG, Sucursal en España';
const FALLBACK_RC_POLICY = '1500175606';
const FALLBACK_TOURISM_REGISTRY = 'AT/MA/00508';

export interface BusinessSettings {
  insurer: string | null;
  rcPolicy: string | null;
  tourismRegistry: string | null;
}

export function useBusinessSettings(): BusinessSettings {
  const [settings, setSettings] = useState<BusinessSettings>({
    insurer: null,
    rcPolicy: null,
    tourismRegistry: null,
  });

  useEffect(() => {
    let active = true;
    supabase
      .from('business_settings')
      .select('insurer, rc_policy, tourism_registry')
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setSettings({
            insurer: data?.insurer?.trim() || null,
            rcPolicy: data?.rc_policy?.trim() || null,
            tourismRegistry: data?.tourism_registry?.trim() || null,
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

export { FALLBACK_INSURER, FALLBACK_RC_POLICY, FALLBACK_TOURISM_REGISTRY };
