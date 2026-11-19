/** Siguiente paso sugerido para una reserva, a partir de su estado y pagos. */
export function bookingNextStep(b: { status: string; paid_amount_cents?: number | null }): string | null {
  const paid = (b.paid_amount_cents ?? 0) > 0;
  if (b.status === "cancelada") return null;
  if (!paid && (b.status === "nueva" || b.status === "pendiente")) return "Enviar enlace de señal";
  if (b.status === "pendiente_pago") return "Esperando pago del cliente";
  if (paid || b.status === "confirmada") return "Enviar o revisar dossier";
  return null;
}
