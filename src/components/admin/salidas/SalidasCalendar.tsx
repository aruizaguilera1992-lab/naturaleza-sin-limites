import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Lock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { dayKey, groupByDay, monthCells, monthRange, type SalidaCalendarItem } from '@/lib/salidasCalendar';

const MONTH_FMT = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface EventRow { id: string; title: string; starts_at: string; capacity_total: number; seats_reserved: number; status: string }
interface SheetRow { id: string; content: { title?: string; date?: string; people?: number; customerName?: string }; accepted_at: string | null; booking_id: string | null }

/** Calendario interno de salidas confirmadas: grupos abiertos publicados y fichas privadas aceptadas. */
export function SalidasCalendar({ onOpenBooking, onManageOpen }: { onOpenBooking?: (bookingId: string) => void; onManageOpen?: () => void }) {
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [items, setItems] = useState<SalidaCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = monthRange(ym.y, ym.m);
    const [ev, sh] = await Promise.all([
      supabase.from('activity_events').select('id, title, starts_at, capacity_total, seats_reserved, status')
        .eq('status', 'publicada').gte('starts_at', from).lt('starts_at', to),
      supabase.from('activity_sheets').select('id, content, accepted_at, booking_id')
        .not('accepted_at', 'is', null).gte('content->>date', from).lt('content->>date', to),
    ]);
    const list: SalidaCalendarItem[] = [];
    for (const e of (ev.data ?? []) as EventRow[]) {
      list.push({ id: `ev-${e.id}`, kind: 'abierto', title: e.title, day: dayKey(new Date(e.starts_at)),
        detail: `${e.seats_reserved}/${e.capacity_total} plazas reservadas`, bookingId: null });
    }
    for (const s of (sh.data ?? []) as SheetRow[]) {
      const c = s.content ?? {};
      if (!c.date) continue;
      list.push({ id: `sh-${s.id}`, kind: 'privado', title: c.title ?? 'Salida privada', day: c.date,
        detail: `${c.people ?? '?'} ${c.people === 1 ? 'persona' : 'personas'}${c.customerName ? ` · ${c.customerName}` : ''}`, bookingId: s.booking_id });
    }
    setItems(list);
    setLoading(false);
  }, [ym]);

  useEffect(() => { load(); }, [load]);

  const cells = useMemo(() => monthCells(ym.y, ym.m), [ym]);
  const byDay = useMemo(() => groupByDay(items), [items]);
  const move = (delta: number) => { const d = new Date(ym.y, ym.m + delta, 1); setYm({ y: d.getFullYear(), m: d.getMonth() }); setSelected(null); };
  const selectedItems = selected ? byDay.get(selected) ?? [] : [];

  return (
    <section aria-label="Calendario de salidas confirmadas" className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold capitalize text-foreground"><CalendarDays className="h-5 w-5 text-primary" />{MONTH_FMT.format(new Date(ym.y, ym.m, 1))}</h3>
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="icon" aria-label="Mes anterior" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button type="button" variant="outline" size="icon" aria-label="Mes siguiente" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-muted-foreground">
        {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((c) => {
          const dayItems = byDay.get(c.key) ?? [];
          const isToday = c.key === dayKey(today);
          return (
            <button key={c.key} type="button" disabled={dayItems.length === 0} onClick={() => setSelected(c.key)}
              aria-label={`Día ${c.key}${dayItems.length ? `, ${dayItems.length} salidas` : ''}`}
              className={`flex min-h-12 flex-col items-center gap-1 rounded-lg border p-1 text-sm transition-all duration-300 ${dayItems.length ? 'active:scale-95 hover:border-primary/60' : 'cursor-default'} ${selected === c.key ? 'border-primary bg-primary/10' : 'border-border'} ${c.inMonth ? 'text-foreground' : 'text-muted-foreground/50'} ${isToday ? 'font-bold ring-1 ring-primary/50' : ''}`}>
              <span>{c.day}</span>
              {dayItems.length > 0 && (
                <span className="flex flex-wrap justify-center gap-0.5">
                  {dayItems.slice(0, 3).map((it) => <span key={it.id} className={`h-1.5 w-1.5 rounded-full ${it.kind === 'abierto' ? 'bg-primary' : 'bg-emerald-500'}`} />)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Grupo abierto</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Grupo privado aceptado</span>
      </p>
      {loading && <p className="mt-3 text-sm text-muted-foreground">Cargando salidas…</p>}
      {!loading && items.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No hay salidas confirmadas este mes.</p>}
      {selected && (
        <ul className="mt-4 space-y-2" aria-label={`Salidas del ${selected}`}>
          {selectedItems.map((it) => (
            <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                {it.kind === 'abierto' ? <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
                <div>
                  <p className="text-sm font-semibold text-foreground">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.kind === 'abierto' ? 'Grupo abierto' : 'Grupo privado'} · {it.detail}</p>
                </div>
              </div>
              {it.kind === 'abierto' && onManageOpen && <Button type="button" variant="outline" size="sm" onClick={onManageOpen}>Gestionar</Button>}
              {it.kind === 'privado' && it.bookingId && onOpenBooking && <Button type="button" variant="outline" size="sm" onClick={() => onOpenBooking(it.bookingId!)}>Ver reserva</Button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
