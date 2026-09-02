export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const formatAmount = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() })
    .format(cents / 100);

export async function sendEmail(to: string[], subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM") ?? "onboarding@resend.dev";
  if (!apiKey || to.length === 0) {
    console.log("Email skipped (missing RESEND_API_KEY or recipients)");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Naturaleza Sin Límites <${from}>`,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
  } catch (e) {
    console.error("Resend exception", e);
  }
}

export async function notifyBusiness(subject: string, lines: string[]) {
  const toList = (Deno.env.get("NOTIFICATION_EMAIL") ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  await sendEmail(
    toList,
    subject,
    `<h2>${escapeHtml(subject)}</h2><ul>${lines
      .map((l) => `<li>${escapeHtml(l)}</li>`)
      .join("")}</ul>`,
  );
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
