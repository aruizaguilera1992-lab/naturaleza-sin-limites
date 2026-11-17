import { describe, expect, it } from "vitest";
import type { ActivityProfile } from "@/data/activityProfiles";
import { levelFromLabel, mergeOutingSheet, type CatalogOverride } from "./catalogSync";

/** Ficha mínima con los valores reales de la salida de espeleología publicada. */
const profile = (over: Partial<ActivityProfile> = {}): ActivityProfile =>
  ({
    name: "Espeleología de iniciación",
    shortDescription: "Primera toma de contacto con el mundo subterráneo.",
    commercialDescription: "Recorrido guiado por galerías.",
    zone: "Archidona, Málaga",
    priceValue: 55,
    totalDuration: "4 horas",
    effectiveDuration: "2 horas",
    technicalLevel: "Iniciación",
    experienceLevel: "Sin experiencia",
    physicalLevel: "Básica",
    minimumAge: "12 años",
    season: "Todo el año",
    group: "Máx. 6 personas",
    guideRatio: "1 guía / 6",
    approachReturn: "10 minutos a pie",
    included: ["Guía titulado", "Casco con iluminación frontal"],
    bring: ["Ropa de montaña"],
    safetyRequirements: ["Edad mínima: 12 años"],
    insurancePermits: ["Seguro de RC"],
    technicalElements: ["Progresión a pie"],
    itinerary: ["Briefing", "Travesía"],
    highlights: ["Cueva seca"],
    weatherPolicy: "Se propone otra fecha si no es segura.",
    cancellationPolicy: "Se avisa por escrito.",
    ...over,
  }) as ActivityProfile;

const event = {
  title: "Espeleología de iniciación: Travesía Cueva de la Higuera, Archidona.",
  zone: "Archidona, Málaga",
  meeting_point_public: "Archidona, Málaga",
  price_cents: 5500,
};

describe("mergeOutingSheet", () => {
  it("sin ficha del catálogo muestra los datos de la salida", () => {
    const sheet = mergeOutingSheet(event, profile(), null);
    expect(sheet.title).toBe("Espeleología de iniciación: Travesía Cueva de la Higuera, Archidona.");
    expect(sheet.price).toBe(55);
    expect(sheet.duration).toBe("4 horas");
    expect(sheet.includes).toEqual(["Guía titulado", "Casco con iluminación frontal"]);
    expect(sheet.fromCatalog).toBe(false);
  });

  it("el catálogo del panel gana al nombre, la duración y el precio de la ficha original", () => {
    const override: CatalogOverride = {
      key: "espeleologia:iniciacion",
      name: "Cueva de la Higuera (tramo turístico)",
      duration: "3 h 30 min",
      pricePerPersonEuros: 55,
      summary: "Resumen revisado desde el panel.",
      includes: ["Guía", "Casco", "Frontal"],
    };
    const sheet = mergeOutingSheet(event, profile(), override);
    expect(sheet.title).toBe("Cueva de la Higuera (tramo turístico)");
    expect(sheet.duration).toBe("3 h 30 min");
    expect(sheet.summary).toBe("Resumen revisado desde el panel.");
    expect(sheet.includes).toEqual(["Guía", "Casco", "Frontal"]);
    expect(sheet.fromCatalog).toBe(true);
  });

  it("el precio de la salida (30 % de señal ya calculado) manda sobre el del catálogo", () => {
    const sheet = mergeOutingSheet(event, profile(), {
      key: "espeleologia:iniciacion",
      pricePerPersonEuros: 70,
    });
    expect(sheet.price).toBe(55);
  });

  it("si la salida no fijó importe, se usa el precio del catálogo", () => {
    const sheet = mergeOutingSheet(
      { ...event, price_cents: null },
      profile({ priceValue: undefined }),
      { key: "barranquismo:guadalmina", pricePerPersonEuros: 45 },
    );
    expect(sheet.price).toBe(45);
  });

  it("el punto de encuentro de la salida gana a la zona del catálogo", () => {
    const sheet = mergeOutingSheet(event, profile(), { key: "x", zone: "Otros Montes" });
    expect(sheet.meetingPoint).toBe("Archidona, Málaga");
  });

  it("sin punto de encuentro propio se usa la zona editada en el catálogo", () => {
    const sheet = mergeOutingSheet(
      { ...event, meeting_point_public: null, zone: "Archidona, Málaga" },
      profile(),
      { key: "x", zone: "Nerja, Málaga" },
    );
    expect(sheet.meetingPoint).toBe("Nerja, Málaga");
  });

  it("la edad mínima numérica del catálogo se muestra como +10", () => {
    const sheet = mergeOutingSheet(event, profile(), { key: "x", minAge: 10 });
    expect(sheet.minAge).toBe("+10");
  });

  it("la experiencia del catálogo se escribe en una frase clara", () => {
    expect(mergeOutingSheet(event, profile(), { key: "x", experience: false }).experience).toBe(
      "No requiere experiencia previa",
    );
    expect(mergeOutingSheet(event, profile(), { key: "x", experience: true }).experience).toBe(
      "Requiere experiencia previa",
    );
  });

  it("los requisitos del catálogo sustituyen a los de la ficha original", () => {
    const sheet = mergeOutingSheet(event, profile(), {
      key: "x",
      requirements: ["No tener miedo a espacios cerrados"],
    });
    expect(sheet.requirements).toEqual(["No tener miedo a espacios cerrados"]);
  });

  it("el nivel 1-3 sale de la etiqueta del catálogo", () => {
    const sheet = mergeOutingSheet(event, profile(), { key: "x", levelLabel: "Intermedio" });
    expect(sheet.level).toBe(2);
    expect(sheet.levelLabel).toBe("Intermedio");
  });
});

describe("levelFromLabel", () => {
  it("reconoce niveles escritos a mano y la escala K", () => {
    expect(levelFromLabel("Iniciación")).toBe(1);
    expect(levelFromLabel("Intermedio (orientativo)")).toBe(2);
    expect(levelFromLabel("Avanzado")).toBe(3);
    expect(levelFromLabel("Integral")).toBe(3);
    expect(levelFromLabel("K2")).toBe(1);
    expect(levelFromLabel("K4 A2 II")).toBe(2);
    expect(levelFromLabel("V4 A2 II")).toBeNull();
    expect(levelFromLabel("")).toBeNull();
  });
});

describe("faqs de la ficha", () => {
  it("lleva las preguntas frecuentes a la diapositiva de dudas", () => {
    const sheet = mergeOutingSheet(
      event,
      profile({
        faqs: [{ question: "¿Necesito experiencia previa?", answer: "No para iniciación." }],
      }),
      {},
    );
    expect(sheet.faqs).toEqual([
      { question: "¿Necesito experiencia previa?", answer: "No para iniciación." },
    ]);
  });

  it("sin preguntas en el perfil, la diapositiva de dudas queda vacía", () => {
    expect(mergeOutingSheet(event, profile(), {}).faqs).toEqual([]);
  });
});
