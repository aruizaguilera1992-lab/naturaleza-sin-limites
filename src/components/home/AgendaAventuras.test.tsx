import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import type { ActivityEvent } from "@/hooks/useActivityEvents";
import { AgendaAventuras } from "./AgendaAventuras";

const { event } = vi.hoisted(() => ({
  event: {
    id: "evt-1",
    category: "espeleologia",
    slug: "cueva-de-la-higuera",
    title: "Espeleología de iniciación: Travesía Cueva de la Higuera",
    ends_at: null,
    meeting_point_public: "Archidona, Málaga",
    latitude: null,
    longitude: null,
    capacity_total: 6,
    seats_reserved: 0,
    price_cents: 5500,
    status: "publicada",
    rules: "Norma de prueba",
    steps: "Paso de prueba",
    startDate: new Date(),
    freeSeats: 6,
    isFull: false,
    pricePerPerson: 55,
    zone: "Archidona, Málaga",
    profile: {
      category: "espeleologia",
      slug: "cueva-de-la-higuera",
      categoryLabel: "Espeleología",
      shortDescription: "Primera toma de contacto con el mundo subterráneo.",
      technicalLevel: "Iniciación",
      totalDuration: "3 horas",
      effectiveDuration: "2 horas",
      experienceLevel: "No",
      physicalLevel: "Básica",
      minimumAge: "12 años",
      season: "Todo el año",
      group: "Mínimo 2; máximo 6",
      guideRatio: "1 guía por cada 6",
      approachReturn: "10 minutos",
      previousExperience: "No",
      price: "Desde 55 €",
      priceValue: 55,
      zone: "Archidona, Málaga",
      technicalElements: ["Apta para principiantes"],
      itinerary: ["Recepción del grupo y briefing técnico."],
      included: ["Guía titulado"],
      bring: ["Ropa de montaña"],
      safetyRequirements: ["Edad mínima: 12 años"],
      insurancePermits: ["Seguro de accidentes y RC"],
      weatherPolicy: "Si la meteorología no es segura, proponemos nueva fecha.",
      cancellationPolicy: "Se facilitan por escrito antes de confirmar.",
      faqs: [
        {
          question: "¿Necesito experiencia previa?",
          answer: "No para la salida de iniciación.",
        },
      ],
    },
  },
}));

vi.mock("@/hooks/useActivityEvents", () => ({
  useActivityEvents: () => ({ events: [event], loading: false, error: null, reload: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderAgenda = () =>
  render(
    <MemoryRouter>
      <AgendaAventuras />
    </MemoryRouter>,
  );

it("does not offer booking directly on the agenda card", () => {
  renderAgenda();
  expect(screen.queryByRole("link", { name: /Reservar plaza/ })).toBeNull();
  expect(screen.getByText("55 €")).toBeInTheDocument();
});

it("opens the full technical sheet on click and only then offers booking", async () => {
  renderAgenda();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Me apunto a Espeleología de iniciación: Travesía Cueva de la Higuera",
    }),
  );
  const sheet = await screen.findByRole("dialog");
  expect(sheet).toBeInTheDocument();
  expect(within(sheet).queryByRole("link", { name: /Reservar plaza/ })).toBeNull();

  // Se recorre la ficha diapositiva a diapositiva y se anota lo que muestra cada una.
  const seen: string[] = [];
  for (let i = 0; i < 25; i++) {
    seen.push(sheet.textContent ?? "");
    const next = within(sheet).queryByRole("button", { name: /Siguiente/ });
    if (!next) break;
    fireEvent.click(next);
  }
  const all = seen.join("\n");

  // Todos los datos de la actividad aparecen en alguna diapositiva.
  for (const dato of [
    "Fecha",
    "Precio",
    "Plazas libres",
    "Nivel",
    "Grado técnico",
    "Edad mínima",
    "Condición física",
    "Punto de encuentro",
    "Duración total",
    "Actividad efectiva",
    "Temporada",
    "Grupo",
    "Ratio guía",
    "Aproximación",
    "Pasos del recorrido",
    "Elementos técnicos",
    "Incluye",
    "Qué llevar",
    "Requisitos de seguridad",
    "Seguros y permisos",
    "Meteorología",
    "Cancelación",
    "Norma de prueba",
    "Paso de prueba",
    "Dudas frecuentes",
    "¿Necesito experiencia previa?",
  ]) {
    expect(all).toContain(dato);
  }

  // La reserva solo se ofrece al final del recorrido.
  expect(within(sheet).getByText("Dudas frecuentes")).toBeInTheDocument();
  await waitFor(() =>
    expect(
      within(sheet).getByRole("link", { name: /Reservar plaza/ }),
    ).toHaveAttribute("href", "/reservar/espeleologia/cueva-de-la-higuera?evento=evt-1"),
  );
});
