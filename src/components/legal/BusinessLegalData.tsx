import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  trade_name: string | null;
  tourism_registry: string | null;
  insurer: string | null;
};

/** Official business data entered in the admin panel (Ajustes legales). Renders only filled fields. */
export function BusinessLegalData({ includeTourism = true }: { includeTourism?: boolean }) {
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    supabase
      .from("business_settings")
      .select("trade_name, tourism_registry, insurer")
      .maybeSingle()
      .then(({ data }) => setRow(data));
  }, []);

  if (!row) return null;
  const items: [string, string | null][] = [
    ["Nombre comercial", row.trade_name],

    ...(includeTourism
      ? ([
          ["Registro de Turismo de Andalucía", row.tourism_registry],
          ["Aseguradora", row.insurer],
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
