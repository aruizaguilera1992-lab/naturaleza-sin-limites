import { describe, expect, it } from "vitest";
import { pendingProposals, proposalContactDraft } from "./sheetContact";

const base = { id: "a", status: "enviada", accepted_at: null, booking_id: null, contact_id: null, sent_at: "2026-11-01T10:00:00Z", view_count: 0, expires_at: null, content: { title: "Cueva", customerName: "Ana" } };
const NOW = new Date("2026-11-19T10:00:00Z");

describe("pendingProposals", () => {
  it("incluye enviadas sin confirmar ni reservar", () => expect(pendingProposals([base], NOW).map((p) => p.id)).toEqual(["a"]));
  it("excluye aceptadas, reservadas, borradores y caducadas", () => {
    expect(pendingProposals([
      { ...base, accepted_at: "2026-11-02T00:00:00Z" },
      { ...base, booking_id: "b" },
      { ...base, status: "borrador" },
      { ...base, expires_at: "2026-11-10T00:00:00Z" },
    ], NOW)).toEqual([]);
  });
});

describe("proposalContactDraft", () => {
  it("crea contacto en etapa propuesta con seguimiento a 3 días", () => {
    const d = proposalContactDraft({ title: "Cueva", customerName: "Ana", email: "a@b.es" }, NOW);
    expect(d.pipeline_stage).toBe("propuesta");
    expect(d.source).toBe("manual");
    expect(d.contacto).toBe("a@b.es");
    expect(d.next_action_at.startsWith("2026-11-22")).toBe(true);
  });
});
