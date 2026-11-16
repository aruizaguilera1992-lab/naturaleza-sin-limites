import { describe, it, expect } from 'vitest';
import { levelOffersFor } from './levelOffers';

describe('oferta por niveles', () => {
  it('ferratas: tres niveles, solo iniciación con precio «desde» (35 €)', () => {
    const f = levelOffersFor('ferratas');
    expect(f.map((o) => o.nivel)).toEqual(['Iniciación', 'Intermedio', 'Avanzado']);
    expect(f[0].precioDesde).toBe(35);
    expect(f[1].precioDesde).toBeNull();
    expect(f[2].precioDesde).toBeNull();
  });
  it('barranquismo: tres niveles, iniciación desde 35 €', () => {
    const b = levelOffersFor('barranquismo');
    expect(b).toHaveLength(3);
    expect(b[0].precioDesde).toBe(35);
  });
});
