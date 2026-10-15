import { render, screen, cleanup } from "@testing-library/react";
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