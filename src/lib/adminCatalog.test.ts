import { describe, it, expect } from 'vitest';
import { baseCatalog, mergeCatalog } from './adminCatalog';

describe('admin catalog', () => {
  it('keeps the full Magdalena route distinct from its final commercial section', () => {
    const b = baseCatalog();
    expect(b.some((i) => i.key === 'barranquismo:magdalena-final')).toBe(true);
    expect(b.some((i) => i.key === 'barranquismo:ref-magdalena-castril')).toBe(true);
    expect(b.filter((i) => i.name.includes('Jorox'))).toHaveLength(1);
  });
  it('includes the remaining Andalusian RocJumper references without prices', () => {
    const b = baseCatalog();
    for (const slug of ['mina-albunol', 'raja-alicun']) {
      const item = b.find((i) => i.key === `barranquismo:ref-${slug}`);
      expect(item?.province).toBe('Granada');
      expect(item?.pricePerPersonEuros).toBeNull();
      expect(item?.reference).toBe(true);
    }
  });
  it('includes advanced and integral routes independently of lower sections', () => {
    const b = baseCatalog();
    for (const key of ['ref-tajo-ronda-integral', 'original-zarzalones', 'original-zarzalones-superior', 'original-poqueira', 'original-lanjaron', 'ref-aguilera-tolox-yunquera', 'ref-castillejos-luna-pizarra']) {
      const item = b.find((i) => i.key === `barranquismo:${key}`);
      expect(item?.level).toBe(3);
      expect(item?.pricePerPersonEuros).toBeNull();
    }
    expect(b.some((i) => i.key === 'barranquismo:zarzalones-inferior')).toBe(true);
    expect(b.some((i) => i.key === 'barranquismo:original-rio-verde')).toBe(true);
    expect(new Set(b.map((i) => i.key)).size).toBe(b.length);
  });
  it('contains the original catalog of the three disciplines', () => {
    const b = baseCatalog();
    expect(b.some((i) => i.key === 'barranquismo:guadalmina')).toBe(true);
    expect(b.some((i) => i.discipline === 'ferratas')).toBe(true);
    expect(b.some((i) => i.discipline === 'espeleologia')).toBe(true);
  });
  it('saved edits override original fields; unedited items keep original data', () => {
    const b = baseCatalog();
    const m = mergeCatalog(b, [{ key: 'barranquismo:guadalmina', data: { name: 'Nuevo nombre' }, photos: ['a.jpg'] }]);
    const g = m.find((i) => i.key === 'barranquismo:guadalmina')!;
    expect(g.name).toBe('Nuevo nombre'); expect(g.photos).toEqual(['a.jpg']); expect(g.edited).toBe(true);
    expect(g.pricePerPersonEuros).toBe(35);
    const other = m.find((i) => i.key !== 'barranquismo:guadalmina')!;
    expect(other.edited).toBe(false); expect(other.photos).toEqual([]);
  });
});
