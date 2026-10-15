import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Login from "./Login";

const auth = vi.hoisted(() => ({ getUser: vi.fn(), signIn: vi.fn(), listen: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: auth.getUser, onAuthStateChange: auth.listen } } }));
vi.mock("@/integrations/lovable/index", () => ({ lovable: { auth: { signInWithOAuth: auth.signIn } } }));
function mount(path = "/login?next=/admin") {
  render(<HelmetProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/login" element={<Login />} /><Route path="/admin" element={<h1>Admin destination</h1>} /><Route path="/" element={<h1>Public web</h1>} /><Route path="/.lovable/oauth/consent" element={<h1>Consent destination</h1>} /></Routes></MemoryRouter></HelmetProvider>);
}
beforeEach(() => {
  vi.resetAllMocks(); sessionStorage.clear();
  auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  auth.listen.mockReturnValue({ data: { subscription: { unsubscribe: auth.unsubscribe } } });
});
afterEach(cleanup);
describe("Google-only login", () => {
  it("already signed in returns to admin without another Google call", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "fixture" } }, error: null });
    mount(); await screen.findByText("Admin destination"); expect(auth.signIn).not.toHaveBeenCalled();
  });
  it("preserves consent context and destination", async () => {
    mount("/login?next=" + encodeURIComponent("/.lovable/oauth/consent?authorization_id=fixture"));
    expect(screen.getByRole("heading", { name: "Conectar una aplicación" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeEnabled());
    auth.signIn.mockImplementation(async () => { auth.getUser.mockResolvedValue({ data: { user: { id: "fixture" } }, error: null }); return {}; });
    fireEvent.click(screen.getByRole("button", { name: "Continuar con Google" }));
    await screen.findByText("Consent destination"); expect(sessionStorage.getItem("auth_next")).toBeNull();
  });
  it.each(["throw", "returned", "cancelled"])("%s failure is accessible and can retry without a stuck loading state", async mode => {
    auth.signIn.mockImplementation(async () => { if (mode === "throw") throw Error("fixture"); return mode === "returned" ? { error: Error("fixture") } : {}; });
    mount(); const button = await screen.findByRole("button", { name: "Continuar con Google" });
    await waitFor(() => expect(button).toBeEnabled()); fireEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveFocus();
    expect(screen.getByRole("button", { name: "Reintentar con Google" })).toBeEnabled();
    expect(sessionStorage.getItem("auth_next")).toBeNull();
  });
  it("manual cancellation ignores late success and returns to public web", async () => {
    let resolve: (value: object) => void = () => {};
    auth.signIn.mockImplementation(() => new Promise(r => { resolve = r; }));
    mount(); const button = await screen.findByRole("button", { name: "Continuar con Google" });
    await waitFor(() => expect(button).toBeEnabled()); fireEvent.click(button);
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar y volver a la web" }));
    await screen.findByText("Public web"); resolve({});
    expect(sessionStorage.getItem("auth_next")).toBeNull();
  });
});