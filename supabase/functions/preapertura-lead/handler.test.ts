import { assertEquals } from "jsr:@std/assert@1";
import { handleLead, type LeadRow } from "./handler.ts";

const SECRET = "test-secret";
async function sign(body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(s)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function run(body: string, sig: string | null) {
  const rows: LeadRow[] = [];
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (sig) headers["x-lead-signature"] = sig;
  const req = new Request("http://x", { method: "POST", body, headers });
  return handleLead(req, SECRET, async (r) => { rows.push(r); return { error: null }; }).then((res) => ({ res, rows }));
}
const good = JSON.stringify({ nombre: "Ana", contacto: "ana@x.es", interes: "Barrancos", mensaje: "Hola" });

Deno.test("firma incorrecta: 401 y no guarda", async () => {
  const { res, rows } = await run(good, "00");
  assertEquals(res.status, 401); assertEquals(rows.length, 0);
});
Deno.test("sin firma: 401", async () => {
  const { res, rows } = await run(good, null);
  assertEquals(res.status, 401); assertEquals(rows.length, 0);
});
Deno.test("firma correcta: 200 y guarda con personas vacío", async () => {
  const { res, rows } = await run(good, await sign(good));
  assertEquals(res.status, 200); assertEquals(rows.length, 1); assertEquals(rows[0].personas, null);
});
Deno.test("nombre de 1 carácter: 400", async () => {
  const b = JSON.stringify({ nombre: "A", contacto: "x" });
  assertEquals((await run(b, await sign(b))).res.status, 400);
});
Deno.test("nombre de 121 caracteres: 400", async () => {
  const b = JSON.stringify({ nombre: "a".repeat(121), contacto: "x" });
  assertEquals((await run(b, await sign(b))).res.status, 400);
});
Deno.test("contacto obligatorio y máx 150", async () => {
  const b1 = JSON.stringify({ nombre: "Ana" });
  const b2 = JSON.stringify({ nombre: "Ana", contacto: "c".repeat(151) });
  assertEquals((await run(b1, await sign(b1))).res.status, 400);
  assertEquals((await run(b2, await sign(b2))).res.status, 400);
});
Deno.test("interes máx 120 y mensaje máx 1000", async () => {
  const b1 = JSON.stringify({ nombre: "Ana", contacto: "x", interes: "i".repeat(121) });
  const b2 = JSON.stringify({ nombre: "Ana", contacto: "x", mensaje: "m".repeat(1001) });
  assertEquals((await run(b1, await sign(b1))).res.status, 400);
  assertEquals((await run(b2, await sign(b2))).res.status, 400);
});
Deno.test("personas con valor: 400", async () => {
  const b = JSON.stringify({ nombre: "Ana", contacto: "x", personas: "3" });
  assertEquals((await run(b, await sign(b))).res.status, 400);
});
