import { describe, it, expect } from 'vitest';
import { sheetFromBase, validateSheet, sheetTotalEuros, sheetWhatsappUrl, sheetState, waPhone } from './activitySheets';

describe('activity sheets', () => {
  it('rejects more than 6 people', () => {
    const c = sheetFromBase('barranquismo-iniciacion');
    expect(validateSheet({ ...c, people: 7 })).toContain('Personas entre 1 y 6');
    expect(validateSheet({ ...c, people: 6 })).toEqual([]);
  });
  it('computes total price per person × people, null when to consult', () => {
    expect(sheetTotalEuros({ people: 4, pricePerPersonEuros: 35 })).toBe(140);
    expect(sheetTotalEuros({ people: 4, pricePerPersonEuros: null })).toBeNull();
  });
  it('builds WhatsApp link with Spanish prefix and the sheet link', () => {
    const url = sheetWhatsappUrl('685 60 95 42', { title: 'Barranco', customerName: 'Ana' }, 'https://x.es/ficha/abc');
    expect(url.startsWith('https://wa.me/34685609542?text=')).toBe(true);
    expect(decodeURIComponent(url)).toContain('https://x.es/ficha/abc');
    expect(waPhone('12')).toBeNull();
  });
  it('expired and disabled links are not active', () => {
    const now = new Date('2026-11-16T12:00:00Z');
    expect(sheetState({ status: 'enviada', expires_at: '2026-11-15T00:00:00Z', first_viewed_at: null }, now)).toBe('caducada');
    expect(sheetState({ status: 'desactivada', expires_at: null, first_viewed_at: null }, now)).toBe('desactivada');
    expect(sheetState({ status: 'enviada', expires_at: null, first_viewed_at: '2026-11-16T10:00:00Z' }, now)).toBe('vista');
  });
});
