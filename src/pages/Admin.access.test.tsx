import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Admin from "./Admin";
const api = vi.hoisted(() => ({ getUser: vi.fn(), getSession: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: api.from, auth: { getUser: api.getUser, getSession: api.getSession, signOut: vi.fn(), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }) } } }));
beforeEach(() => { vi.resetAllMocks(); });
afterEach(cleanup);
function mount() { render(<HelmetProvider><MemoryRouter><Admin /></MemoryRouter></HelmetProvider>); }
it("signed-out admin offers login with retained admin destination", async () => {
  api.getUser.mockResolvedValue({ data: { user: null }, error: null });
  api.getSession.mockResolvedValue({ data: { session: null } });
  mount();
  expect(await screen.findByRole("link", { name: "LOGIN" })).toHaveAttribute("href", "/login?next=/admin");
  expect(api.from).not.toHaveBeenCalled();
});
it("verified user without admin role stays unauthorized with leave/logout and no login loop", async () => {
  api.getUser.mockResolvedValue({ data: { user: { id: "fixture" } }, error: null });
  api.getSession.mockResolvedValue({ data: { session: { user: { id: "fixture" } } } });
  api.from.mockReturnValue({ select() { return this; }, eq() { return this; }, then(resolve: any) { return Promise.resolve({ data: [], error: null }).then(resolve); } });
  mount();
  await screen.findByRole("heading", { name: "Acceso no autorizado" });
  expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Volver a la web" })).toHaveAttribute("href", "/");
  expect(screen.queryByRole("link", { name: "LOGIN" })).not.toBeInTheDocument();
  expect(api.from).toHaveBeenCalledTimes(1);
  expect(api.from).toHaveBeenCalledWith("user_roles");
});

it("legacy confirmed booking with paid seat error is actionable, filtered and never shown as all clear", async () => {
  api.getUser.mockResolvedValue({ data: { user: { id: "fixture" } }, error: null });
  api.getSession.mockResolvedValue({ data: { session: { user: { id: "fixture" } } } });
  api.from.mockImplementation((table: string) => {
    const data = table === "user_roles" ? [{ role: "admin" }]
      : table === "bookings" ? [{ id: "booking-fixture", activity: "LOCAL INCIDENT", name: "Persona ficticia", contact: "fixture@example.test",
        status: "confirmada", created_at: "2026-10-16T10:00:00Z", event_id: null, number_of_people: "2" }]
      : table === "payment_requests" ? [{ id: "payment-fixture", booking_id: "booking-fixture", status: "pagado", last_error: "plazas: sin_plazas",
        amount_cents: 2100, currency: "eur", concept: "LOCAL INCIDENT", created_at: "2026-10-16T10:00:00Z" }]
      : [];
    const query = { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, gte() { return this; },
      then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data, error: null }).then(resolve); } };
    return query;
  });
  mount();
  const incidents = await screen.findByRole("button", { name: "Incidencias de plazas 1" });
  expect(screen.queryByText("Nada pendiente. Todo al día.")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /LOCAL INCIDENT.*Incidencia de plazas/ })).toBeInTheDocument();
  fireEvent.click(incidents);
  const booking = screen.getByRole("button", { name: /LOCAL INCIDENT Incidencia de plazas/ });
  fireEvent.click(booking);
  expect(screen.getByText("Pago recibido sin plaza confirmada.")).toBeInTheDocument();
  expect(screen.queryByText("Confirmada", { exact: true })).not.toBeInTheDocument();
});
