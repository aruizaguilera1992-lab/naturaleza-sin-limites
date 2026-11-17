import { describe, expect, it } from "vitest";
import { activityProfiles, type ActivityProfile } from "./activityProfiles";

/** Preguntas que la ficha técnica debe poder responder siempre. */
const KEY_QUESTIONS = [
  "¿Cuánto dura la actividad?",
  "¿Qué nivel tiene la actividad?",
  "¿Necesito experiencia previa?",
  "¿Qué edad mínima se exige?",
  "¿Cuánto cuesta y cómo se paga?",
  "¿Cuántas personas forman el grupo?",
  "¿En qué época se puede hacer?",
  "¿Cómo se reserva?",
  "¿Qué material está incluido?",
  "¿Qué tengo que llevar?",
  "¿Qué ocurre si cambia el tiempo?",
  "¿Puedo reservar una salida privada?",
];

/** Prefijos que la página pública filtra en su desplegable de dudas. */
const PUBLIC_PREFIXES = [
  "¿Dónde se realiza",
  "¿Cuánto dura",
  "¿Necesito experiencia",
  "¿Qué edad mínima",
  "¿Cómo se reserva",
  "¿Qué ocurre si cambia el tiempo",
];

const find = (category: ActivityProfile["category"], name: string) => {
  const profile = activityProfiles.find((p) => p.category === category && p.name === name);
  if (!profile) throw new Error(`ficha no encontrada: ${category} / ${name}`);
  return profile;
};

const answer = (profile: ActivityProfile, question: string) => {
  const faq = profile.faqs.find((f) => f.question === question);
  if (!faq) throw new Error(`pregunta no encontrada: ${question}`);
  return faq.answer;
};

describe("preguntas frecuentes de la ficha", () => {
  it("cubre los datos de decisión de todas las actividades", () => {
    for (const profile of activityProfiles) {
      const questions = profile.faqs.map((f) => f.question);
      for (const q of KEY_QUESTIONS) expect(questions, `${profile.name} · ${q}`).toContain(q);
    }
  });

  it("mantiene los prefijos que muestra la página pública", () => {
    for (const prefix of PUBLIC_PREFIXES) {
      expect(
        activityProfiles.some((profile) =>
          profile.faqs.some((f) => f.question.startsWith(prefix)),
        ),
        prefix,
      ).toBe(true);
    }
  });

  it("no deja espacios sueltos antes de la puntuación", () => {
    for (const profile of activityProfiles) {
      for (const faq of profile.faqs) {
        expect(faq.answer).not.toMatch(/\s[.;,]/);
        expect(faq.question).not.toMatch(/\s[.;,]/);
      }
    }
  });

  it("dice el precio de la ficha y la señal del 30 %", () => {
    const iniciacion = find("espeleologia", "Espeleología de iniciación");
    const text = answer(iniciacion, "¿Cuánto cuesta y cómo se paga?");
    expect(text).toContain("Desde 55 €");
    expect(text).toContain("30 %");
    expect(text).toContain("Bizum");
  });

  it("repite el dato de duración de la ficha sin inventarlo", () => {
    const iniciacion = find("espeleologia", "Espeleología de iniciación");
    const text = answer(iniciacion, "¿Cuánto dura la actividad?");
    expect(text).toContain("Duración total: Consultar disponibilidad");
    expect(text).not.toMatch(/\d+\s*(h\b|horas)/);
  });

  it("refleja la duración real cuando la ficha la tiene", () => {
    const conDuracion = activityProfiles.find(
      (p) => p.category === "barranquismo" && !/consultar/i.test(p.totalDuration),
    );
    expect(conDuracion, "hace falta al menos un barranco con duración").toBeTruthy();
    expect(answer(conDuracion!, "¿Cuánto dura la actividad?")).toContain(conDuracion!.totalDuration);
  });

  it("separa nivel comercial y grado técnico", () => {
    const barranco = activityProfiles.find(
      (p) => p.category === "barranquismo" && p.experienceLevel && p.technicalLevel,
    );
    expect(barranco, "hace falta al menos un barranco con nivel comercial").toBeTruthy();
    const text = answer(barranco!, "¿Qué nivel tiene la actividad?");
    expect(text).toContain(`Nivel: ${barranco!.experienceLevel}`);
    expect(text).toContain(`Grado técnico: ${barranco!.technicalLevel}`);
    expect(text).toContain("Condición física:");
  });

  it("refleja grupo, ratio y temporada de la ficha", () => {
    const iniciacion = find("espeleologia", "Espeleología de iniciación");
    expect(answer(iniciacion, "¿Cuántas personas forman el grupo?")).toContain("Mínimo 2");
    expect(answer(iniciacion, "¿Cuántas personas forman el grupo?")).toContain(
      "ratio de guía se confirma",
    );
    expect(answer(iniciacion, "¿En qué época se puede hacer?")).toContain("Todo el año");
  });
});
