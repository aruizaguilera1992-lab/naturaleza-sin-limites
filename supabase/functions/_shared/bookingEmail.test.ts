import { assertEquals, assertStringIncludes, assert } from "jsr:@std/assert@1";
import { renderBookingEmail, reliableEmailMoney, emailDate, safeEmailUrl, emailMoneyRows } from "./bookingEmail.ts";
import { bookingEmailFixtures } from "./bookingEmailFixtures.ts";
import { htmlToPlainText } from "./email.ts";

Deno.test("all fixtures use branded, inline table markup and equivalent text", () => {
  for (const data of Object.values(bookingEmailFixtures)) {
    const e = renderBookingEmail(data);
    assertStringIncludes(e.html, 'lang="es"');
    assertStringIncludes(e.html, 'max-width:600px');
    assertStringIncludes(e.html, 'bgcolor="#1A1A1A"');
    assertStringIncludes(e.html, e.preheader);
    assertStringIncludes(e.text, "Naturaleza Sin Límites");
    assertStringIncludes(htmlToPlainText(e.html), "Naturaleza Sin Límites");
    assert(!/<script|<style|@import|<link/i.test(e.html));
  }
});
Deno.test("manual payment link and receipt agree: payment does not confirm date", () => {
  const link = renderBookingEmail(bookingEmailFixtures["enlace-fecha-pendiente"]);
  const receipt = renderBookingEmail(bookingEmailFixtures["recibo-fecha-pendiente"]);
  assertStringIncludes(link.text, "El pago no confirma por sí solo la fecha");
  assertStringIncludes(receipt.text, "fecha solicitada sigue pendiente");
  assert(!link.text.includes("automáticamente"));
  assert(!receipt.subject.includes("Reserva confirmada"));
  assertStringIncludes(renderBookingEmail(bookingEmailFixtures["confirmacion-final"]).subject, "Reserva confirmada");
});
Deno.test("HTML injection escaped in all dynamic fields and unsafe URLs omitted", () => {
  const e = renderBookingEmail({ variant: "request_admin", state: "nueva", activity: '<img onerror="alert(1)">', name: "<script>bad</script>", message: '<a href="evil">bad</a>', email: '"<&' });
  assertStringIncludes(e.html, "&lt;script&gt;");
  assertStringIncludes(e.html, "&lt;img");
  assert(!e.html.includes("<script>"));
  for (const url of ["javascript:alert(1)", "https://evil.test/pago/x", "https://naturalezasinlimites.es.evil.test/", "https://a:b@naturalezasinlimites.es/"]) assertEquals(safeEmailUrl(url), null);
  const bad = renderBookingEmail({ variant: "payment_link", state: "pendiente_pago", activity: "Ejemplo", payUrl: "javascript:alert(1)" });
  assert(!bad.html.includes("javascript:"));
});
Deno.test("Spanish date-only has no invented hour; instants use Madrid including DST", () => {
  assertEquals(emailDate("2027-05-18"), "18 de mayo de 2027");
  assertStringIncludes(emailDate("2027-05-18T07:00:00Z") ?? "", "09:00");
  assertStringIncludes(emailDate("2027-01-18T07:00:00Z") ?? "", "08:00");
  assertEquals(emailDate("not-a-date"), null);
});
Deno.test("reliable economics: official deposit only, accumulated paid, no manual inference", () => {
  const rows = [{ kind: "manual", amount_cents: 5400, total_cents: 18000, status: "pagado" }];
  assertEquals(reliableEmailMoney(rows, rows[0], .3).totalCents, null);
  assertEquals(reliableEmailMoney([{ ...rows[0], kind: "senal", amount_cents: 5000 }], rows[0], .3).totalCents, null);
  const m = reliableEmailMoney([{ ...rows[0], kind: "senal" }, { kind: "manual", amount_cents: 2000, status: "pagado" }], rows[0], .3);
  assertEquals(m.totalCents, 18000);
  assertEquals(m.paidCents, 7400);
  assertEquals(emailMoneyRows(m).at(-1), ["Saldo pendiente", "106,00 €"]);
});
Deno.test("absent data omitted, estimated total labeled, no invented zero or empty level", () => {
  const e = renderBookingEmail(bookingEmailFixtures["recibo-sin-economia"]);
  assertStringIncludes(e.text, "Pendiente de confirmar");
  assert(!e.text.includes("0,00"));
  assert(!e.text.includes("Experiencia"));
  assertEquals(emailMoneyRows({ totalCents: 0 }), []);
  const estimated = renderBookingEmail(bookingEmailFixtures["enlace-precio-estimado"]);
  assertStringIncludes(estimated.text, "Total estimado · pendiente de confirmar");
  assert(!estimated.text.includes("Saldo pendiente"));
});
Deno.test("single main CTA, real expiry, no client technical references or internal notes", () => {
  const e = renderBookingEmail({ ...bookingEmailFixtures["enlace-fecha-pendiente"], reference: "secret-reference", message: "internal-note" });
  assertStringIncludes(e.text, "12 de mayo de 2027, 16:00");
  assert(!e.text.includes("14 días"));
  assert(!e.html.includes("secret-reference"));
  assert(!e.html.includes("internal-note"));
  assertEquals((e.html.match(/>Realizar el pago<\/a>/g) ?? []).length, 1);
  const admin = renderBookingEmail(bookingEmailFixtures["pago-admin"]);
  assertStringIncludes(admin.html, 'href="https://naturalezasinlimites.es/admin"');
  assert(!admin.html.includes("/admin?"));
});
Deno.test("stored category not duplicated, logo has fallback brand text", () => {
  const e = renderBookingEmail(bookingEmailFixtures["solicitud-admin"]);
  assertEquals(e.subject, "Nueva solicitud · Vía Ferrata Ejemplo");
  assertStringIncludes(e.html, 'alt="Naturaleza Sin Límites"');
  const fallback = renderBookingEmail(bookingEmailFixtures["solicitud-sin-datos"]);
  assert(!fallback.html.includes("<img"));
  assertStringIncludes(fallback.html, "Naturaleza Sin Límites");
});