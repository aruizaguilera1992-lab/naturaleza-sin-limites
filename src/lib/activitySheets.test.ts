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
    expect(sheetState({ status: 'enviada', expires_at: null, first_viewed_at: '2026-11-16T10:00:00Z', accepted_at: '2026-11-16T11:00:00Z' }, now)).toBe('aceptada');
    expect(sheetState({ status: 'desactivada', expires_at: null, first_viewed_at: null, accepted_at: '2026-11-16T11:00:00Z' }, now)).toBe('desactivada');
    expect(sheetState({ status: 'desactivada', expires_at: null, first_viewed_at: null }, now)).toBe('desactivada');
    expect(sheetState({ status: 'enviada', expires_at: null, first_viewed_at: '2026-11-16T10:00:00Z' }, now)).toBe('vista');
  });
});

import { sheetFromRequest as fromReq } from './activitySheets';
describe('sheetFromRequest', () => {
  const base = { bookingId: 'b', activity: 'Barranquismo', date: '2026-11-21', people: '3', level: 'Avanzado', name: 'silvia', email: 'a@b.es', phone: '666', message: 'Quiero algo exigente' };
  it('copia fecha, personas, nombre y mensaje y elige nivel', () => {
    const c = fromReq(base);
    expect(c.base).toBe('barranquismo-avanzado');
    expect(c.date).toBe('2026-11-21');
    expect(c.people).toBe(3);
    expect(c.customerName).toBe('silvia');
    expect(c.notes).toContain('Quiero algo exigente');
  });
  it('limita personas a 6 y reconoce ferratas', () => {
    const c = fromReq({ ...base, activity: 'Vía ferrata', level: 'Intermedio', people: '9' });
    expect(c.base).toBe('ferratas-intermedio');
    expect(c.people).toBe(6);
  });
});
