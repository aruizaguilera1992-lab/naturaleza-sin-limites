import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthRedirectHandler } from "./AuthRedirectHandler";
const auth = vi.hoisted(() => ({ getUser: vi.fn(), listen: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: auth.getUser, onAuthStateChange: auth.listen } } }));
beforeEach(() => { vi.resetAllMocks(); sessionStorage.clear(); auth.listen.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }); });
afterEach(cleanup);
function mount() {
  render(<MemoryRouter initialEntries={["/"]}><AuthRedirectHandler><Routes><Route path="/" element={<h1>Home fixture</h1>} /><Route path="/admin" element={<h1>Admin fixture</h1>} /><Route path="/login" element={<h1>Login fixture</h1>} /><Route path="/.lovable/oauth/consent" element={<h1>Consent fixture</h1>} /></Routes></AuthRedirectHandler></MemoryRouter>);
}
it.each([["/admin", "Admin fixture"], ["/.lovable/oauth/consent?authorization_id=fixture", "Consent fixture"]])("callback consumes %s only after verified session, without showing home", async (next, heading) => {
  sessionStorage.setItem("auth_next", next);
  auth.getUser.mockResolvedValue({ data: { user: { id: "fixture" } }, error: null });
  mount(); expect(screen.queryByText("Home fixture")).not.toBeInTheDocument();
  await screen.findByText(heading); expect(sessionStorage.getItem("auth_next")).toBeNull();
});
it("missing session preserves destination in login instead of leaving stale storage", async () => {
  sessionStorage.setItem("auth_next", "/admin");
  auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mount(); await screen.findByText("Login fixture"); expect(sessionStorage.getItem("auth_next")).toBeNull();
});
it("malicious storage cannot navigate externally", async () => {
  sessionStorage.setItem("auth_next", "/%5cevil.test"); mount();
  await screen.findByText("Home fixture"); expect(auth.getUser).not.toHaveBeenCalled();
});