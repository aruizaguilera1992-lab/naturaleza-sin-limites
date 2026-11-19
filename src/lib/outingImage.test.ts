import { describe, expect, it } from "vitest";
import { resolveOutingImage } from "./outingImage";

const CATALOG = "https://cdn.example/sign/catalog-photos/uploads/lentegi.png?token=abc";
const LOCAL = "/images/barrancos/rio-lentegi.jpg";

describe("resolveOutingImage", () => {
  it("muestra la foto de la ficha del catálogo cuando ya está disponible", () => {
    expect(
      resolveOutingImage({ catalogImagePath: "uploads/lentegi.png", photoUrl: CATALOG, settled: true, localImage: LOCAL }),
    ).toBe(CATALOG);
  });

  it("no avanza la imagen local mientras la foto del catálogo está en camino", () => {
    expect(
      resolveOutingImage({ catalogImagePath: "uploads/lentegi.png", photoUrl: null, settled: false, localImage: LOCAL }),
    ).toBeNull();
  });

  it("recurre a la imagen local si el catálogo no puede servir su foto", () => {
    expect(
      resolveOutingImage({ catalogImagePath: "uploads/lentegi.png", photoUrl: null, settled: true, localImage: LOCAL }),
    ).toBe(LOCAL);
  });

  it("usa la imagen local cuando la ficha del catálogo no tiene foto propia", () => {
    expect(resolveOutingImage({ photoUrl: null, settled: true, localImage: LOCAL })).toBe(LOCAL);
    expect(resolveOutingImage({ catalogImagePath: "", photoUrl: null, settled: false, localImage: LOCAL })).toBe(LOCAL);
  });

  it("devuelve null cuando no hay ninguna imagen", () => {
    expect(resolveOutingImage({ photoUrl: null, settled: true })).toBeNull();
  });
});
