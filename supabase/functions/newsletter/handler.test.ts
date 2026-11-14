import { assertEquals } from "jsr:@std/assert@1";
import { discountCode, parseRequest } from "./handler.ts";

Deno.test("sin consentimiento expreso se rechaza", () => {
  assertEquals(parseRequest({ action: "subscribe", email: "a@b.es" }), { ok: false, error: "consent_required" });
  assertEquals(parseRequest({ action: "subscribe", email: "a@b.es", consent: "true" }), { ok: false, error: "consent_required" });
});
Deno.test("con consentimiento acepta y filtra segmentos desconocidos", () => {
  assertEquals(parseRequest({ action: "subscribe", email: "a@b.es", consent: true, segments: ["ferratas", "escalada"] }),
    { ok: true, action: "subscribe", email: "a@b.es", segments: ["ferratas"] });
});
Deno.test("token mal formado se rechaza", () => {
  assertEquals(parseRequest({ action: "unsubscribe", token: "x" }).ok, false);
});
Deno.test("código de descuento estable", () => {
  assertEquals(discountCode("abcdef12-0000"), "NSL10-ABCDEF");
});
