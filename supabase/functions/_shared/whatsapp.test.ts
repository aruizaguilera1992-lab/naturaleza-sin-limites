import { assert, assertEquals } from "jsr:@std/assert@1";
import { buildWhatsappPaymentMessage, normalizeWaPhone, whatsappHandoffUrl } from "./whatsapp.ts";

Deno.test("teléfonos: español con prefijo, formato libre y rechazos", () => {
  assertEquals(normalizeWaPhone("685 60 95 42"), "34685609542");
  assertEquals(normalizeWaPhone("+34 685 60 95 42"), "34685609542");
  assertEquals(normalizeWaPhone("0034685609542"), "34685609542");
  assertEquals(normalizeWaPhone("034606330019"), "34606330019"); // prefijo con cero inicial
  assertEquals(normalizeWaPhone("0685609542"), "34685609542"); // móvil español con cero inicial
  assertEquals(normalizeWaPhone("6856095"), null); // incompleto
  assertEquals(normalizeWaPhone(null), null);
  assertEquals(normalizeWaPhone("951 00 00 00"), "34951000000"); // fijo español aceptado como destino
});

Deno.test("mensaje de confirmación con importe, fecha y enlace de pago", () => {
  const m = buildWhatsappPaymentMessage({
    name: "Antonio",
    activity: "Barranco Ejemplo",
    date: "2027-05-18",
    amountCents: 5400,
    totalCents: 18000,
    deposit: true,
    payUrl: "https://naturalezasinlimites.es/pago/abc",
  });
  assert(m.includes("Hola Antonio,"));
  assert(m.includes("«Barranco Ejemplo» del 18 de mayo de 2027 está confirmada"));
  assert(m.includes("Total de la actividad: 180,00"));
  assert(m.includes("Señal a pagar ahora (30 %): 54,00"));
  assert(m.includes("https://naturalezasinlimites.es/pago/abc"));
});

Deno.test("enlace wa.me con el mensaje codificado; null sin teléfono válido", () => {
  const url = whatsappHandoffUrl("685609542", "Hola");
  assertEquals(url, "https://wa.me/34685609542?text=Hola");
  assertEquals(whatsappHandoffUrl("no-es-un-telefono", "Hola"), null);
});
