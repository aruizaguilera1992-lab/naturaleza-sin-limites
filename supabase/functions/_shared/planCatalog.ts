// Server-side source of truth for what can be bought directly from the web.
// The client only sends a price id; amounts always come from Stripe.

export type PlanKind = "suscripcion" | "paquete";

export interface PlanCatalogEntry {
  priceId: string;
  name: string;
  detail: string;
  kind: PlanKind;
  /** Extra copy added to the confirmation email. */
  onboarding: string;
}

const TRAINING_ONBOARDING =
  "En las próximas 24 horas laborables recibirás un segundo correo con tu invitación personal para darte de alta en la plataforma de entrenamiento, donde encontrarás tu plan, la biblioteca de cursos y la comunidad privada.";

const OUTDOOR_ONBOARDING =
  "En las próximas 24 horas laborables te escribiremos para reservar las fechas de tus salidas y enviarte el punto de encuentro y el material recomendado.";

export const PLAN_CATALOG: Record<string, PlanCatalogEntry> = {
  aventurero_1_semana_mensual: {
    priceId: "aventurero_1_semana_mensual",
    name: "Aventurero Activo · 1 sesión/semana",
    detail: "4 sesiones al mes, comunidad privada y biblioteca online.",
    kind: "suscripcion",
    onboarding: TRAINING_ONBOARDING,
  },
  aventurero_2_semana_mensual: {
    priceId: "aventurero_2_semana_mensual",
    name: "Aventurero Activo · 2 sesiones/semana",
    detail: "8 sesiones al mes, comunidad privada y biblioteca online.",
    kind: "suscripcion",
    onboarding: TRAINING_ONBOARDING,
  },
  entrenador_personal_mensual: {
    priceId: "entrenador_personal_mensual",
    name: "Entrenador Personal · Plan completo",
    detail: "8 sesiones presenciales y 2 online al mes, plan y nutrición personalizados.",
    kind: "suscripcion",
    onboarding: TRAINING_ONBOARDING,
  },
  entrenador_personal_prepago6: {
    priceId: "entrenador_personal_prepago6",
    name: "Entrenador Personal · 6 meses",
    detail: "Mismo plan completo con la tarifa reducida de permanencia de 6 meses.",
    kind: "suscripcion",
    onboarding: TRAINING_ONBOARDING,
  },
  outdoor_pack_4_actividades: {
    priceId: "outdoor_pack_4_actividades",
    name: "Outdoor Experiencial · Paquete 4 actividades",
    detail: "4 salidas guiadas con material técnico incluido, sin suscripción.",
    kind: "paquete",
    onboarding: OUTDOOR_ONBOARDING,
  },
  outdoor_pack_8_actividades: {
    priceId: "outdoor_pack_8_actividades",
    name: "Outdoor Experiencial · Paquete 8 actividades",
    detail: "8 salidas guiadas con material técnico incluido, sin suscripción.",
    kind: "paquete",
    onboarding: OUTDOOR_ONBOARDING,
  },
};

export const isPlanPrice = (priceId: string) =>
  Object.prototype.hasOwnProperty.call(PLAN_CATALOG, priceId);
