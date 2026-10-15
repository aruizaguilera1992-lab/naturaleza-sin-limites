import { type BookingEmailData } from "./bookingEmail.ts";

// Deliberately fictional. These fixtures never call a database, provider or trigger.
const example = { activity: "Vías Ferratas · Vía Ferrata Ejemplo", date: "2027-05-18", people: 3, name: "Cliente de muestra", email: "cliente@example.test", phone: "+34 600 000 000" };
const money = { totalCents: 18000, depositCents: 5400, paymentCents: 5400, paidCents: 5400 };
export const bookingEmailFixtures: Record<string, BookingEmailData> = {
  "solicitud-admin": { ...example, variant: "request_admin", state: "nueva", message: "Consulta ficticia: preferimos una actividad de iniciación." },
  "solicitud-cliente": { ...example, variant: "request_customer", state: "nueva" },
  "enlace-fecha-pendiente": { ...example, variant: "payment_link", state: "pendiente_pago", money: { paymentCents: 5400 }, payUrl: "https://naturalezasinlimites.es/pago/ejemplo-ficticio-no-valido", expiresAt: "2027-05-12T14:00:00Z" },
  "enlace-salida-programada": { ...example, date: "2027-05-18T07:00:00Z", variant: "payment_link", state: "pendiente_pago", scheduled: true, holdMinutes: 30, money: { ...money, paidCents: 0 }, payUrl: "https://naturalezasinlimites.es/pago/ejemplo-ficticio-no-valido", sandbox: true },
  "recibo-fecha-pendiente": { ...example, variant: "receipt", state: "fecha_pendiente", money },
  "confirmacion-final": { ...example, date: "2027-05-18T07:00:00Z", variant: "receipt", state: "confirmada", scheduled: true, money },
  "pago-admin": { ...example, variant: "payment_admin", state: "fecha_pendiente", money, reference: "REFERENCIA_FICTICIA", sandbox: true },
  "pago-admin-salida": { ...example, variant: "payment_admin", state: "pago_recibido", scheduled: true, date: "2027-05-18T07:00:00Z", money, reference: "REFERENCIA_FICTICIA" },
  "recibo-sin-economia": { activity: "Actividad de muestra", variant: "receipt", state: "pago_recibido" },
  "enlace-precio-estimado": { ...example, variant: "payment_link", state: "pendiente_pago", money: { totalCents: 18000, estimated: true, paymentCents: 5400 }, payUrl: "https://naturalezasinlimites.es/pago/ejemplo-ficticio-no-valido" },
  "solicitud-sin-datos": { activity: "Actividad de muestra", variant: "request_admin", state: "nueva", logoUrl: null },
};