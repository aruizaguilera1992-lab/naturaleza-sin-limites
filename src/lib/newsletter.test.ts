import { describe, expect, it } from 'vitest';
import { newsletterEligible, campaignDedupeKey, newsletterSegments, newsletterBody } from './newsletter';
describe('newsletter campaign safeguards', () => {
  it('allows only the same confirmed consent at send time', () => {
    expect(newsletterEligible({ status: 'confirmado', confirmed_at: '2026-11-14', unsubscribed_at: null }, '2026-11-14')).toBe(true);
    expect(newsletterEligible({ status: 'pendiente', confirmed_at: null, unsubscribed_at: null }, '2026-11-14')).toBe(false);
    expect(newsletterEligible({ status: 'baja', confirmed_at: '2026-11-14', unsubscribed_at: '2026-11-15' }, '2026-11-14')).toBe(false);
    expect(newsletterEligible({ status: 'confirmado', confirmed_at: '2026-11-16', unsubscribed_at: null }, '2026-11-14')).toBe(false);
  });
  it('keeps a stable unique key per recipient and campaign', () => {
    expect(campaignDedupeKey('a', 'b')).toBe('campaign:a:sub:b');
    expect(campaignDedupeKey('a', 'b')).not.toBe(campaignDedupeKey('a', 'c'));
  });
  it('limits audience to the agreed disciplines', () => { expect(newsletterSegments).toEqual(['barranquismo', 'ferratas', 'espeleologia']); });
  it('escapes arbitrary HTML and rejects unsafe links and images', () => {
    const html = newsletterBody('<script>alert(1)</script>\n[x](javascript:alert)\n![x](https://external/image.jpg)\n![x](/images/../image.jpg)');
    expect(html).not.toContain('<script>'); expect(html).not.toContain('<a '); expect(html).not.toContain('<img ');
    expect(newsletterBody('![Río](/images/river.webp)')).toContain('src="https://naturalezasinlimites.es/images/river.webp"');
  });
});