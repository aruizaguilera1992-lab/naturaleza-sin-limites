import { describe, it, expect } from 'vitest';
import { baseCatalog, mergeCatalog } from './adminCatalog';

describe('admin catalog', () => {
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
