import { describe, it, expect } from 'vitest';
import { suggestWetsuit, suggestBootie, participantErrors, isCanyoning, SELAND_WETSUIT } from './activityDossier';
const ok = { fullName: 'Ana López', docId: '12345678Z', birthDate: '1990-01-01', phone: '600000000', emergencyName: 'Luis', emergencyPhone: '611111111' };
describe('dossier', () => {
  it('talla SELAND según tabla oficial', () => {
    expect(SELAND_WETSUIT.length).toBe(33);
    expect(suggestWetsuit({ sizeGroup: 'hombre', heightCm: 175, weightKg: 80 })).toBe('L');
    expect(suggestWetsuit({ sizeGroup: 'mujer', heightCm: 165, weightKg: 60 })).toBe('SW**');
    expect(suggestWetsuit({ sizeGroup: 'nino', heightCm: 130, weightKg: 28 })).toBe('C5');
    expect(suggestWetsuit({ sizeGroup: 'hombre', heightCm: 150, weightKg: 40 })).toBeNull();
    expect(suggestWetsuit({ heightCm: 175, weightKg: 80 })).toBeNull();
    expect(suggestBootie(42)).toBeNull();
  });
  it('escarpín usa la tabla cuando exista', () => {
    expect(suggestBootie(42, [{ size: '42-43', footMin: 42, footMax: 43 }])).toBe('42-43');
  });
  it('exige datos del seguro', () => { expect(participantErrors(ok)).toEqual([]); expect(participantErrors({ ...ok, docId: '' , emergencyPhone: '1' })).toEqual(['DNI/NIE o pasaporte', 'Teléfono de emergencia']); });
  it('detecta barranquismo', () => { expect(isCanyoning('Río Guadalmina · Barranquismo')).toBe(true); expect(isCanyoning('Vía ferrata')).toBe(false); });
});
