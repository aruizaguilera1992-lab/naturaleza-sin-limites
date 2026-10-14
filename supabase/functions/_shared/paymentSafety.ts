export function paymentsAllowed(environment: string, liveEnabled?: string): boolean {
  return environment === "sandbox" || (environment === "live" && liveEnabled === "true");
}

export function emailDeliveryAllowed(recipients: string[], mode?: string, allowlist = ""): boolean {
  if (mode === "live") return true;
  if (mode !== "test") return false;
  const allowed = new Set(allowlist.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
  return recipients.length > 0 && recipients.every((email) => allowed.has(email.toLowerCase()));
}
