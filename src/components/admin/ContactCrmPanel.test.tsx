import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ContactCrmPanel, type CrmContact } from "./ContactCrmPanel";

const api = vi.hoisted(() => ({ from: vi.fn(), getUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: api.from, auth: { getUser: api.getUser } },
}));

const savedContact = (): CrmContact => ({
  id: "contact-fixture",
  nombre: "Silvia Ruiz",
  contacto: "silvia@example.test",
  interes: "Escalada",
  email: "silvia@example.test",
  phone: "+34600111222",
  pipeline_stage: "nuevo",
  tags: [],
});

beforeEach(() => {
  vi.resetAllMocks();
  api.getUser.mockResolvedValue({ data: { user: { id: "admin-fixture" } }, error: null });
});
afterEach(cleanup);

it("logging a communication keeps classification edits that are not saved yet", async () => {
  const insert = vi.fn().mockResolvedValue({ data: null, error: null });
  api.from.mockImplementation((table: string) => (table === "contact_events" ? { insert } : {}));
  const onSaved = vi.fn();
  const contact = savedContact();
  const { rerender } = render(<ContactCrmPanel contact={contact} onSaved={onSaved} />);

  fireEvent.change(screen.getByLabelText(/Etiquetas/i), { target: { value: "vip, grupo" } });
  fireEvent.change(screen.getByLabelText("Resumen"), { target: { value: "Llamada de bienvenida" } });
  fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  expect(insert).toHaveBeenCalledTimes(1);

  // loadData() re-fetches the row: same saved values, but a new object identity.
  rerender(<ContactCrmPanel contact={{ ...contact }} onSaved={onSaved} />);

  expect(screen.getByLabelText(/Etiquetas/i)).toHaveValue("vip, grupo");
});

it("saving the classification writes exactly what the admin typed", async () => {
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
  api.from.mockImplementation(() => ({ update }));
  render(<ContactCrmPanel contact={savedContact()} onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Etiquetas/i), { target: { value: "vip, grupo" } });
  fireEvent.change(screen.getByLabelText("Participantes"), { target: { value: "8" } });
  fireEvent.click(screen.getByRole("button", { name: /Guardar clasificación/ }));

  await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
  expect(update.mock.calls[0][0]).toMatchObject({ tags: ["vip", "grupo"], participants: 8 });
});
