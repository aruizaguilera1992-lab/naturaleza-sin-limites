/** Only a selected own photo enables the private sheet's catalog gallery. */
export function sheetPhotoPaths(photo: unknown, gallery: unknown, catalogPhotos: unknown = []): string[] {
  if (typeof photo !== 'string' || !photo.startsWith('storage:')) return [];
  const main = photo.slice('storage:'.length);
  if (!main) return [];
  const saved = Array.isArray(gallery) ? gallery : [];
  const extra = saved.length ? saved : Array.isArray(catalogPhotos) ? catalogPhotos : [];
  return [...new Set([main, ...extra.slice(0, 20).filter((p): p is string => typeof p === 'string')])];
}