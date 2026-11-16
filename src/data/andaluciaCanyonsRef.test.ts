import { describe, expect, it } from 'vitest';
import { andaluciaCanyonsRef, refLevelFromGrade } from './andaluciaCanyonsRef';
import { baseCatalog } from '@/lib/adminCatalog';

const AND = ['Málaga', 'Granada', 'Almería', 'Jaén', 'Cádiz', 'Córdoba', 'Sevilla', 'Huelva'];

describe('barrancos de referencia de Andalucía', () => {
  it('solo incluye provincias andaluzas', () => {
    expect(andaluciaCanyonsRef.every((c) => AND.includes(c.provincia))).toBe(true);
  });
  it('deriva el nivel orientativo del grado', () => {
    expect(refLevelFromGrade('v2-a1-I')).toBe(1);
    expect(refLevelFromGrade('v3-a1-II')).toBe(2);
    expect(refLevelFromGrade('v3-a2-III')).toBe(3);
    expect(refLevelFromGrade('v4-a1-II')).toBe(3);
  });
  it('se añaden al panel sin precio y sin duplicar el catálogo comercial', () => {
    const items = baseCatalog();
    const refs = items.filter((i) => i.key.startsWith('barranquismo:ref-'));
    expect(refs.length).toBeGreaterThan(10);
    expect(refs.every((i) => i.pricePerPersonEuros === null)).toBe(true);
    expect(refs.some((i) => i.key === 'barranquismo:ref-jorox')).toBe(false);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });
});
