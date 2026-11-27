import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { SheetContent } from "@/lib/activitySheets";
import { SheetView } from "./SheetView";
import { levelOfferPhotos } from '@/data/levelOffers';

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

it('Sin foto hides a previously saved gallery even with signed URLs', () => {
  render(<SheetView c={{ ...sheet, photo: null, gallery: ['routes/one.webp'] }} ownPhotoUrls={{ 'routes/one.webp': '/images/one.webp' }} />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
});

it('an illustrative selection shows only that photo, not catalog photos', () => {
  const [key, photo] = Object.entries(levelOfferPhotos)[0];
  const { container } = render(<SheetView c={{ ...sheet, photo: key, gallery: ['routes/one.webp'] }} ownPhotoUrls={{ 'routes/one.webp': '/images/one.webp' }} />);
  expect([...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))).toEqual([photo.src]);
});

it('an own-photo selection still allows switching between catalog photos', () => {
  render(<SheetView c={{ ...sheet, photo: 'storage:routes/one.webp', gallery: ['routes/one.webp', 'routes/two.webp'] }} ownPhotoUrls={{ 'routes/one.webp': '/images/one.webp', 'routes/two.webp': '/images/two.webp' }} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe('/images/one.webp');
  fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
  expect(screen.getByRole('img').getAttribute('src')).toBe('/images/two.webp');
});

it("permite consultar requisitos, normas y pasos sin mostrar sus detalles al abrir", () => {
  render(<SheetView c={sheet} />);
  for (const [section, detail] of [
    ['Requisitos', 'Saber nadar'],
    ['Normas de participación', 'No dejar residuos'],
    ['Pasos a seguir', 'Llegada y presentación'],
  ]) {
    expect(screen.queryByText(detail)).toBeNull();
    const trigger = screen.getByRole('button', { name: section });
    fireEvent.click(trigger);
    expect(screen.getByText(detail)).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByText(detail)).toBeNull();
  }
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
