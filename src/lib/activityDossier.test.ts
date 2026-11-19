import { describe, it, expect } from 'vitest';
import { suggestWetsuit, suggestBootie, participantErrors, isCanyoning, SELAND_WETSUIT, SELAND_BOOTIES } from './activityDossier';
const ok = { fullName: 'Ana López', docId: '12345678Z', birthDate: '1990-01-01', phone: '600000000', emergencyName: 'Luis', emergencyPhone: '611111111' };
describe('dossier', () => {
  it('talla SELAND según tabla oficial', () => {
    expect(SELAND_WETSUIT.length).toBe(33);
    expect(suggestWetsuit({ sizeGroup: 'hombre', heightCm: 175, weightKg: 80 })).toBe('L');
    expect(suggestWetsuit({ sizeGroup: 'mujer', heightCm: 165, weightKg: 60 })).toBe('SW**');
    expect(suggestWetsuit({ sizeGroup: 'nino', heightCm: 130, weightKg: 28 })).toBe('C5');
    expect(suggestWetsuit({ sizeGroup: 'hombre', heightCm: 150, weightKg: 40 })).toBeNull();
    expect(suggestWetsuit({ heightCm: 175, weightKg: 80 })).toBeNull();
  });
  it('escarpín SELAND según tabla oficial', () => {
    expect(SELAND_BOOTIES.length).toBe(8);
    expect(suggestBootie(42)).toBe('M');
    expect(suggestBootie(37)).toBe('XS');
    expect(suggestBootie(40)).toBe('S');
    expect(suggestBootie(44)).toBe('L');
    expect(suggestBootie(47)).toBe('2XL');
    expect(suggestBootie(35)).toBe('3XS');
    expect(suggestBootie(36)).toBe('2XS');
    expect(suggestBootie(33)).toBeNull();
    expect(suggestBootie(49)).toBeNull();
    expect(suggestBootie(null)).toBeNull();
  });
  it('escarpín usa la tabla cuando exista', () => {
    expect(suggestBootie(42, [{ size: '42-43', footMin: 42, footMax: 43 }])).toBe('42-43');
  });
  it('exige datos del seguro', () => { expect(participantErrors(ok)).toEqual([]); expect(participantErrors({ ...ok, docId: '' , emergencyPhone: '1' })).toEqual(['DNI/NIE o pasaporte', 'Teléfono de emergencia']); });
  it('detecta barranquismo', () => { expect(isCanyoning('Río Guadalmina · Barranquismo')).toBe(true); expect(isCanyoning('Vía ferrata')).toBe(false); });
});

import { syncDossier as _sync, defaultDossier as _dd } from './activityDossier';
describe('syncDossier', () => {
  it('usa pasos, material y normas de la salida y el catálogo', () => {
    const out = _sync({ ..._dd('Barranquismo'), extras: ['Mochila'] }, { steps: 'Rápel\nPozas', rules: 'Casco siempre', bring: ['Bañador'], meetingPoint: 'Lentegí', duration: '4 h', startsAt: '2026-06-01T07:00:00Z' });
    expect(out.schedule[0]).toEqual({ time: '09:00', label: 'Quedada en el punto de encuentro: Lentegí' });
    expect(out.schedule.map((s) => s.label).slice(1)).toEqual(['Rápel', 'Pozas']);
    expect(out.needs).toEqual(['Bañador']); expect(out.rules).toEqual(['Casco siempre']);
    expect(out.extras).toEqual(['Mochila']); expect(out.notes).toContain('Duración: 4 h');
  });
  it('sin datos mantiene el contenido actual', () => {
    const base = _dd('Espeleología'); expect(_sync(base, {}).needs).toEqual(base.needs);
  });
});
