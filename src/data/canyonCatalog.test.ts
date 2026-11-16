import { describe, expect, it } from 'vitest';
import { canyonCatalog, canyonCatalogLinks, filterCanyonCatalog } from './canyonCatalog';

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe('canyonCatalog', () => {
  it('muestra solo los 9 recorridos acordados de Málaga y Granada', () => {
    expect(ids(canyonCatalog)).toEqual([
      'guadalmina', 'sima-diablo', 'zarzalones-inferior', 'jorox', 'puerto-ramos',
      'rio-verde-inferior', 'rio-lentegi', 'buitre-inferior', 'magdalena-final',
    ]);
  });

  it('excluye Luna, Picapedreros, Pastelero y Castillejos', () => {
    const text = canyonCatalog.map((c) => `${c.id} ${c.nombre}`).join(' ').toLowerCase();
    for (const banned of ['luna', 'picapedreros', 'pastelero', 'castillejos']) {
      expect(text).not.toContain(banned);
    }
  });

  it('filtra por provincia y nivel', () => {
    expect(filterCanyonCatalog(canyonCatalog, 'Granada', 'intermedio').map((c) => c.id)).toEqual([
      'rio-lentegi', 'buitre-inferior', 'magdalena-final',
    ]);
    expect(filterCanyonCatalog(canyonCatalog, 'Málaga', 'iniciacion')).toHaveLength(5);
    expect(filterCanyonCatalog(canyonCatalog, 'Málaga', 'intermedio')).toHaveLength(0);
    expect(filterCanyonCatalog(canyonCatalog, 'todas', 'todos')).toHaveLength(9);
  });

  it('solo los productos existentes idénticos conservan precio y reserva', () => {
    const priced = canyonCatalog.filter((c) => c.precio).map((c) => [c.id, c.precio]);
    expect(priced).toEqual([
      ['guadalmina', '35€'], ['sima-diablo', '40€'], ['jorox', '45€'], ['rio-lentegi', '45€'],
    ]);
    for (const c of canyonCatalog) {
      const { reserva } = canyonCatalogLinks(c);
      if (c.productoExistenteId) expect(reserva).toBe(`/reservar/barranquismo/${c.productoExistenteId}`);
      else {
        expect(reserva).toBeNull();
        expect(c.precio).toBeNull();
        expect(c.pendienteValidacion).toBe(true);
      }
    }
  });

  it('Jorox y Puerto Ramos avisan de la exposición a altura', () => {
    for (const id of ['jorox', 'puerto-ramos']) {
      expect(canyonCatalog.find((c) => c.id === id)?.avisoAltura).toMatch(/altura/);
    }
  });
});

import { getActivityProfile } from './activityProfiles';

describe('fichas enlazadas desde el catálogo', () => {
  it('Lentegí es intermedio y no se anuncia como iniciación', () => {
    const p = getActivityProfile('barranquismo', 'rio-lentegi')!;
    expect(p.experienceLevel).toBe('Intermedio');
    expect(p.technicalLevel).toBe('V2 A3 II');
    expect(JSON.stringify(p).toLowerCase()).not.toContain('perfecto para iniciación');
  });

  it('las cuatro fichas enlazadas no muestran fotografía hasta verificarla', () => {
    for (const slug of ['guadalmina', 'sima-diablo', 'jorox', 'rio-lentegi']) {
      expect(getActivityProfile('barranquismo', slug)?.photoPending).toBe(true);
    }
  });
});
