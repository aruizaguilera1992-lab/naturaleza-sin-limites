import { describe, expect, it } from "vitest";
import { buildSlots, computeFinance, findCoincidences, localDay, slotForBooking, suggestedDepositCents } from "./adminBooking";

const base = { bookingId: "b1", activity: "X · Y", payments: [] as never[] };

describe("computeFinance", () => {
  it("redondea la señal al céntimo", () => {
    const f = computeFinance({ ...base, participantsRaw: "3", catalogPrice: 33.33 });
    expect(f.totalCents).toBe(9999);
    expect(f.depositCents).toBe(3000);
    expect(f.estimated).toBe(true);
    expect(suggestedDepositCents(f)).toBe(3000);
  });
  it("sin tarifa no inventa importes", () => {
    const f = computeFinance({ ...base, participantsRaw: "4", catalogPrice: null });
    expect(f.totalCents).toBeNull();
    expect(f.depositCents).toBeNull();
    expect(suggestedDepositCents(f)).toBeNull();
  });
  it("prioriza el total persistido de la señal y no sugiere otra si está pagada", () => {
    const f = computeFinance({
      ...base,
      participantsRaw: "2",
      eventPriceCents: 9000,
      catalogPrice: 10,
      payments: [{ booking_id: "b1", amount_cents: 2100, status: "pagado", kind: "senal", total_cents: 7000 }] as never,
    });
    expect(f.source).toBe("senal");
    expect(f.totalCents).toBe(7000);
    expect(f.balanceCents).toBe(4900);
    expect(f.depositPaid).toBe(true);
    expect(suggestedDepositCents(f)).toBeNull();
  });
  it("usa el precio de la salida antes que el catálogo", () => {
    const f = computeFinance({ ...base, participantsRaw: "2", eventPriceCents: 4500, catalogPrice: 99 });
    expect(f.source).toBe("salida");
    expect(f.totalCents).toBe(9000);
    expect(f.estimated).toBe(false);
  });
});

describe("cobros manuales", () => {
  it("no infiere el total de un cobro manual ni de una señal que no es el 30 %", () => {
    const f = computeFinance({
      ...base,
      participantsRaw: "2",
      catalogPrice: null,
      payments: [
        { booking_id: "b1", amount_cents: 5000, status: "pagado", kind: "manual", total_cents: null },
        { booking_id: "b1", amount_cents: 1000, status: "pendiente", kind: "senal", total_cents: 7000 },
      ] as never,
    });
    expect(f.source).toBe("ninguna");
    expect(f.totalCents).toBeNull();
    expect(f.paidCents).toBe(5000);
  });
});

describe("coincidencias", () => {
  const events = [
    { id: "e1", title: "Ferrata", starts_at: "2026-10-23T07:00:00Z", ends_at: "2026-10-23T11:00:00Z", status: "publicada", guide_name: "Antonio" },
    { id: "e2", title: "Barranco", starts_at: "2026-10-23T10:00:00Z", ends_at: "2026-10-23T14:00:00Z", status: "publicada", guide_name: "Antonio" },
    { id: "e3", title: "Tarde", starts_at: "2026-10-23T15:00:00Z", ends_at: "2026-10-23T17:00:00Z", status: "publicada" },
    { id: "e4", title: "Cancelada", starts_at: "2026-10-23T08:00:00Z", ends_at: "2026-10-23T09:00:00Z", status: "cancelada" },
  ];
  const bookings = [
    { id: "b1", activity: "A", preferred_date: "2026-10-23", status: "nueva", event_id: "e1" },
    { id: "b2", activity: "A", preferred_date: "2026-10-23", status: "nueva", event_id: "e1" },
    { id: "b3", activity: "Sin hora", preferred_date: "2026-10-23", status: "nueva", event_id: null },
    { id: "b4", activity: "Anulada", preferred_date: "2026-10-23", status: "cancelada", event_id: null },
  ];
  const slots = buildSlots(events, bookings);
  const c = findCoincidences(slotForBooking(bookings[0], slots), slots);

  it("agrupa reservas de la misma salida y excluye canceladas", () => {
    const keys = c.map((x) => x.slot.key);
    expect(keys).not.toContain("event:e1");
    expect(keys).not.toContain("event:e4");
    expect(keys).not.toContain("booking:b4");
    expect(keys).not.toContain("booking:b2");
  });
  it("detecta solape real con mismo guía e ignora intervalos disjuntos", () => {
    expect(c.find((x) => x.slot.key === "event:e2")).toMatchObject({ level: "solape", sameGuide: true });
    expect(c.find((x) => x.slot.key === "event:e3")).toBeUndefined();
  });
  it("sin hora solo avisa del mismo día", () => {
    expect(c.find((x) => x.slot.key === "booking:b3")?.level).toBe("mismo_dia");
  });
  it("usa el día local de Madrid", () => {
    expect(localDay("2026-10-22T22:30:00Z")).toBe("2026-10-23");
  });
});
