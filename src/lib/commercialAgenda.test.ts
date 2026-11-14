import { describe, expect, it } from "vitest";
import { addDays, agendaBucket, agendaCounts, buildAgenda, type AgendaContact } from "./commercialAgenda";

// 2026-11-14 12:00 Madrid (UTC+1)
const NOW = new Date("2026-11-14T11:00:00Z");
const mk = (id: string, at: string | null, extra: Partial<AgendaContact> = {}): AgendaContact => ({
  id, nombre: id, created_at: "2026-01-01T00:00:00Z", next_action: at ? "Llamar" : null, next_action_at: at, pipeline_stage: "nuevo", ...extra,
});

describe("agendaBucket (Europe/Madrid)", () => {
  it("vencido: ayer a última hora en Madrid", () => expect(agendaBucket(mk("a", "2026-11-13T22:59:00Z"), NOW)).toBe("vencido"));
  it("hoy: 00:30 Madrid aunque en UTC sea el día anterior", () => expect(agendaBucket(mk("a", "2026-11-13T23:30:00Z"), NOW)).toBe("hoy"));
  it("próximos 7 días incluye el séptimo día y excluye el octavo", () => {
    expect(agendaBucket(mk("a", "2026-11-15T09:00:00Z"), NOW)).toBe("proximo7");
    expect(agendaBucket(mk("a", "2026-11-21T22:00:00Z"), NOW)).toBe("proximo7");
    expect(agendaBucket(mk("a", "2026-11-21T23:30:00Z"), NOW)).toBeNull();
  });
  it("cambio de mes", () => {
    const now = new Date("2026-11-28T10:00:00Z");
    expect(addDays("2026-11-28", 7)).toBe("2026-12-05");
    expect(agendaBucket(mk("a", "2026-12-05T10:00:00Z"), now)).toBe("proximo7");
    expect(agendaBucket(mk("a", "2026-12-06T10:00:00Z"), now)).toBeNull();
  });
  it("sin fecha o sin acción = sin seguimiento solo si está abierto", () => {
    expect(agendaBucket(mk("a", null), NOW)).toBe("sin_seguimiento");
    expect(agendaBucket(mk("a", "2026-11-15T09:00:00Z", { next_action: "" }), NOW)).toBe("sin_seguimiento");
    expect(agendaBucket(mk("a", null, { pipeline_stage: "ganado" }), NOW)).toBeNull();
    expect(agendaBucket(mk("a", null, { pipeline_stage: "perdido" }), NOW)).toBeNull();
  });
});

describe("agenda counts and order", () => {
  const list = [
    mk("sin-viejo", null, { created_at: "2025-01-01T00:00:00Z" }),
    mk("sin-nuevo", null, { created_at: "2026-05-01T00:00:00Z" }),
    mk("prox", "2026-11-16T09:00:00Z"),
    mk("hoy-baja", "2026-11-14T08:00:00Z", { priority: "baja" }),
    mk("hoy-alta", "2026-11-14T18:00:00Z", { priority: "alta" }),
    mk("venc-tarde", "2026-11-10T09:00:00Z"),
    mk("venc-pronto", "2026-11-01T09:00:00Z"),
  ];
  it("cuenta por grupo", () => expect(agendaCounts(list, NOW)).toEqual({ vencido: 2, hoy: 2, proximo7: 1, sin_seguimiento: 2 }));
  it("ordena grupo → prioridad → fecha / antigüedad", () => {
    expect(buildAgenda(list, "todos", "", NOW).map((i) => i.contact.id)).toEqual(
      ["venc-pronto", "venc-tarde", "hoy-alta", "hoy-baja", "prox", "sin-viejo", "sin-nuevo"]);
  });
  it("filtra y busca", () => {
    expect(buildAgenda(list, "hoy", "", NOW)).toHaveLength(2);
    expect(buildAgenda([mk("x", null, { phone: "+34 600 111 222" })], "todos", "600111", NOW)).toHaveLength(1);
  });
});
