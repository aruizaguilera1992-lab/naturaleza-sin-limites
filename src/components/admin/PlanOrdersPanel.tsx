import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { getStripeEnvironment } from "@/lib/stripe";

type PlanOrder = {
  id: string;
  product_name: string;
  mode: string;
  status: string;
  amount_cents: number | null;
  currency: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  last_invoice_status: string | null;
  last_invoice_at: string | null;
  created_at: string;
};

const LABELS: Record<string, string> = {
  pendiente: "Pago sin completar",
  pagado: "Pagado",
  activo: "Activo",
  pago_fallido: "Cobro fallido",
  impagado: "Impagado",
  cancelado: "Cancelado",
  caducado: "Caducado",
  pausado: "Pausado",
};

const ACTION: Record<string, string> = {
  activo: "Dar acceso / mantener acceso",
  pagado: "Dar acceso / reservar salidas",
  pago_fallido: "Avisar al cliente: se reintenta el cobro",
  impagado: "Retirar acceso",
  cancelado: "Retirar acceso",
};

const variant = (s: string) =>
  s === "activo" || s === "pagado" ? "default" : ["pago_fallido", "impagado", "cancelado"].includes(s) ? "destructive" : "outline";

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "-";

export function PlanOrdersPanel() {
  const [rows, setRows] = useState<PlanOrder[] | null>(null);

  useEffect(() => {
    supabase
      .from("plan_orders")
      .select("*")
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as PlanOrder[]));
  }, []);

  if (!rows) return <p className="text-muted-foreground">Cargando…</p>;
  if (rows.length === 0) return <p className="text-muted-foreground">Todavía no hay planes contratados.</p>;

  return (
    <>
      {rows.map((o) => {
        const action = o.cancel_at_period_end && o.status === "activo"
          ? `Se cancela el ${fmt(o.current_period_end)}: retirar acceso ese día`
          : ACTION[o.status];
        return (
          <div key={o.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="font-heading font-semibold text-lg">{o.product_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {fmt(o.created_at)} · {o.customer_name ?? "-"} · {o.customer_email ?? "-"} · {o.customer_phone ?? "-"}
                </p>
              </div>
              <Badge variant={variant(o.status)}>{LABELS[o.status] ?? o.status}</Badge>
            </div>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
              <span>Tipo: {o.mode === "suscripcion" ? "Suscripción mensual" : "Paquete"}</span>
              <span>Próxima renovación: {o.mode === "suscripcion" ? fmt(o.current_period_end) : "-"}</span>
              <span>
                Último cobro: {o.last_invoice_status ? `${o.last_invoice_status} (${fmt(o.last_invoice_at)})` : "-"}
              </span>
            </div>
            {action && <p className="mt-3 text-sm font-medium text-foreground">Qué hacer: {action}</p>}
          </div>
        );
      })}
    </>
  );
}
