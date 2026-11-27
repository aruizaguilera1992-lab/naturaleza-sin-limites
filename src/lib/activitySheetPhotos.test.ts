import { describe, expect, it } from 'vitest';
import { sheetPhotoPaths } from '../../supabase/functions/_shared/activitySheetPhotos';

describe('private sheet photo selection', () => {
  const catalog = ['routes/one.webp', 'routes/two.webp'];
  it('Sin foto disables both saved photos and catalog fallback', () => {
    expect(sheetPhotoPaths(null, catalog, catalog)).toEqual([]);
    expect(sheetPhotoPaths('', [], catalog)).toEqual([]);
  });
  it('an illustrative photo never enables catalog photos', () => {
    expect(sheetPhotoPaths('barranquismo-iniciacion', catalog, catalog)).toEqual([]);
    expect(sheetPhotoPaths('barranquismo-iniciacion', undefined, catalog)).toEqual([]);
  });
  it('a selected own photo comes first without duplicates', () => {
    expect(sheetPhotoPaths('storage:routes/two.webp', catalog)).toEqual(['routes/two.webp', 'routes/one.webp']);
  });
  it('legacy own-photo sheets retain the catalog fallback', () => {
    expect(sheetPhotoPaths('storage:routes/one.webp', undefined, catalog)).toEqual(catalog);
  });
  it('saved galleries remain scoped to their sheet', () => {
    expect(sheetPhotoPaths('storage:fichas/own.webp', ['fichas/second.webp'], catalog)).toEqual(['fichas/own.webp', 'fichas/second.webp']);
  });
});