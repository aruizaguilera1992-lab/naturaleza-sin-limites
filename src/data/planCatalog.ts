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
  aventurero_1_semana_mensual: {
    priceId: "aventurero_1_semana_mensual",
    name: "Aventurero Activo · 1 sesión/semana",
    detail: "4 sesiones al mes, comunidad privada y biblioteca online.",
    priceLabel: "119 €/mes",
    recurring: true,
  },
  aventurero_2_semana_mensual: {
    priceId: "aventurero_2_semana_mensual",
    name: "Aventurero Activo · 2 sesiones/semana",
    detail: "8 sesiones al mes, comunidad privada y biblioteca online.",
    priceLabel: "189 €/mes",
    recurring: true,
  },
  entrenador_personal_mensual: {
    priceId: "entrenador_personal_mensual",
    name: "Entrenador Personal · Plan completo",
    detail: "8 sesiones presenciales y 2 online al mes, plan y nutrición personalizados.",
    priceLabel: "329 €/mes",
    recurring: true,
  },
  entrenador_personal_prepago6: {
    priceId: "entrenador_personal_prepago6",
    name: "Entrenador Personal · 6 meses",
    detail: "Mismo plan completo con la tarifa reducida de permanencia de 6 meses.",
    priceLabel: "285 €/mes",
    recurring: true,
  },
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
