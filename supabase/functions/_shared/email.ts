// Shared email helpers.
// sendEmail NEVER reports success unless the provider actually accepted the message.

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
): Promise<EmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM") ?? "onboarding@resend.dev";
  const recipients = to.map((t) => t.trim()).filter((t) => isEmail(t));

  if (!apiKey) {
    return { status: "omitido", error: "RESEND_API_KEY no configurada" };
  }
  if (recipients.length === 0) {
    return { status: "omitido", error: "Sin destinatarios válidos" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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

export interface NotificationInput {
  kind: string;
  dedupeKey: string;
  recipients: string[];
  subject: string;
  html: string;
  paymentRequestId?: string | null;
  bookingId?: string | null;
  contactId?: string | null;
}

/**
 * Sends a notification and records the real outcome in notification_log.
 * If a notification with the same dedupeKey was already accepted by the
 * provider, it is not sent again (no duplicate confirmations).
 */
export async function sendTrackedNotification(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  input: NotificationInput,
): Promise<EmailResult & { deduped?: boolean }> {
  const { data: existing } = await supabase
    .from("notification_log")
    .select("id, status, attempts, provider_id")
    .eq("dedupe_key", input.dedupeKey)
    .maybeSingle();

  if (existing?.status === "enviado") {
    return { status: "enviado", providerId: existing.provider_id ?? undefined, deduped: true };
  }

  const result = await sendEmail(input.recipients, input.subject, input.html);

  const row = {
    kind: input.kind,
    channel: "email",
    recipient: input.recipients.join(", ") || null,
    subject: input.subject,
    status: result.status,
    provider_id: result.providerId ?? null,
    error: result.error ?? null,
    attempts: (existing?.attempts ?? 0) + 1,
    dedupe_key: input.dedupeKey,
    payload: { html: input.html, recipients: input.recipients },
    payment_request_id: input.paymentRequestId ?? null,
    booking_id: input.bookingId ?? null,
    contact_id: input.contactId ?? null,
  };

  if (existing) {
    const { error } = await supabase.from("notification_log").update(row).eq("id", existing.id);
    if (error) console.error("notification_log update error", error);
  } else {
    const { error } = await supabase.from("notification_log").insert(row);
    if (error) console.error("notification_log insert error", error);
  }

  return result;
}
