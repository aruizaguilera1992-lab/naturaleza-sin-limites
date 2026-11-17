import { describe, it, expect } from 'vitest';
import { suggestWetsuit, suggestBootie, participantErrors, isCanyoning, SELAND_WETSUIT } from './activityDossier';
const ok = { fullName: 'Ana López', docId: '12345678Z', birthDate: '1990-01-01', phone: '600000000', emergencyName: 'Luis', emergencyPhone: '611111111' };
describe('dossier', () => {
  it('no inventa talla sin tabla SELAND', () => { expect(SELAND_WETSUIT).toHaveLength(0); expect(suggestWetsuit({ heightCm: 170, chestCm: 90 })).toBeNull(); expect(suggestBootie(42)).toBeNull(); });
  it('usa la tabla cuando existe', () => {
    expect(suggestWetsuit({ heightCm: 170 }, [{ size: 'M', heightMin: 165, heightMax: 175 }])).toBe('M');
    expect(suggestBootie(42, [{ size: '42-43', footMin: 42, footMax: 43 }])).toBe('42-43');
  });
  it('exige datos del seguro', () => { expect(participantErrors(ok)).toEqual([]); expect(participantErrors({ ...ok, docId: '' , emergencyPhone: '1' })).toEqual(['DNI/NIE o pasaporte', 'Teléfono de emergencia']); });
  it('detecta barranquismo', () => { expect(isCanyoning('Río Guadalmina · Barranquismo')).toBe(true); expect(isCanyoning('Vía ferrata')).toBe(false); });
});
