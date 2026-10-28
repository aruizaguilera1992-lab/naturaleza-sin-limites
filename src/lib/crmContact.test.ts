import { describe, expect, it } from "vitest";
import { contactChannels, mailtoLink, normalizePhone, telLink, whatsappLink } from "./crmContact";

describe("crm quick actions", () => {
  it("adds +34 to Spanish mobiles", () => {
    expect(normalizePhone("685 60 95 42")).toBe("34685609542");
    expect(whatsappLink("685609542", "Hola")).toBe("https://wa.me/34685609542?text=Hola");
    expect(telLink("+34 685 60 95 42")).toBe("tel:+34685609542");
  });
  it("invalid phones produce no link", () => {
    expect(whatsappLink("12345", "Hola")).toBeNull();
    expect(telLink("ana@correo.es")).toBeNull();
    expect(whatsappLink("+34 123", "x")).toBeNull();
  });
  it("invalid emails produce no mailto", () => {
    expect(mailtoLink("no-es-email", "a", "b")).toBeNull();
    expect(mailtoLink("ana@correo.es", "Hola", "Qué tal")).toBe("mailto:ana@correo.es?subject=Hola&body=Qu%C3%A9%20tal");
  });
  it("falls back to the contacto field", () => {
    expect(contactChannels({ contacto: "ana@correo.es" })).toEqual({ email: "ana@correo.es", phone: null });
    expect(contactChannels({ contacto: "685609542" })).toEqual({ email: null, phone: "685609542" });
  });
});
