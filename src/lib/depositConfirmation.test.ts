import { describe, expect, it } from "vitest";
import { depositConfirmationOption, paymentLinkBody } from "./depositConfirmation";

const b = { status: "contactada", preferred_date: "2027-05-18", event_id: null };
describe("depositConfirmationOption", () => {
  it("preselects only for a prefilled signal on a valid manual booking", () => {
    expect(depositConfirmationOption(b, [], true, "2027-05-01")).toEqual({ available: true, preselected: true });
    expect(depositConfirmationOption(b, [], false, "2027-05-01").preselected).toBe(false);
  });
  it("is unavailable for scheduled, cancelled, undated or paid-signal bookings", () => {
    expect(depositConfirmationOption({ ...b, event_id: "e" }, [], true, "2027-05-01").available).toBe(false);
    expect(depositConfirmationOption({ ...b, status: "cancelada" }, [], true, "2027-05-01").available).toBe(false);
    expect(depositConfirmationOption({ ...b, preferred_date: null }, [], true, "2027-05-01").available).toBe(false);
    expect(depositConfirmationOption(b, [{ kind: "senal", status: "pagado" }], true, "2027-05-01").available).toBe(false);
  });
  it("sends purpose only for explicit booking emails", () => {
    const base = { target: "booking" as const, id: "x", amountCents: 100, concept: "aa", environment: "sandbox" as const, baseUrl: "https://a.es" };
    expect(paymentLinkBody({ ...base, sendEmail: true, confirmDeposit: true }).purpose).toBe("booking_deposit_confirmation");
    expect("purpose" in paymentLinkBody({ ...base, sendEmail: false, confirmDeposit: true })).toBe(false);
    expect("purpose" in paymentLinkBody({ ...base, sendEmail: true, confirmDeposit: false })).toBe(false);
  });
});
