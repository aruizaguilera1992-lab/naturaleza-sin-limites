import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CustomPackDesignerModal } from "./CustomPackDesignerModal";

vi.mock("@/hooks/useActivitiesData", () => ({ useActivitiesData: () => ({ activities: [
  { id: "one", name: "Barranco de prueba", activityType: "barranquismo", province: "Málaga", levelLabel: "Inicio", price: "50€", priceValue: 50 },
  { id: "two", name: "Escalada de prueba", activityType: "escalada", province: "Málaga", levelLabel: "Inicio", price: "40€", priceValue: 40 },
] }) }));
vi.mock("@/components/ui/calendar", () => ({ Calendar: ({ onSelect }: { onSelect: (date: Date) => void }) =>
  <button onClick={() => onSelect(new Date(2027, 0, 15))}>Elegir fecha de prueba</button> }));
vi.mock("@/components/ui/dialog", () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>, DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("keeps a custom pack between one and six and carries six into its consultation message", async () => {
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  render(<CustomPackDesignerModal open onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Barranco de prueba/ }));
  fireEvent.click(screen.getByRole("button", { name: /Escalada de prueba/ }));
  fireEvent.click(screen.getByRole("button", { name: "CONTINUAR" }));
  const dates = await screen.findAllByRole("button", { name: "Elegir fecha de prueba" });
  dates.forEach((date) => fireEvent.click(date));
  await waitFor(() => expect(screen.getByRole("button", { name: "CONTINUAR" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "CONTINUAR" }));
  const plus = await screen.findByRole("button", { name: "+" });
  for (let i = 0; i < 10; i++) fireEvent.click(plus);
  expect(plus).toBeDisabled();
  const minus = screen.getByRole("button", { name: "−" });
  for (let i = 0; i < 10; i++) fireEvent.click(minus);
  expect(minus).toBeDisabled();
  for (let i = 0; i < 10; i++) fireEvent.click(plus);
  expect(plus).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Nombre completo *"), { target: { value: "Cliente Prueba" } });
  fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "fixture@example.test" } });
  fireEvent.change(screen.getByLabelText("Teléfono *"), { target: { value: "600000000" } });
  fireEvent.click(screen.getByRole("button", { name: "CONTINUAR" }));
  fireEvent.click(await screen.findByRole("checkbox", { name: "Acepto los términos y condiciones" }));
  fireEvent.click(screen.getByRole("button", { name: "RESERVAR PACK" }));
  expect(open).toHaveBeenCalledOnce();
  expect(decodeURIComponent(String(open.mock.calls[0][0]))).toContain("6 personas");
});
