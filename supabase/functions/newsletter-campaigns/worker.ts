import { enqueueNotification, sendEmail } from '../_shared/email.ts';
import { renderNewsletter, newsletterEligible, campaignDedupeKey } from '../_shared/newsletterContent.ts';
// The campaign lease serializes batches; notification leases and stable provider keys
// recover crashes without re-sending an accepted message. Failed attempts stop after 3
// within the provider's 24-hour idempotency window; older uncertain sends need review.
export async function processCampaigns(db: any): Promise<number> {
  const { data: campaigns, error } = await db.from('newsletter_campaigns').select('*').in('status', ['programada', 'enviando']).lte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(3);
  if (error) throw error;
  let processed = 0;
  for (const c of campaigns ?? []) {
    const { data: lease, error: claimError } = await db.rpc('claim_newsletter_campaign', { _id: c.id });
    if (claimError) throw claimError;
    if (!lease?.claimed) continue;
    const { data: deliveries, error: scanError } = await db.from('newsletter_deliveries').select('*').eq('campaign_id', c.id).eq('status', 'pendiente').lte('next_attempt_at', new Date().toISOString()).limit(20);
    if (scanError) throw scanError;
    for (const d of deliveries ?? []) {
      const { data: active, error: activeError } = await db.from('newsletter_campaigns').select('status').eq('id', c.id).single();
      if (activeError) throw activeError;
      if (active.status === 'cancelada') break;
      const { data: sub, error: subError } = await db.from('newsletter_subscribers').select('status,confirmed_at,unsubscribed_at').eq('id', d.subscriber_id).single();
      if (subError) throw subError;
      if (!newsletterEligible(sub, d.confirmed_at)) {
        const { error: skipError } = await db.from('newsletter_deliveries').update({ status: 'omitido', last_error: 'Consentimiento retirado o renovado' }).eq('id', d.id);
        if (skipError) throw skipError;
        continue;
      }
      const unsub = `https://naturalezasinlimites.es/newsletter?accion=baja&token=${d.unsubscribe_token}`;
      const id = await enqueueNotification(db, { kind: 'newsletter', dedupeKey: campaignDedupeKey(c.id, d.subscriber_id), recipients: [d.email], subject: c.subject, html: renderNewsletter(c, unsub) });
      const { data: claim, error: nError } = await db.rpc('claim_notification', { _id: id, _lease_seconds: 120 });
      if (nError) throw nError;
      if (!claim?.claimed) {
        if (claim?.reason === 'already_sent') {
          const { error: repairError } = await db.from('newsletter_deliveries').update({ status: 'enviado', notification_log_id: id, provider_id: claim.provider_id, sent_at: new Date().toISOString() }).eq('id', d.id);
          if (repairError) throw repairError;
        }
        continue;
      }
      const { data: note, error: noteError } = await db.from('notification_log').select('created_at').eq('id', id).single();
      if (noteError) throw noteError;
      const tooOld = Date.now() - Date.parse(note.created_at) > 23 * 3600000;
      // Recheck the current consent just before contacting the provider.
      const { data: latest, error: latestError } = await db.from('newsletter_subscribers').select('status,confirmed_at,unsubscribed_at').eq('id', d.subscriber_id).single();
      if (latestError) throw latestError;
      const result = tooOld ? { status: 'omitido' as const, error: 'Revisión manual: vencida ventana de idempotencia' } : !newsletterEligible(latest, d.confirmed_at) ? { status: 'omitido' as const, error: 'Baja antes del envío' } : await sendEmail([d.email], claim.subject, claim.payload.html, claim.idempotency_key);
      const { data: finish, error: finishError } = await db.rpc('finish_notification', { _id: id, _lease_id: claim.lease_id, _status: result.status, _provider_id: result.providerId ?? null, _error: result.error ?? null, _retry_in_seconds: 300 });
      if (finishError || !finish?.ok) throw finishError ?? new Error('No se pudo registrar el envío');
      const attempts = d.attempts + 1;
      const { error: updateError } = await db.from('newsletter_deliveries').update({ notification_log_id: id, attempts, status: result.status === 'fallido' && attempts < 3 ? 'pendiente' : result.status, next_attempt_at: new Date(Date.now() + 300000).toISOString(), provider_id: result.providerId ?? null, last_error: result.error ?? null, sent_at: result.status === 'enviado' ? new Date().toISOString() : null }).eq('id', d.id);
      if (updateError) throw updateError;
      processed++;
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    const { error: finishError } = await db.rpc('finish_newsletter_campaign', { _id: c.id, _lease: lease.lease_id });
    if (finishError) throw finishError;
  }
  return processed;
}