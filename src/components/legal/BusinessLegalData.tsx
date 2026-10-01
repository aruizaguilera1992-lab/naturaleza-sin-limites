import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  legal_name: string | null;
  trade_name: string | null;
  tax_id: string | null;
  address: string | null;
  tourism_registry: string | null;
  insurer: string | null;
  rc_policy: string | null;
  accident_policy: string | null;
};

/** Official business data entered in the admin panel (Ajustes legales). Renders only filled fields. */
export function BusinessLegalData({ includeTourism = true }: { includeTourism?: boolean }) {
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    supabase
      .from("business_settings")
      .select("legal_name, trade_name, tax_id, address, tourism_registry, insurer, rc_policy, accident_policy")
      .maybeSingle()
      .then(({ data }) => setRow(data));
  }, []);

  if (!row) return null;
  const items: [string, string | null][] = [
    ["Titular", row.legal_name],
    ["Nombre comercial", row.trade_name],
    ["NIF/CIF", row.tax_id],
    ["Domicilio", row.address],
    ...(includeTourism
      ? ([
          ["Registro de Turismo de Andalucía", row.tourism_registry],
          ["Aseguradora", row.insurer],
          ["Póliza de Responsabilidad Civil", row.rc_policy],
          ["Póliza de Accidentes", row.accident_policy],
        ] as [string, string | null][])
      : []),
  ];
  const filled = items.filter(([, v]) => v && v.trim());
  if (filled.length === 0) return null;

  return (
    <ul className="space-y-2 list-disc pl-5 mb-4">
      {filled.map(([label, value]) => (
        <li key={label}>
          <strong className="text-foreground">{label}:</strong> {value}
        </li>
      ))}
    </ul>
  );
}
