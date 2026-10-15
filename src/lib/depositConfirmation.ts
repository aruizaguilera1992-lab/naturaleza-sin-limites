// Panel-side mirror of the explicit "confirm activity + deposit" intent. The server re-validates everything.
export const DEPOSIT_CONFIRMATION_PURPOSE = "booking_deposit_confirmation" as const;

export type DepositConfirmationOption = { available: boolean; preselected: boolean; reason?: string };

type B = { status: string; preferred_date: string | null; event_id: string | null };
type P = { kind?: string; status: string };

export function depositConfirmationOption(b: B, payments: P[], signalPrefilled: boolean, today = new Date().toISOString().slice(0, 10)): DepositConfirmationOption {
  if (b.event_id) return { available: false, preselected: false, reason: "Salida programada: las plazas se confirman con su propio pago." };
  if (b.status === "cancelada") return { available: false, preselected: false, reason: "Reserva cancelada." };
  if (!b.preferred_date || !/^\d{4}-\d{2}-\d{2}$/.test(b.preferred_date) || b.preferred_date < today)
    return { available: false, preselected: false, reason: "Sin fecha válida: no se puede confirmar la actividad." };
  if (payments.some((p) => p.kind === "senal" && p.status === "pagado")) return { available: false, preselected: false, reason: "La señal ya está pagada." };
  return { available: true, preselected: signalPrefilled };
}

export function paymentLinkBody(input: {
  target: "booking" | "contact"; id: string; amountCents: number; concept: string;
  environment: "sandbox" | "live"; sendEmail: boolean; baseUrl: string; confirmDeposit: boolean;
}) {
  const { confirmDeposit, ...rest } = input;
  const explicit = confirmDeposit && input.target === "booking" && input.sendEmail;
  return { ...rest, ...(explicit ? { purpose: DEPOSIT_CONFIRMATION_PURPOSE } : {}) };
}
