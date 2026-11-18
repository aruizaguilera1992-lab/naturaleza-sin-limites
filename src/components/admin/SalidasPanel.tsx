import { useEffect, useState } from 'react';
import { CalendarDays, Lock, Users } from 'lucide-react';
import { EventsPanel } from '@/components/admin/EventsPanel';
import { ActivitySheetsPanel, type SheetContact } from '@/components/admin/sheets/ActivitySheetsPanel';
import { SalidasCalendar } from '@/components/admin/salidas/SalidasCalendar';
import { useAdminCatalog } from '@/lib/adminCatalog';
import type { SheetRequestPrefill } from '@/lib/activitySheets';

import type { CatalogOutingStart, OutingMode } from '@/lib/catalogOuting';
type Mode = OutingMode | 'calendario';
const MODES: { id: Mode; label: string; hint: string; icon: typeof Users }[] = [
  { id: 'calendario', label: 'Calendario', hint: 'Vista mensual de las salidas confirmadas, abiertas y privadas.', icon: CalendarDays },
  { id: 'abierto', label: 'Grupo abierto', hint: 'Sale en el calendario público y se reserva con señal del 30 %.', icon: Users },
  { id: 'privado', label: 'Grupo privado', hint: 'Ficha exclusiva para un cliente, enviada por enlace único.', icon: Lock },
];

/** Salidas unificadas: grupo abierto (calendario) y grupo privado (ficha con enlace). Ambos se mantienen montados. */
export function SalidasPanel({ contacts, focusSheetId, onOpenBooking, prefill, catalogStart }: { catalogStart?: CatalogOutingStart | null; prefill?: SheetRequestPrefill | null; contacts: SheetContact[]; focusSheetId?: string | null; onOpenBooking?: (bookingId: string) => void }) {
  const { items: catalog } = useAdminCatalog();
  const [mode, setMode] = useState<Mode>(focusSheetId || prefill ? 'privado' : 'calendario');
  useEffect(() => { if (focusSheetId) setMode('privado'); }, [focusSheetId]);
  useEffect(() => { if (prefill) setMode('privado'); }, [prefill]);
  useEffect(() => { if (catalogStart) setMode(catalogStart.mode); }, [catalogStart]);
  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Tipo de salida" className="grid gap-3 sm:grid-cols-3">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300 active:scale-95 ${mode === m.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
            <m.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span><span className="block font-heading font-bold text-foreground">{m.label}</span><span className="block text-sm text-muted-foreground">{m.hint}</span></span>
          </button>
        ))}
      </div>
      {mode === 'calendario' && <SalidasCalendar onOpenBooking={onOpenBooking} onManageOpen={() => setMode('abierto')} />}
      <div className={mode === 'abierto' ? '' : 'hidden'}><EventsPanel catalogStart={catalogStart} /></div>
      <div className={mode === 'privado' ? '' : 'hidden'}><ActivitySheetsPanel contacts={contacts} catalog={catalog} focusSheetId={focusSheetId} prefill={prefill} catalogStart={catalogStart} onOpenBooking={onOpenBooking} /></div>
    </div>
  );
}
