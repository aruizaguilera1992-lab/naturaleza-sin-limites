import { describe, expect, it } from "vitest";
import { activityProfiles } from "@/data/activityProfiles";
import { buildProposal, detectCategories, difficultyTier, NO_PRICE, suggestActivities } from "./crmSuggestions";

describe("crmSuggestions", () => {
  it("detecta disciplinas desde el interés", () => {
    expect(detectCategories(["Barranquismo"], "vía ferrata")).toEqual(["barranquismo", "vias-ferratas"]);
  });

  it("solo sugiere actividades reales del catálogo y de la disciplina pedida", () => {
    const res = suggestActivities(activityProfiles, { categories: ["vias-ferratas"], experience: "ninguna" });
    expect(res.length).toBeGreaterThan(0);
    res.forEach((p) => {
      expect(activityProfiles).toContain(p);
      expect(p.category).toBe("vias-ferratas");
      expect(difficultyTier(p)).toBe(1);
    });
  });

  it("sin experiencia no propone barrancos V3 o superiores", () => {
    const res = suggestActivities(activityProfiles, { categories: ["barranquismo"], experience: "ninguna", limit: 50 });
    res.forEach((p) => expect(p.technicalLevel).toMatch(/^V[12]/));
  });

  it("sin precio muestra Precio a consultar", () => {
    const cave = activityProfiles.filter((p) => p.category === "espeleologia" && !p.priceValue);
    expect(buildProposal("Ana", cave)).toContain(NO_PRICE);
  });
});
