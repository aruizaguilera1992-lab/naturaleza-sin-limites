import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));
import { ContactDetail } from "./ContactDetail";

afterEach(cleanup);
const contact = { id: "c1", nombre: "Silvia Ruiz", contacto: "s@example.test", interes: "Barranquismo", email: "s@example.test", phone: "+34600111222", created_at: "2026-11-01T10:00:00Z" };
const renderIt = () => render(
  <ContactDetail contact={contact} stageLabel="Nuevo" receivedLabel="recibido" statusBadge={<span>pendiente</span>}
    ficha={<p>FICHA</p>} seguimiento={<p>SEGUIMIENTO</p>} reservas={<p>RESERVAS</p>} notas={<p>NOTAS</p>}
    adminActions={<button>Eliminar definitivamente</button>} onSaved={() => {}} renderTitle={(n) => <h2>{n}</h2>} />,
);

it("has exactly four main tabs and no Gestión tab", () => {
  renderIt();
  expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Ficha", "Seguimiento", "Reservas y pagos", "Notas"]);
});

it("keeps the proposal message after closing and reopening the dialog", () => {
  renderIt();
  fireEvent.click(screen.getByRole("button", { name: /Preparar propuesta/ }));
  fireEvent.change(screen.getByLabelText(/Mensaje/), { target: { value: "Propuesta a medida" } });
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: /Preparar propuesta/ }));
  expect(screen.getByLabelText(/Mensaje/)).toHaveValue("Propuesta a medida");
});
