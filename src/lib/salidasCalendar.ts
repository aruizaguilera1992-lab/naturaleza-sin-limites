/** Utilidades del calendario interno de Salidas (panel de administración). */

export interface CalendarDay { key: string; day: number; inMonth: boolean }

/** Clave local YYYY-MM-DD (sin zona horaria, para casar con las fechas de las fichas). */
export function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 42 celdas (6 semanas) empezando en lunes para el mes indicado (month: 0-11). */
export function monthCells(year: number, month: number): CalendarDay[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { key: dayKey(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

export interface SalidaCalendarItem {
  id: string;
  kind: 'abierto' | 'privado';
  title: string;
  /** Clave de día YYYY-MM-DD. */
  day: string;
  detail: string;
  bookingId: string | null;
}

/** Agrupa salidas por día, ordenadas: primero grupos abiertos, luego privadas. */
export function groupByDay(items: SalidaCalendarItem[]): Map<string, SalidaCalendarItem[]> {
  const map = new Map<string, SalidaCalendarItem[]>();
  for (const it of [...items].sort((a, b) => (a.kind === b.kind ? a.title.localeCompare(b.title, 'es') : a.kind === 'abierto' ? -1 : 1))) {
    const list = map.get(it.day) ?? [];
    list.push(it);
    map.set(it.day, list);
  }
  return map;
}

/** Rango [desde, hasta) en claves de día para consultar un mes completo. */
export function monthRange(year: number, month: number): { from: string; to: string } {
  return { from: dayKey(new Date(year, month, 1)), to: dayKey(new Date(year, month + 1, 1)) };
}
