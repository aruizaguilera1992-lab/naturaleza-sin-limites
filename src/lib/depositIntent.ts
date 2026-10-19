// A stable, unguessable capability for one exact payload. No contact data is stored.
export function savedDepositIntent(eventId: string): string | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(`nsl-deposit-intent:${eventId}`) ?? 'null');
    return saved && typeof saved.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved.id)
      ? saved.id : null;
  } catch { return null; }
}
export async function depositIntentId(payload: Record<string, unknown>): Promise<string> {
  const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(JSON.stringify(payload)))), n => n.toString(16).padStart(2, '0')).join('');
  const key = `nsl-deposit-intent:${String(payload.eventId)}`;
  const saved = sessionStorage.getItem(key);
  if (saved) {
    try {
      const prior = JSON.parse(saved);
      if (prior.fingerprint === fingerprint && typeof prior.id === 'string' && /^[0-9a-f-]{36}$/i.test(prior.id)) return prior.id;
    } catch { /* Replace malformed local data before submitting. */ }
  }
  const id = crypto.randomUUID();
  // Failure is fatal: never submit a non-persisted key that a reload could lose.
  sessionStorage.setItem(key, JSON.stringify({ id, fingerprint }));
  return id;
}
