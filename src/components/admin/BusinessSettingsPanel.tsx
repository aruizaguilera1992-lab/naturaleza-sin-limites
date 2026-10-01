import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const FIELDS = [
  { key: "legal_name", label: "Titular o razón social", group: "Identificación" },
  { key: "trade_name", label: "Nombre comercial", group: "Identificación" },
  { key: "tax_id", label: "NIF / CIF", group: "Identificación" },
  { key: "address", label: "Domicilio fiscal", group: "Identificación" },
  { key: "tourism_registry", label: "Nº Registro de Turismo de Andalucía (AT/MA/…)", group: "Turismo Activo" },
  { key: "insurer", label: "Compañía aseguradora", group: "Turismo Activo" },
  { key: "rc_policy", label: "Nº póliza Responsabilidad Civil", group: "Turismo Activo" },
  { key: "accident_policy", label: "Nº póliza de Accidentes", group: "Turismo Activo" },
  { key: "contact_email", label: "Email de contacto", group: "Contacto" },
  { key: "contact_phone", label: "Teléfono de contacto", group: "Contacto" },
] as const;

type Key = (typeof FIELDS)[number]["key"];
type Values = Record<Key, string>;

const empty = Object.fromEntries(FIELDS.map((f) => [f.key, ""])) as Values;

export function BusinessSettingsPanel() {
  const { toast } = useToast();
  const [values, setValues] = useState<Values>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("business_settings")
      .select("*")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const next = { ...empty };
          FIELDS.forEach((f) => (next[f.key] = (data[f.key] as string | null) ?? ""));
          setValues(next);
        }
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = Object.fromEntries(
      FIELDS.map((f) => [f.key, values[f.key].trim() || null]),
    ) as Record<Key, string | null>;
    const { error } = await supabase.from("business_settings").upsert({ id: true, ...payload });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Datos guardados" });
    }
  };

  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));
  const missing = FIELDS.filter(
    (f) => f.group !== "Contacto" && !values[f.key].trim(),
  ).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Datos obligatorios para operar como empresa de Turismo Activo en Andalucía. Se mostrarán en el
        Aviso Legal y las condiciones.{" "}
        {missing > 0 ? (
          <span className="text-destructive">Faltan {missing} datos obligatorios.</span>
        ) : (
          <span className="text-primary">Datos obligatorios completos.</span>
        )}
      </p>
      {groups.map((g) => (
        <section key={g} className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading font-semibold mb-4">{g}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.filter((f) => f.group === g).map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
      <Button onClick={save} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar
      </Button>
    </div>
  );
}
