import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Datos legales de negocio usados en las superficies de confianza (TrustBar,
 * SafetyAssuranceSection). Se leen de business_settings para que se actualicen
 * desde el panel; los fallback reflejan los valores verificados documentalmente
 * (póliza de RC 1500175606 y póliza de accidentes 1300013109, ambas Berkley).
 * NO mostrar capitales, edades, altitud ni condiciones particulares: solo el
 * nº de póliza, la compañía y el periodo de vigencia común.
 */

const FALLBACK_INSURER = 'W. R. Berkley Europe AG, Sucursal en España';
const FALLBACK_RC_POLICY = '1500175606';
const FALLBACK_ACCIDENT_POLICY = '1300013109';
const FALLBACK_TOURISM_REGISTRY = 'AT/MA/00508';

/** Vigencia común a ambas pólizas (real, documentada). */
export const POLICY_VALIDITY_PERIOD = '18/09/2026–17/09/2027';

export interface BusinessSettings {
  insurer: string | null;
  rcPolicy: string | null;
  accidentPolicy: string | null;
  tourismRegistry: string | null;
}

export function useBusinessSettings(): BusinessSettings {
  const [settings, setSettings] = useState<BusinessSettings>({
    insurer: null,
    rcPolicy: null,
    accidentPolicy: null,
    tourismRegistry: null,
  });

  useEffect(() => {
    let active = true;
    supabase
      .from('business_settings')
      .select('insurer, rc_policy, accident_policy, tourism_registry')
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setSettings({
            insurer: data?.insurer?.trim() || null,
            rcPolicy: data?.rc_policy?.trim() || null,
            accidentPolicy: data?.accident_policy?.trim() || null,
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

export {
  FALLBACK_INSURER,
  FALLBACK_RC_POLICY,
  FALLBACK_ACCIDENT_POLICY,
  FALLBACK_TOURISM_REGISTRY,
};
