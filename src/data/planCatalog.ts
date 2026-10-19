// Client-side mirror of the purchasable catalogue. Amounts shown here are
// informative: the charge always comes from the server-side price.

export interface PlanCatalogItem {
  priceId: string;
  name: string;
  detail: string;
  priceLabel: string;
  recurring: boolean;
}

export const PLAN_CATALOG: Record<string, PlanCatalogItem> = {
  outdoor_pack_4_actividades: {
    priceId: "outdoor_pack_4_actividades",
    name: "Outdoor Experiencial · Paquete 4 actividades",
    detail: "4 salidas guiadas con material técnico incluido, sin suscripción.",
    priceLabel: "215 € (pago único)",
    recurring: false,
  },
  outdoor_pack_8_actividades: {
    priceId: "outdoor_pack_8_actividades",
    name: "Outdoor Experiencial · Paquete 8 actividades",
    detail: "8 salidas guiadas con material técnico incluido, sin suscripción.",
    priceLabel: "380 € (pago único)",
    recurring: false,
  },
};

export const getPlanItem = (priceId?: string) =>
  priceId ? PLAN_CATALOG[priceId] : undefined;
