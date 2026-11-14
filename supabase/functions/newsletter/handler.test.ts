import { describe, it, expect } from "vitest";
import { parseRequest, discountCode } from "./handler.ts";

describe("newsletter parseRequest", () => {
  it("sin consentimiento expreso se rechaza", () => {
    expect(parseRequest({ action: "subscribe", email: "a@b.es" })).toEqual({ ok: false, error: "consent_required" });
    expect(parseRequest({ action: "subscribe", email: "a@b.es", consent: "true" })).toEqual({ ok: false, error: "consent_required" });
  });
  it("con consentimiento acepta y filtra segmentos desconocidos", () => {
    expect(parseRequest({ action: "subscribe", email: "a@b.es", consent: true, segments: ["ferratas", "escalada"] }))
      .toEqual({ ok: true, action: "subscribe", email: "a@b.es", segments: ["ferratas"] });
  });
  it("token mal formado no llega a la base de datos", () => {
    expect(parseRequest({ action: "unsubscribe", token: "x" }).ok).toBe(false);
  });
  it("el código de descuento es estable por suscriptor", () => {
    expect(discountCode("abcdef12-0000")).toBe("NSL10-ABCDEF");
  });
});
