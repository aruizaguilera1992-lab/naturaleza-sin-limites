// Shared email + durable notification helpers.
//
// Invariants:
//  - A notification is ALWAYS persisted before any provider call.
//  - Work is claimed atomically with a recoverable lease (claim_notification).
//  - The provider call carries a stable idempotency key, so a crash between
//    "sent" and "persisted" cannot produce a duplicate email on retry.
//  - Persistence errors propagate: we never report success we did not store.

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const formatAmount = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() })
    .format(cents / 100);

export type EmailStatus = "enviado" | "fallido" | "omitido";

export interface EmailResult {
  status: EmailStatus;
  providerId?: string;
  error?: string;
}

/** Sends an email through Resend. Returns the real provider outcome. */
export async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  idempotencyKey?: string,
): Promise<EmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM") ?? "onboarding@resend.dev";
  const recipients = to.map((t) => t.trim()).filter((t) => isEmail(t));

  if (!apiKey) return { status: "omitido", error: "RESEND_API_KEY no configurada" };
  if (recipients.length === 0) return { status: "omitido", error: "Sin destinatarios válidos" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Stable key: the provider de-duplicates retries of the same intent.
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey.slice(0, 256) } : {}),
      },
      body: JSON.stringify({
        from: `Naturaleza Sin Límites <${from}>`,
        to: recipients,
        subject,
        html,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("Resend error", res.status, text);
      return { status: "fallido", error: `HTTP ${res.status}: ${text.slice(0, 400)}` };
    }
    let providerId: string | undefined;
    try {
      providerId = JSON.parse(text)?.id;
    } catch { /* body without id */ }
    return { status: "enviado", providerId };
  } catch (e) {
    console.error("Resend exception", e);
    return { status: "fallido", error: String(e).slice(0, 400) };
  }
}

export function businessRecipients(): string[] {
  return (Deno.env.get("NOTIFICATION_EMAIL") ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function layout(title: string, bodyHtml: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">
    <h2 style="color:#FF6B35;margin-bottom:8px">${escapeHtml(title)}</h2>
    ${bodyHtml}
    <p style="margin-top:24px;font-size:13px;color:#666">
      Naturaleza Sin Límites · Deportes de aventura en Málaga<br/>
      WhatsApp: +34 685 60 95 42
    </p>
  </div>`;
}

export function listLayout(subject: string, lines: string[]) {
  return `<h2>${escapeHtml(subject)}</h2><ul>${lines
    .map((l) => `<li>${escapeHtml(l)}</li>`)
    .join("")}</ul>`;
}

export interface NotificationIntent {
  kind: string;
  dedupeKey: string;
  recipients: string[];
  subject: string;
  html: string;
  paymentRequestId?: string | null;
  bookingId?: string | null;
  contactId?: string | null;
}

/** Shape the confirmation RPC expects for durable intents. */
export function toRpcNotification(intent: NotificationIntent) {
  return {
    kind: intent.kind,
    dedupe_key: intent.dedupeKey,
    recipients: intent.recipients,
    subject: intent.subject,
    html: intent.html,
  };
}

// deno-lint-ignore no-explicit-any
type Db = any;

/** Persists the intent first (idempotent on dedupe_key). Returns its id. */
export async function enqueueNotification(supabase: Db, intent: NotificationIntent): Promise<string> {
  const row = {
    kind: intent.kind,
    channel: "email",
    recipient: intent.recipients.join(", ") || null,
    subject: intent.subject,
    status: "pendiente",
    dedupe_key: intent.dedupeKey,
    provider_idempotency_key: intent.dedupeKey,
    payload: { html: intent.html, recipients: intent.recipients },
    payment_request_id: intent.paymentRequestId ?? null,
    booking_id: intent.bookingId ?? null,
    contact_id: intent.contactId ?? null,
  };

  const { error } = await supabase.from("notification_log").insert(row);
  if (error && error.code !== "23505") {
    // Persistence failures must propagate: no silent send.
    throw new Error(`notification_persist_failed: ${error.message}`);
  }

  const { data, error: readError } = await supabase
    .from("notification_log")
    .select("id")
    .eq("dedupe_key", intent.dedupeKey)
    .maybeSingle();
  if (readError || !data?.id) {
    throw new Error(`notification_persist_failed: ${readError?.message ?? "sin id"}`);
  }
  return data.id as string;
}

export interface DispatchResult {
  id: string;
  status: EmailStatus | "reclamado_por_otro" | "ya_enviado";
  providerId?: string;
  error?: string;
}

/**
 * Claims a persisted notification and sends it exactly once.
 * Never sends without a lease; never reports a status it could not store.
 */
export async function dispatchNotification(supabase: Db, id: string): Promise<DispatchResult> {
  const { data: claim, error: claimError } = await supabase.rpc("claim_notification", {
    _id: id,
    _lease_seconds: 120,
  });
  if (claimError) throw new Error(`notification_claim_failed: ${claimError.message}`);

  if (!claim?.claimed) {
    if (claim?.reason === "already_sent") {
      return { id, status: "ya_enviado", providerId: claim.provider_id ?? undefined };
    }
    return { id, status: "reclamado_por_otro", error: claim?.reason };
  }

  const recipients: string[] = claim.payload?.recipients ??
    (claim.recipient ? String(claim.recipient).split(",") : []);
  const html: string = claim.payload?.html ?? "";

  const result = html
    ? await sendEmail(recipients, claim.subject, html, claim.idempotency_key)
    : ({ status: "fallido", error: "sin_contenido" } as EmailResult);

  const { data: finish, error: finishError } = await supabase.rpc("finish_notification", {
    _id: id,
    _lease_id: claim.lease_id,
    _status: result.status,
    _provider_id: result.providerId ?? null,
    _error: result.error ?? null,
    _retry_in_seconds: 300,
  });
  if (finishError) throw new Error(`notification_finish_failed: ${finishError.message}`);
  if (!finish?.ok) throw new Error(`notification_finish_failed: ${finish?.reason}`);

  return { id, status: result.status, providerId: result.providerId, error: result.error };
}

/** Persist + dispatch in one call (non-payment flows). */
export async function sendTrackedNotification(
  supabase: Db,
  intent: NotificationIntent,
): Promise<DispatchResult> {
  const id = await enqueueNotification(supabase, intent);
  return await dispatchNotification(supabase, id);
}

/**
 * Repairs every notification that is still pending (or whose lease expired)
 * for a payment request. Already-accepted notifications are never resent.
 */
export async function dispatchPendingForPayment(
  supabase: Db,
  paymentRequestId: string,
): Promise<DispatchResult[]> {
  const { data, error } = await supabase
    .from("notification_log")
    .select("id, status, lease_expires_at, next_attempt_at")
    .eq("payment_request_id", paymentRequestId)
    .neq("status", "enviado");
  if (error) throw new Error(`notification_scan_failed: ${error.message}`);

  const now = Date.now();
  const due = (data ?? []).filter((n: Record<string, string | null>) => {
    if (n.status === "reclamado") {
      return !n.lease_expires_at || new Date(n.lease_expires_at).getTime() <= now;
    }
    return !n.next_attempt_at || new Date(n.next_attempt_at).getTime() <= now;
  });

  const results: DispatchResult[] = [];
  for (const n of due) {
    results.push(await dispatchNotification(supabase, n.id as string));
  }
  return results;
}
