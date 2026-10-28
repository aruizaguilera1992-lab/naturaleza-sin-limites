import { describe, expect, it } from "vitest";
import { findDuplicates, followUpBucket } from "./crmFollowUp";

const now = new Date("2026-10-28T11:00:00Z");

describe("follow-ups", () => {
  it("classifies overdue, today and upcoming", () => {
    expect(followUpBucket("2026-10-27T20:00:00Z", now)).toBe("vencido");
    expect(followUpBucket("2026-10-28T21:00:00Z", now)).toBe("hoy");
    expect(followUpBucket("2026-10-29T09:00:00Z", now)).toBe("proximo");
    expect(followUpBucket(null, now)).toBeNull();
  });
});

describe("duplicates", () => {
  const list = [
    { id: "1", nombre: "Ana", contacto: "ANA@correo.es" },
    { id: "2", nombre: "Luis", contacto: "+34 685 60 95 42" },
  ];
  it("matches by email ignoring case and by phone format", () => {
    expect(findDuplicates({ email: "ana@correo.es" }, list).map((c) => c.id)).toEqual(["1"]);
    expect(findDuplicates({ phone: "685609542" }, list).map((c) => c.id)).toEqual(["2"]);
  });
  it("no match without valid data", () => {
    expect(findDuplicates({ contacto: "Pepe" }, list)).toEqual([]);
  });
});
