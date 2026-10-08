// Creates (or deterministically re-creates) the Stripe checkout session for a
// payment request generation. Deposits first call prepare_deposit_checkout,
// which atomically verifies the live seat hold and extends it ONCE to cover a
// persisted, stable session expires_at. Manual admin requests skip that step.

export type RpcFn = (name: string, args: Record<string, unknown>) => Promise<{ data: any; error: unknown }>;

export interface CheckoutDeps {
  rpc: RpcFn;
  createSession: (params: Record<string, unknown>, idempotencyKey: string) => Promise<{
    id: string;
    client_secret: string | null;
    expires_at?: number | null;
  }>;
  expireSession: (id: string) => Promise<unknown>;
  setLastError: (message: string) => Promise<unknown>;
}

export interface CheckoutInput {
  pr: { id: string; token: string; kind: string; amount_cents: number; concept: string; customer_email: string | null };
  currency: string;
  env: string;
  generation: number;
  returnUrl: string;
  originHash: string;
}

export type CheckoutResult =
  | { ok: true; clientSecret: string }
  | { ok: false; status: number; error: string; holdReleased?: boolean; detail?: string };

const SESSION_SECONDS = 31 * 60;
const WEBHOOK_MARGIN_SECONDS = 5 * 60;
const HOLD_REASONS = new Set([
  "no_event", "hold_released", "hold_expired", "event_not_bookable", "past_event",
  "hold_already_extended", "hold_not_covering", "event_too_close",
]);

export async function openCheckout(deps: CheckoutDeps, input: CheckoutInput): Promise<CheckoutResult> {
  const { pr, currency, env, generation } = input;
  const isDeposit = pr.kind === "senal";

  let expiresAt: number | null = null;
  let holdExpiresAt: number | null = null;
  if (isDeposit) {
    const { data, error } = await deps.rpc("prepare_deposit_checkout", {
      _token: pr.token,
      _generation: generation,
      _session_seconds: SESSION_SECONDS,
      _webhook_margin_seconds: WEBHOOK_MARGIN_SECONDS,
    });
    if (error) return { ok: false, status: 500, error: "server_error" };
    if (!data?.ok) {
      const reason = String(data?.reason ?? "unavailable");
      return HOLD_REASONS.has(reason)
        ? { ok: false, status: 409, error: "unavailable", holdReleased: true }
        : { ok: false, status: 409, error: reason };
    }
    expiresAt = Number(data.expires_at);
    holdExpiresAt = Number(data.hold_expires_at);
    if (!Number.isInteger(expiresAt) || !Number.isInteger(holdExpiresAt) ||
        expiresAt + WEBHOOK_MARGIN_SECONDS > holdExpiresAt) {
      return { ok: false, status: 409, error: "unavailable", holdReleased: true };
    }
  }

  const params: Record<string, unknown> = {
    line_items: [{
      price_data: {
        currency,
        product_data: { name: pr.concept, tax_code: "txcd_20030000" },
        unit_amount: pr.amount_cents,
        tax_behavior: "inclusive",
      },
      quantity: 1,
    }],
    mode: "payment",
    ui_mode: "embedded_page",
    return_url: input.returnUrl,
    payment_intent_data: { description: pr.concept },
    ...(pr.customer_email ? { customer_email: pr.customer_email } : {}),
    automatic_tax: { enabled: true },
    metadata: { payment_request_token: pr.token, environment: env },
    ...(expiresAt ? { expires_at: expiresAt } : {}),
  };
  // Every component is persisted or derived from persisted data: retries and
  // concurrent calls of one generation always send the same key and params.
  const key = `pr_${pr.id}_g${generation}_${pr.amount_cents}_${currency}_${input.originHash}_${expiresAt ?? 0}_v4`;

  let session;
  try {
    session = await deps.createSession(params, key);
  } catch (e) {
    const message = String((e as { message?: string })?.message ?? e).slice(0, 400);
    await deps.setLastError(message);
    return { ok: false, status: 502, error: "checkout_failed", detail: message };
  }

  // Defence in depth: never hand out a session that outlives the seat hold.
  if (isDeposit && (!session.expires_at || session.expires_at > (holdExpiresAt as number))) {
    await deps.expireSession(session.id).catch(() => undefined);
    return { ok: false, status: 409, error: "unavailable", holdReleased: true };
  }

  const { data: recorded, error: recordError } = await deps.rpc("record_checkout_session", {
    _token: pr.token,
    _generation: generation,
    _session_id: session.id,
  });
  if (recordError || !recorded?.ok) {
    // Untracked session must not stay payable; the secret is never returned.
    await deps.expireSession(session.id).catch(() => undefined);
    return recordError
      ? { ok: false, status: 500, error: "server_error" }
      : { ok: false, status: 409, error: String(recorded?.reason ?? "checkout_unavailable") };
  }
  if (!session.client_secret) return { ok: false, status: 502, error: "checkout_failed" };
  return { ok: true, clientSecret: session.client_secret };
}
