import { describe, it, expect } from "vitest";
import { matchBooking } from "./crmMatching";

describe("matchBooking", () => {
  it("email y teléfono iguales → relacionada", () => {
    expect(matchBooking({ email: "A@x.es", phone: "685 60 95 42" }, { email: "a@x.es", phone: "+34685609542" }).level).toBe("relacionada");
  });
  it("solo email → posible", () => {
    expect(matchBooking({ email: "a@x.es", phone: "600000001" }, { email: "a@x.es", phone: "600000002" }).level).toBe("posible");
  });
  it("solo teléfono → posible", () => {
    expect(matchBooking({ email: "a@x.es", phone: "600000001" }, { email: "b@x.es", phone: "600000001" }).level).toBe("posible");
  });
  it("nada en común → sin coincidencia", () => {
    expect(matchBooking({ email: "a@x.es" }, { email: "b@x.es" }).level).toBeNull();
  });
});
