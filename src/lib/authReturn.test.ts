import { describe, expect, it } from "vitest";
import { clearAuthNext, googleCallbackUrl, readAuthNext, safeNext, storeAuthNext } from "./authReturn";

describe("safeNext", () => {
  it.each(["/", "/admin", "/calendario", "/pago/example?status=ok", "/.lovable/oauth/consent?authorization_id=example", "/actividades/escalada/example#datos"])("preserves internal %s", path => expect(safeNext(path)).toBe(path));
  it.each(["//evil.test", "/\\evil.test", "\\evil.test", "https://evil.test", "javascript:alert(1)", "/%5cevil.test", "/%2fevil.test", "/%252fevil.test", "%2f%2fevil.test", "/%0a/evil.test", "/%00evil", "/%E0%A4%A", "/login", "/login?next=/admin", "/%6cogin", "/%255clogin", "/ /evil.test"])("rejects unsafe or looping %s", path => expect(safeNext(path)).toBe("/"));
  it("handles null and custom fallback", () => { expect(safeNext(null)).toBe("/"); expect(safeNext("//evil", "")).toBe(""); });
  it.each(["/foo/../login", "/foo/%2e%2e/login", "/foo/..//evil.test"])("rejects normalized bypass %s", path => expect(safeNext(path)).toBe("/"));
});
describe("return storage and callback", () => {
  it("stores validated destination then clears it", () => {
    storeAuthNext("/admin", sessionStorage);
    expect(readAuthNext(sessionStorage)).toBe("/admin");
    clearAuthNext(sessionStorage);
    expect(readAuthNext(sessionStorage)).toBeNull();
  });
  it("ignores and removes malicious persisted return", () => {
    sessionStorage.setItem("auth_next", "/%252fevil.test");
    expect(readAuthNext(sessionStorage)).toBeNull();
    expect(sessionStorage.getItem("auth_next")).toBeNull();
  });
  it("tolerates storage security errors and keeps fallback callback public/same-origin", () => {
    const broken = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
    expect(storeAuthNext("/admin", broken)).toBe(false);
    expect(readAuthNext(broken)).toBeNull();
    expect(() => clearAuthNext(broken)).not.toThrow();
    expect(googleCallbackUrl("https://naturalezasinlimites.es", "/admin", false)).toBe("https://naturalezasinlimites.es/login?next=%2Fadmin");
    expect(googleCallbackUrl("https://naturalezasinlimites.es", "/admin", true)).toBe("https://naturalezasinlimites.es/login?next=%2Fadmin");
  });
  it("carries the admin destination even when the callback tab loses session storage", () => {
    storeAuthNext("/admin", sessionStorage);
    const callback = new URL(googleCallbackUrl("https://naturalezasinlimites.es", "/admin", true));
    sessionStorage.clear();
    expect(readAuthNext(sessionStorage)).toBeNull();
    expect(callback.pathname).toBe("/login");
    expect(safeNext(callback.searchParams.get("next"))).toBe("/admin");
    expect(new URL(googleCallbackUrl(callback.origin, "//evil.test", true)).searchParams.get("next")).toBe("/");
  });
});