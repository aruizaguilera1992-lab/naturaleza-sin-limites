import { assertEquals } from "jsr:@std/assert@1";
import { sendEmail } from "./email.ts";

Deno.test("Resend delivery is gated, idempotent and redacts provider errors", async () => {
  const keys = ["RESEND_API_KEY", "EMAIL_DELIVERY_MODE", "EMAIL_TEST_RECIPIENTS"];
  const previous = keys.map((key) => Deno.env.get(key));
  const originalFetch = globalThis.fetch;
  let calls = 0;
  let headers: Headers | undefined;
  globalThis.fetch = ((_input: unknown, init?: RequestInit) => {
    calls++;
    headers = new Headers(init?.headers);
    return Promise.resolve(new Response('{"message":"private provider detail"}', { status: 422 }));
  }) as typeof fetch;
  try {
    Deno.env.set("RESEND_API_KEY", "dummy-key");
    Deno.env.delete("EMAIL_DELIVERY_MODE");
    assertEquals((await sendEmail(["tester@example.test"], "Test", "Test")).status, "omitido");
    assertEquals(calls, 0);
    Deno.env.set("EMAIL_DELIVERY_MODE", "test");
    Deno.env.set("EMAIL_TEST_RECIPIENTS", "tester@example.test");
    assertEquals((await sendEmail(["customer@example.test"], "Test", "Test")).status, "omitido");
    assertEquals(calls, 0);
    assertEquals(await sendEmail(["tester@example.test"], "Test", "Test", "stable-key"),
      { status: "fallido", error: "Resend HTTP 422" });
    assertEquals(calls, 1);
    assertEquals(headers?.get("Idempotency-Key"), "stable-key");
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => previous[i] === undefined ? Deno.env.delete(key) : Deno.env.set(key, previous[i]!));
  }
});
