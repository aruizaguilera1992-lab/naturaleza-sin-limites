import { describe, it, expect } from 'vitest';
import { sheetFromBase, validateSheet, sheetTotalEuros, sheetWhatsappUrl, sheetState, waPhone } from './activitySheets';

describe('activity sheets', () => {
  it('rejects more than 20 people', () => {
    const c = sheetFromBase('barranquismo-iniciacion');
    expect(validateSheet({ ...c, people: 21 })).toContain('Personas entre 1 y 20');
    expect(validateSheet({ ...c, people: 20 })).toEqual([]);
  });
  it('accepts a proposal without a fixed date', () => {
    const c = sheetFromBase('barranquismo-iniciacion');
    expect(validateSheet({ ...c, date: '' })).toEqual([]);
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
  it('limita personas a 20 y reconoce ferratas', () => {
    const c = fromReq({ ...base, activity: 'Vía ferrata', level: 'Intermedio', people: '25' });
    expect(c.base).toBe('ferratas-intermedio');
    expect(c.people).toBe(20);
    expect(fromReq({ ...base, people: '9' }).people).toBe(9);
  });
});

import { sheetFromCatalog as fromCatalog, validateSheet as validate } from './activitySheets';
describe('ficha privada desde el catálogo', () => {
  const item = { key: 'espeleologia:x', discipline: 'espeleologia', name: 'Cueva X', province: 'Málaga', zone: 'Archidona', levelLabel: 'Iniciación', level: 1,
    grade: 'Clase 1', duration: '1 a 3 horas', pricePerPersonEuros: 55, summary: 'Resumen', description: 'Detalle largo', includes: ['Casco'], requirements: ['Req'],
    minAge: 12, fitness: 'Básica', experience: false, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', photos: [], edited: true } as never;
  it('copia todos los campos completados del catálogo', () => {
    const c = fromCatalog(item);
    expect([c.title, c.place, c.grade, c.duration, c.pricePerPersonEuros, c.summary, c.description, c.videoUrl, c.minAge, c.fitness, c.experience])
      .toEqual(['Cueva X', 'Archidona, Málaga', 'Clase 1', '1 a 3 horas', 55, 'Resumen', 'Detalle largo', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 12, 'Básica', false]);
  });
  it('rechaza vídeos que no son de YouTube o Vimeo', () => {
    expect(validate({ ...fromCatalog(item), videoUrl: 'https://evil.example/v' }).some((e) => e.includes('vídeo'))).toBe(true);
  });
});

import { sheetUrl as _sheetUrl, shortCodeFromParam as _scp } from './activitySheets';
describe('enlaces legibles de ficha', () => {
  it('usa nombre de la actividad y código corto', () => {
    expect(_sheetUrl('https://x.es/', 'f'.repeat(64), 'Cueva de la Higuera', 'ab23cd45ef')).toBe('https://x.es/ficha/cueva-de-la-higuera-ab23cd45ef');
  });
  it('extrae el código corto y acepta enlaces antiguos', () => {
    expect(_scp('cueva-de-la-higuera-ab23cd45ef')).toBe('ab23cd45ef');
    expect(_scp('a'.repeat(64))).toBeNull();
  });
});

import { fieldsFromSheet as _ffs, applyFieldsToSheet as _afs, sheetFromBase as _sfb, sheetBases as _sb } from './activitySheets';
import { fieldsFromSnapshot as _fsn, catalogKeyForEvent as _cke } from './activityFields';
describe('campos unificados', () => {
  it('ida y vuelta entre ficha privada y campos comunes', () => {
    const c = _sfb(_sb[0].id);
    const f = { ..._ffs(c), name: 'Nuevo', bring: ['Agua'] };
    const out = _afs(c, f);
    expect(out.title).toBe('Nuevo');
    expect(out.bring).toEqual(['Agua']);
  });
  it('la copia de la salida manda sobre el catálogo actual', () => {
    const base = _ffs(_sfb(_sb[0].id));
    const f = _fsn({ name: 'Copia', duration: '3 h' }, { ...base, name: 'Catálogo', duration: '5 h' }, 'Norma', null);
    expect(f.name).toBe('Copia'); expect(f.duration).toBe('3 h'); expect(f.rules).toBe('Norma');
  });
  it('clave de catálogo de ferratas', () => { expect(_cke('vias-ferratas', 'x')).toBe('ferratas:x'); });
  it('la foto propia viaja entre la ficha y los campos comunes', () => {
    const c = { ..._sfb(_sb[0].id), photo: 'storage:uploads/a.webp' };
    const f = _ffs(c);
    expect(f.imagePath).toBe('uploads/a.webp');
    expect(_afs(c, f).photo).toBe('storage:uploads/a.webp');
  });
  it('vaciar la foto quita la propia pero conserva la ilustrativa', () => {
    const propia = { ..._sfb(_sb[0].id), photo: 'storage:uploads/a.webp' };
    expect(_afs(propia, { ..._ffs(propia), imagePath: '' }).photo).toBeNull();
    const ilustrativa = { ..._sfb(_sb[0].id), photo: 'barranquismo-iniciacion' };
    expect(_afs(ilustrativa, { ..._ffs(ilustrativa), imagePath: '' }).photo).toBe('barranquismo-iniciacion');
  });
  it('la copia de la salida guarda la foto propia', () => {
    const base = _ffs(_sfb(_sb[0].id));
    const f = _fsn({ imagePath: 'uploads/b.webp' }, base, null, null);
    expect(f.imagePath).toBe('uploads/b.webp');
    const sin = _fsn({}, base, null, null);
    expect(sin.imagePath).toBe(base.imagePath);
  });
});
