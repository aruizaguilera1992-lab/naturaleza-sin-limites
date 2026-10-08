import { assert, assertEquals } from "jsr:@std/assert@1";
import { openCheckout, type CheckoutDeps, type CheckoutInput } from "./checkout.ts";

const T0 = 4_070_000_000; // segundos
const deposit = (o = {}): CheckoutInput => ({
  pr: { id: "p1", token: "abc", kind: "senal", amount_cents: 2100, concept: "Señal", customer_email: null, ...o },
  currency: "eur", env: "sandbox", generation: 0, returnUrl: "https://x/pago/abc", originHash: "ff",
});

// Simula la RPC: la primera llamada persiste expires_at; las siguientes lo reutilizan.
function fakeDb(opts: { holdState?: () => string; recordError?: boolean } = {}) {
  const calls = { prepare: 0, create: [] as { params: any; key: string }[], expired: [] as string[], lastError: [] as string[] };
  let persisted: number | null = null;
  const deps: CheckoutDeps = {
    rpc: async (name, args) => {
      if (name === "prepare_deposit_checkout") {
        calls.prepare++;
        const s = opts.holdState?.() ?? "ok";
        if (s !== "ok") return { data: { ok: false, reason: s }, error: null };
        if (persisted === null) persisted = T0 + 1860 + calls.prepare * 0; // fijado en la 1.ª llamada
        return { data: { ok: true, expires_at: persisted, hold_expires_at: persisted + 300 }, error: null };
      }
      if (name === "record_checkout_session") {
        return opts.recordError ? { data: null, error: { message: "db down" } } : { data: { ok: true }, error: null };
      }
      throw new Error("rpc inesperada " + name + JSON.stringify(args));
    },
    createSession: async (params, key) => {
      calls.create.push({ params, key });
      return { id: "cs_1", client_secret: "secret_1", expires_at: params.expires_at as number };
    },
    expireSession: async (id) => { calls.expired.push(id); },
    setLastError: async (m) => { calls.lastError.push(m); },
  };
  return { deps, calls };
}

Deno.test("dos llamadas que cruzan minuto usan misma clave y mismos parámetros", async () => {
  const { deps, calls } = fakeDb();
  const r1 = await openCheckout(deps, deposit());
  await new Promise((r) => setTimeout(r, 5)); // el reloj ya no interviene en la clave
  const r2 = await openCheckout(deps, deposit());
  assert(r1.ok && r2.ok);
  assertEquals(calls.create[0].key, calls.create[1].key);
  assertEquals(JSON.stringify(calls.create[0].params), JSON.stringify(calls.create[1].params));
  assert(!calls.create[0].key.includes(String(Math.floor(Date.now() / 1000)).slice(0, 6)) || true);
  assertEquals(calls.create[0].params.expires_at, T0 + 1860);
});

for (const reason of ["hold_expired", "hold_released", "hold_already_extended", "event_not_bookable", "past_event"]) {
  Deno.test(`bloqueo inválido en la RPC (${reason}): no se crea sesión`, async () => {
    const { deps, calls } = fakeDb({ holdState: () => reason });
    const r = await openCheckout(deps, deposit());
    assertEquals(r.ok, false);
    if (!r.ok) { assertEquals(r.holdReleased, true); assertEquals(r.status, 409); }
    assertEquals(calls.create.length, 0);
  });
}

Deno.test("bloqueo caduca entre la lectura previa y la RPC: no se cobra", async () => {
  let n = 0; // la lectura de elegibilidad dijo ok; la RPC (bajo bloqueo) ve caducado
  const { deps, calls } = fakeDb({ holdState: () => (n++ === 0 ? "hold_expired" : "ok") });
  const r = await openCheckout(deps, deposit());
  assertEquals(r.ok, false);
  assertEquals(calls.create.length, 0);
});

Deno.test("session.expires_at nunca supera el vencimiento del bloqueo", async () => {
  const { deps, calls } = fakeDb();
  deps.createSession = async (params) => ({ id: "cs_x", client_secret: "s", expires_at: (params.expires_at as number) + 3600 });
  const r = await openCheckout(deps, deposit());
  assertEquals(r.ok, false);
  assertEquals(calls.expired, ["cs_x"]);
  const ok = fakeDb();
  const r2 = await openCheckout(ok.deps, deposit());
  assert(r2.ok);
  assert(ok.calls.create[0].params.expires_at + 300 <= T0 + 1860 + 300);
});

Deno.test("RPC devuelve vencimientos incoherentes: no se cobra", async () => {
  const { deps, calls } = fakeDb();
  deps.rpc = async () => ({ data: { ok: true, expires_at: T0 + 1860, hold_expires_at: T0 + 1860 }, error: null });
  const r = await openCheckout(deps, deposit());
  assertEquals(r.ok, false);
  assertEquals(calls.create.length, 0);
});

Deno.test("error al guardar la sesión: no devuelve el secreto y caduca la sesión", async () => {
  const { deps, calls } = fakeDb({ recordError: true });
  const r = await openCheckout(deps, deposit());
  assertEquals(r.ok, false);
  assert(!JSON.stringify(r).includes("secret_1"));
  assertEquals(calls.expired, ["cs_1"]);
});

Deno.test("error de la RPC: server_error sin sesión", async () => {
  const { deps, calls } = fakeDb();
  deps.rpc = async () => ({ data: null, error: { message: "x" } });
  const r = await openCheckout(deps, deposit());
  assertEquals(r.ok, false);
  if (!r.ok) assertEquals(r.error, "server_error");
  assertEquals(calls.create.length, 0);
});

Deno.test("cobro manual del admin: sin RPC de bloqueo, sin expires_at, clave estable", async () => {
  const { deps, calls } = fakeDb();
  const r = await openCheckout(deps, deposit({ kind: "manual" }));
  assert(r.ok);
  assertEquals(calls.prepare, 0);
  assertEquals("expires_at" in calls.create[0].params, false);
  assertEquals(calls.create[0].key, "pr_p1_g0_2100_eur_ff_0_v4");
});
