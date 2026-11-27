import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

it("opens the full technical sheet and keeps booking available in every section", async () => {
  renderAgenda();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Me apunto a Espeleología de iniciación: Travesía Cueva de la Higuera",
    }),
  );
  const sheet = await screen.findByRole("dialog");
  expect(sheet).toBeInTheDocument();

  // La reserva ya se ofrece en la primera diapositiva.
  const BOOKING_HREF = "/reservar/espeleologia/cueva-de-la-higuera?evento=evt-1";
  expect(within(sheet).getByRole("link", { name: /Reservar plaza/ })).toHaveAttribute(
    "href",
    BOOKING_HREF,
  );

  const seen: string[] = [sheet.textContent ?? ""];
  const bookingHrefs: (string | null)[] = [];
  const sections = within(sheet).getAllByRole("button").filter((button) => button.getAttribute("aria-expanded") === "false");
  for (const section of sections) {
    fireEvent.click(section);
    seen.push(sheet.textContent ?? "");
    bookingHrefs.push(within(sheet).getByRole("link", { name: /Reservar plaza/ }).getAttribute("href"));
    fireEvent.click(section);
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
    "Temporada",
    "Grupo",
    "APROXIMACIÓN EN COCHE",
    "Pasos del recorrido",
    "Incluye",
    "Qué llevar",
    "Requisitos de seguridad",
    "Seguros y permisos",
    "Meteorología",
    "Cancelación",
    "Norma de prueba",
    "Paso de prueba",
    "Preguntas frecuentes",
  ]) {
    expect(all).toContain(dato);
  }

  // La reserva se ofrece en todas las diapositivas, siempre con el mismo destino.
  expect(bookingHrefs.length).toBeGreaterThan(1);
  expect(bookingHrefs.every((href) => href === BOOKING_HREF)).toBe(true);
  expect(within(sheet).getByRole("button", { name: /Preguntas frecuentes/ })).toHaveAttribute("aria-expanded", "false");
});

it("permite consultar la logística y el recorrido sin perder el enlace de reserva", async () => {
  renderAgenda();
  fireEvent.click(screen.getByRole("button", { name: "Me apunto a Espeleología de iniciación: Travesía Cueva de la Higuera" }));
  const sheet = await screen.findByRole("dialog");
  expect(within(sheet).queryByText("Recepción del grupo y briefing técnico.")).toBeNull();
  fireEvent.click(within(sheet).getByRole("button", { name: "Cronograma de la actividad" }));
  expect(within(sheet).getByText("Recepción del grupo y briefing técnico.")).toBeInTheDocument();
  expect(within(sheet).getByText("3 horas")).toBeInTheDocument();
  expect(within(sheet).getByRole("link", { name: /Reservar plaza/ })).toHaveAttribute("href", "/reservar/espeleologia/cueva-de-la-higuera?evento=evt-1");
});

it("permite desplegar el punto de encuentro y abrir los dos mapas", async () => {
  renderAgenda();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Me apunto a Espeleología de iniciación: Travesía Cueva de la Higuera",
    }),
  );
  const sheet = await screen.findByRole("dialog");

  fireEvent.click(within(sheet).getByRole("button", { name: "Punto de encuentro" }));
  expect(within(sheet).getByText("Archidona, Málaga")).toBeInTheDocument();
  const g = within(sheet).getByRole("link", { name: /Abrir en Google Maps/ });
  expect(g).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
  const a = within(sheet).getByRole("link", { name: /Abrir en Apple Maps/ });
  expect(a).toHaveAttribute("href", expect.stringContaining("maps.apple.com"));


});

it("muestra las dudas plegadas y amplía cada pregunta al pulsarla", async () => {
  renderAgenda();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Me apunto a Espeleología de iniciación: Travesía Cueva de la Higuera",
    }),
  );
  const sheet = await screen.findByRole("dialog");

  // Como en la ficha privada, el apartado llega plegado: se abre su cabecera.
  const cabecera = within(sheet).getByRole("button", { name: /Preguntas frecuentes/ });
  expect(cabecera).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(cabecera);
  expect(
    within(sheet).queryByText(/Antes de cerrar la plaza revisamos la experiencia/),
  ).toBeNull();

  // Al pulsar la pregunta se amplía su respuesta.
  const pregunta = within(sheet).getByRole("button", { name: /¿Necesito experiencia previa\?/ });
  expect(pregunta).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(pregunta);
  expect(pregunta).toHaveAttribute("aria-expanded", "true");
  expect(
    within(sheet).getByText(/Antes de cerrar la plaza revisamos la experiencia/),
  ).toBeInTheDocument();
});
