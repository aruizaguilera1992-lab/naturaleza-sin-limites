import { describe, it, expect, vi, beforeEach } from 'vitest';
// Only the mocked email helper is imported into the browser test type-check.
declare global { const Deno: { env: { get(name: string): string | undefined } }; }
vi.mock('../../supabase/functions/_shared/email.ts', () => ({ enqueueNotification: vi.fn().mockResolvedValue('note'), sendEmail: vi.fn().mockResolvedValue({status:'enviado',providerId:'provider'}) }));
import { processCampaigns } from '../../supabase/functions/newsletter-campaigns/worker';
import { enqueueNotification, sendEmail } from '../../supabase/functions/_shared/email';
function database(consent: string, alreadySent = false) {
  const updates: Record<string,unknown>[] = [];
  const db = {
    from: (table: string) => {
      const query: any = { select: () => query, in: () => query, lte: () => query, order: () => query, eq: () => query,
        update: (row: Record<string,unknown>) => { updates.push(row); return query; },
        limit: () => Promise.resolve({data: table==='newsletter_campaigns' ? [{id:'campaign',subject:'Asunto',title:'Título',content:'Texto',preheader:''}] : [{id:'delivery',subscriber_id:'subscriber',confirmed_at:'2026-11-14',email:'test@example.test',unsubscribe_token:'token',attempts:0}]}),
        single: () => Promise.resolve({data: table==='newsletter_subscribers' ? {status:consent,confirmed_at:'2026-11-14',unsubscribed_at:consent==='baja'?'2026-11-15':null} : table==='notification_log'?{created_at:new Date().toISOString()}:{status:'enviando'}}),
        then: (resolve: (v: unknown)=>unknown) => Promise.resolve({error:null}).then(resolve),
      }; return query;
    },
    rpc: vi.fn(async (name: string) => ({ data: name==='claim_newsletter_campaign' ? {claimed:true,lease_id:'lease'} : name==='claim_notification' ? alreadySent ? {claimed:false,reason:'already_sent',provider_id:'provider'} : {claimed:true,lease_id:'nlease',subject:'Asunto',payload:{html:'Texto'},idempotency_key:'stable'} : {ok:true}, error:null })),
  }; return {db,updates};
}
beforeEach(() => vi.clearAllMocks());
describe('campaign worker', () => {
  it('never sends to a subscriber who unsubscribed after the audience snapshot', async () => {
    const {db,updates} = database('baja'); await processCampaigns(db);
    expect(sendEmail).not.toHaveBeenCalled(); expect(enqueueNotification).not.toHaveBeenCalled();
    expect(updates).toContainEqual({status:'omitido',last_error:'Consentimiento retirado o renovado'});
  });
  it('repairs delivery history without sending an already accepted notification twice', async () => {
    const {db,updates} = database('confirmado',true); await processCampaigns(db);
    expect(sendEmail).not.toHaveBeenCalled(); expect(enqueueNotification).toHaveBeenCalledOnce();
    expect(updates[0]).toMatchObject({status:'enviado',notification_log_id:'note',provider_id:'provider'});
  });
});