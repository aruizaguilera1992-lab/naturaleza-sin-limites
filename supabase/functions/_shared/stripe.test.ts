import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { verifyWebhook } from "./stripe.ts";

Deno.test("webhook verifies raw payload, rejects stale, malformed and tampered signatures", async () => {
  const previous = Deno.env.get("PAYMENTS_SANDBOX_WEBHOOK_SECRET");
  Deno.env.set("PAYMENTS_SANDBOX_WEBHOOK_SECRET", "test-only-signing-secret");
  try {
    const body = JSON.stringify({ type: "checkout.session.completed", livemode: false, data: { object: {} } });
    const sign = async (timestamp: string) => {
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("test-only-signing-secret"),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    };
    const request = (text: string, signature?: string) => new Request("https://example.test/webhook", {
      method: "POST", body: text, headers: signature ? { "stripe-signature": signature } : {},
    });
    const now = String(Math.floor(Date.now() / 1000));
    const valid = `t=${now},v1=${await sign(now)}`;
    assertEquals((await verifyWebhook(request(body, valid), "sandbox")).type, "checkout.session.completed");
    await assertRejects(() => verifyWebhook(request(body + " ", valid), "sandbox"));
    await assertRejects(() => verifyWebhook(request(body), "sandbox"));
    for (const timestamp of ["NaN", String(Number(now) - 600)]) {
      await assertRejects(() => verifyWebhook(request(body, `t=${timestamp},v1=invalid`), "sandbox"));
    }
  } finally {
    if (previous === undefined) Deno.env.delete("PAYMENTS_SANDBOX_WEBHOOK_SECRET");
    else Deno.env.set("PAYMENTS_SANDBOX_WEBHOOK_SECRET", previous);
  }
});
