import type { ActivityProfile, PublicActivityCategory } from "@/data/activityProfiles";

export const SITE_URL = "https://naturalezasinlimites.es";
export const NO_PRICE = "Precio a consultar";

const KEYWORDS: Record<PublicActivityCategory, string[]> = {
  barranquismo: ["barranc", "canyon"],
  escalada: ["escalad", "climb", "roca"],
  "vias-ferratas": ["ferrat"],
  espeleologia: ["espeleo", "cueva", "cavidad"],
};

/** Disciplinas detectadas en las actividades de interés y el texto de interés del contacto. */
export function detectCategories(interests: string[] | null | undefined, interes?: string | null): PublicActivityCategory[] {
  const text = [...(interests ?? []), interes ?? ""].join(" ").toLowerCase();
  return (Object.keys(KEYWORDS) as PublicActivityCategory[]).filter((c) => KEYWORDS[c].some((k) => text.includes(k)));
}

/** Dificultad 1 (más fácil) a 4 a partir del nivel técnico real del catálogo. */
export function difficultyTier(p: Pick<ActivityProfile, "category" | "technicalLevel">): number {
  const t = p.technicalLevel;
  if (p.category === "barranquismo") {
    const v = Number(t.match(/V(\d)/)?.[1] ?? 3);
    return v <= 2 ? 1 : v === 3 ? 2 : v === 4 ? 3 : 4;
  }
  if (p.category === "vias-ferratas") {
    const k = Number(t.match(/K(\d)/)?.[1] ?? 3);
    return k <= 2 ? 1 : k === 3 ? 2 : k === 4 ? 3 : 4;
  }
  if (p.category === "escalada") {
    const g = t.match(/(\d)([abc])/);
    if (!g) return 2;
    const n = Number(g[1]) * 3 + "abc".indexOf(g[2]);
    return n <= 16 ? 1 : n <= 18 ? 2 : 3; // 5a/5b → 1, 5c/6a → 2, 6b+ → 3
  }
  const l = t.toLowerCase();
  return l.includes("inicia") ? 1 : l.includes("progres") ? 2 : 3;
}

const MAX_TIER: Record<string, number> = { ninguna: 1, iniciacion: 1, intermedio: 2, avanzado: 4 };

export function suggestActivities(
  catalog: ActivityProfile[],
  opts: { categories: PublicActivityCategory[]; experience?: string | null; limit?: number },
): ActivityProfile[] {
  const max = MAX_TIER[opts.experience ?? ""] ?? 2;
  return catalog
    .filter((p) => opts.categories.includes(p.category) && difficultyTier(p) <= max)
    .sort((a, b) => difficultyTier(b) - difficultyTier(a) || Number(Boolean(b.priceValue)) - Number(Boolean(a.priceValue)))
    .slice(0, opts.limit ?? 4);
}

export const activityUrl = (p: Pick<ActivityProfile, "category" | "slug">) => `${SITE_URL}/actividades/${p.category}/${p.slug}`;
export const priceLabel = (p: Pick<ActivityProfile, "price" | "priceValue">) =>
  p.priceValue && p.priceValue > 0 ? p.price : NO_PRICE;

export function buildProposal(firstName: string, items: ActivityProfile[]): string {
  const lines = items.map((p) => `• ${p.name} (${p.categoryLabel}, ${p.zone}) — ${priceLabel(p)}\n  ${activityUrl(p)}`);
  return [
    `Hola ${firstName}, según lo que nos contaste te proponemos estas actividades:`,
    "",
    ...lines,
    "",
    "Dinos cuál te encaja y qué fecha prefieres, y revisamos la disponibilidad. ¡Un saludo!",
  ].join("\n");
}
