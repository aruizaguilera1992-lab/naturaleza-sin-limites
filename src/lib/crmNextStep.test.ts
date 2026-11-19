import { describe, it, expect } from "vitest";
import { bookingNextStep } from "./crmNextStep";
describe("bookingNextStep", () => {
  it("pide señal si la reserva aceptada no tiene pagos", () => expect(bookingNextStep({ status: "pendiente", paid_amount_cents: 0 })).toBe("Enviar enlace de señal"));
  it("pide dossier tras el pago", () => expect(bookingNextStep({ status: "confirmada", paid_amount_cents: 1950 })).toBe("Enviar o revisar dossier"));
  it("nada si está cancelada", () => expect(bookingNextStep({ status: "cancelada" })).toBeNull());
});
