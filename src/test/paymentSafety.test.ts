import { describe, it, expect } from "vitest";
import { paymentsAllowed, emailDeliveryAllowed } from "../../supabase/functions/_shared/paymentSafety";

describe("payment and email safety defaults", () => {
  it("allows sandbox and requires an explicit server flag for live", () => {
    expect(paymentsAllowed("sandbox")).toBe(true);
    for (const flag of [undefined, "false", "TRUE", "1"]) expect(paymentsAllowed("live", flag)).toBe(false);
    expect(paymentsAllowed("live", "true")).toBe(true);
    expect(paymentsAllowed("invalid", "true")).toBe(false);
  });
  it("blocks delivery by default and unknown modes", () => {
    expect(emailDeliveryAllowed(["customer@example.test"])).toBe(false);
    expect(emailDeliveryAllowed(["customer@example.test"], "typo")).toBe(false);
  });
  it("requires every recipient to be explicitly allowed in test mode", () => {
    const list = " Tester@example.test, other@example.test ";
    expect(emailDeliveryAllowed(["tester@example.test"], "test", list)).toBe(true);
    expect(emailDeliveryAllowed(["tester@example.test", "customer@example.test"], "test", list)).toBe(false);
    expect(emailDeliveryAllowed([], "test", list)).toBe(false);
    expect(emailDeliveryAllowed(["tester@example.test"], "test")).toBe(false);
  });
});
