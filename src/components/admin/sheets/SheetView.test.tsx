import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { SheetContent } from "@/lib/activitySheets";
import { SheetView } from "./SheetView";

const sheet: SheetContent = {
  base: "barranquismo-iniciacion",
  discipline: "barranquismo",
  level: 1,
  levelLabel: "Iniciación",
  title: "Barranco de prueba",
  place: "Málaga",
  date: "2026-12-05",
  duration: "4 horas",
  meetingPoint: "",
  people: 4,
  pricePerPersonEuros: 45,
  summary: "Resumen de prueba",
  includes: ["Material técnico"],
  bring: ["Mochila"],
  requirements: ["Saber nadar"],
  notes: "",
  rules: "No dejar residuos\nSeguir las indicaciones del guía",
  steps: "Llegada y presentación\nCierre de la actividad",
  minAge: 12,
  fitness: "Básica",
  experience: false,
  photo: null,
  customerName: "",
};

afterEach(cleanup);

it("coloca las normas a la derecha de los requisitos y los pasos debajo, al ancho de la ficha", () => {
  render(<SheetView c={sheet} />);

  const ficha = screen.getByRole("article");
  const requisitos = screen.getByRole("heading", { name: "Requisitos" }).closest("section");
  const normas = screen.getByRole("heading", { name: "Normas" }).closest("section");
  const pasos = screen.getByRole("heading", { name: "Pasos a seguir" }).closest("section");

  expect(requisitos).not.toBeNull();
  expect(normas).not.toBeNull();
  expect(pasos).not.toBeNull();

  // Las normas comparten rejilla con los requisitos: quedan a su derecha.
  expect(normas!.parentElement).toBe(requisitos!.parentElement);

  // Los pasos quedan fuera de esa rejilla, ocupando todo el ancho de la ficha.
  expect(pasos!.parentElement).toBe(ficha);
  expect(
    ficha.compareDocumentPosition(pasos!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

it("muestra las preguntas frecuentes plegadas y las abre al pulsar la cabecera", () => {
  render(<SheetView c={sheet} />);

  const cabecera = screen.getByRole("button", { name: /Preguntas frecuentes/ });
  expect(cabecera).toHaveAttribute("aria-expanded", "false");
  // Plegada: no se ve ninguna pregunta.
  expect(screen.queryByRole("button", { name: /¿/ })).toBeNull();

  fireEvent.click(cabecera);
  expect(cabecera).toHaveAttribute("aria-expanded", "true");
  expect(screen.getAllByRole("button", { name: /¿/ }).length).toBeGreaterThan(0);
});
