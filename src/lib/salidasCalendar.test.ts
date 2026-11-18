import { describe, it, expect } from 'vitest';
import { dayKey, monthCells, monthRange, groupByDay, type SalidaCalendarItem } from './salidasCalendar';

describe('salidas calendar', () => {
  it('genera 42 celdas empezando en lunes y marca las del mes', () => {
    const cells = monthCells(2026, 10); // noviembre 2026 empieza en domingo
    expect(cells).toHaveLength(42);
    expect(cells[0].key).toBe('2026-10-26'); // lunes anterior
    expect(cells[0].inMonth).toBe(false);
    expect(cells.find((c) => c.key === '2026-11-01')?.inMonth).toBe(true);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });
  it('el rango del mes cubre del día 1 al primero del mes siguiente', () => {
    expect(monthRange(2026, 10)).toEqual({ from: '2026-11-01', to: '2026-12-01' });
    expect(monthRange(2026, 11)).toEqual({ from: '2026-12-01', to: '2027-01-01' });
  });
  it('agrupa por día con los grupos abiertos primero', () => {
    const items: SalidaCalendarItem[] = [
      { id: '1', kind: 'privado', title: 'Ficha Ana', day: '2026-11-05', detail: '', bookingId: null },
      { id: '2', kind: 'abierto', title: 'Espeleología', day: '2026-11-05', detail: '', bookingId: null },
      { id: '3', kind: 'abierto', title: 'Barranco', day: '2026-11-12', detail: '', bookingId: null },
    ];
    const g = groupByDay(items);
    expect(g.get('2026-11-05')?.map((i) => i.kind)).toEqual(['abierto', 'privado']);
    expect(g.get('2026-11-12')).toHaveLength(1);
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
