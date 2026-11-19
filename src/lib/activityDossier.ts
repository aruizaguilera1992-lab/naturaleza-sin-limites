export interface ScheduleItem { time: string; label: string }
export interface DossierContent { schedule: ScheduleItem[]; needs: string[]; rules: string[]; canyoning: boolean; notes?: string; extras?: string[] }
export interface DossierParticipant {
  fullName: string; docId: string; birthDate: string; phone: string;
  emergencyName: string; emergencyPhone: string; health?: string;
  sizeGroup?: 'nino' | 'hombre' | 'mujer' | ''; heightCm?: number | null; weightKg?: number | null; chestCm?: number | null; waistCm?: number | null; hipCm?: number | null; footEu?: number | null;
  wetsuitSize?: string | null; bootieSize?: string | null;
  extras?: string[]; extrasNote?: string;
}
export type SizeRow = { group: 'nino' | 'hombre' | 'mujer'; size: string; heightMin: number; heightMax: number; weightMin: number; weightMax: number };
export type BootieRow = { size: string; footMin: number; footMax: number };

/** Official SELAND wetsuit chart (owner-provided). */
export const SELAND_WETSUIT: SizeRow[] = [
  { group: 'nino', size: 'C2', heightMin: 108, heightMax: 115, weightMin: 13, weightMax: 18 },
  { group: 'nino', size: 'C3', heightMin: 112, heightMax: 119, weightMin: 16, weightMax: 23 },
  { group: 'nino', size: 'C4', heightMin: 118, heightMax: 127, weightMin: 20, weightMax: 27 },
  { group: 'nino', size: 'C5', heightMin: 126, heightMax: 136, weightMin: 25, weightMax: 32 },
  { group: 'nino', size: 'C6', heightMin: 135, heightMax: 148, weightMin: 30, weightMax: 37 },
  { group: 'nino', size: '3XS', heightMin: 146, heightMax: 154, weightMin: 35, weightMax: 42 },
  { group: 'nino', size: '2XS', heightMin: 152, heightMax: 158, weightMin: 40, weightMax: 47 },
  { group: 'nino', size: 'XS', heightMin: 156, heightMax: 162, weightMin: 45, weightMax: 57 },
  { group: 'hombre', size: 'S', heightMin: 160, heightMax: 170, weightMin: 55, weightMax: 65 },
  { group: 'hombre', size: 'ST*', heightMin: 168, heightMax: 175, weightMin: 55, weightMax: 65 },
  { group: 'hombre', size: 'M', heightMin: 168, heightMax: 175, weightMin: 62, weightMax: 75 },
  { group: 'hombre', size: 'MT*', heightMin: 173, heightMax: 180, weightMin: 62, weightMax: 75 },
  { group: 'hombre', size: 'L', heightMin: 173, heightMax: 180, weightMin: 72, weightMax: 85 },
  { group: 'hombre', size: 'LT*', heightMin: 178, heightMax: 186, weightMin: 72, weightMax: 85 },
  { group: 'hombre', size: 'XL', heightMin: 178, heightMax: 186, weightMin: 82, weightMax: 95 },
  { group: 'hombre', size: '2XL', heightMin: 185, heightMax: 195, weightMin: 92, weightMax: 105 },
  { group: 'hombre', size: '3XL', heightMin: 185, heightMax: 195, weightMin: 100, weightMax: 110 },
  { group: 'hombre', size: '4XL', heightMin: 185, heightMax: 195, weightMin: 105, weightMax: 115 },
  { group: 'hombre', size: '5XL', heightMin: 185, heightMax: 195, weightMin: 110, weightMax: 120 },
  { group: 'mujer', size: '2XS', heightMin: 142, heightMax: 155, weightMin: 35, weightMax: 40 },
  { group: 'mujer', size: 'XS', heightMin: 150, heightMax: 160, weightMin: 40, weightMax: 48 },
  { group: 'mujer', size: 'S', heightMin: 158, heightMax: 165, weightMin: 48, weightMax: 56 },
  { group: 'mujer', size: 'ST*', heightMin: 162, heightMax: 170, weightMin: 48, weightMax: 56 },
  { group: 'mujer', size: 'SW**', heightMin: 158, heightMax: 165, weightMin: 56, weightMax: 62 },
  { group: 'mujer', size: 'M', heightMin: 162, heightMax: 170, weightMin: 56, weightMax: 62 },
  { group: 'mujer', size: 'MT*', heightMin: 167, heightMax: 175, weightMin: 56, weightMax: 62 },
  { group: 'mujer', size: 'MW**', heightMin: 162, heightMax: 170, weightMin: 62, weightMax: 70 },
  { group: 'mujer', size: 'M2W**', heightMin: 162, heightMax: 170, weightMin: 74, weightMax: 85 },
  { group: 'mujer', size: 'L', heightMin: 167, heightMax: 175, weightMin: 62, weightMax: 70 },
  { group: 'mujer', size: 'LW**', heightMin: 167, heightMax: 175, weightMin: 70, weightMax: 80 },
  { group: 'mujer', size: 'XL', heightMin: 170, heightMax: 180, weightMin: 70, weightMax: 80 },
  { group: 'mujer', size: '2XL**', heightMin: 180, heightMax: 185, weightMin: 75, weightMax: 85 },
  { group: 'mujer', size: '3XL**', heightMin: 180, heightMax: 185, weightMin: 80, weightMax: 90 },
];
/** Official SELAND bootie (escarpín) chart, verified against seland.com and the 2024 canyoning catalog. Overlaps resolve to the first size listed. */
export const SELAND_BOOTIES: BootieRow[] = [
  { size: '3XS', footMin: 34, footMax: 35 },
  { size: '2XS', footMin: 35, footMax: 36 },
  { size: 'XS', footMin: 37, footMax: 38 },
  { size: 'S', footMin: 39, footMax: 40 },
  { size: 'M', footMin: 41, footMax: 42 },
  { size: 'L', footMin: 43, footMax: 44 },
  { size: 'XL', footMin: 45, footMax: 46 },
  { size: '2XL', footMin: 47, footMax: 48 },
];

export function suggestWetsuit(p: Pick<DossierParticipant, 'heightCm' | 'weightKg' | 'sizeGroup'>, table: SizeRow[] = SELAND_WETSUIT): string | null {
  if (!p.heightCm || !p.weightKg || !p.sizeGroup) return null;
  return table.find((t) => t.group === p.sizeGroup && p.heightCm! >= t.heightMin && p.heightCm! <= t.heightMax && p.weightKg! >= t.weightMin && p.weightKg! <= t.weightMax)?.size ?? null;
}
export function suggestBootie(foot: number | null | undefined, table: BootieRow[] = SELAND_BOOTIES): string | null {
  if (!foot) return null;
  return table.find((t) => foot >= t.footMin && foot <= t.footMax)?.size ?? null;
}

export const isCanyoning = (activity: string) => /barran|cañon|canyon/i.test(activity);
export const lines = (s: string | null | undefined) => (s ?? '').split('\n').map((l) => l.trim()).filter(Boolean);

export function defaultDossier(activity: string, rules?: string | null): DossierContent {
  const canyoning = isCanyoning(activity);
  return {
    canyoning,
    schedule: [{ time: '09:00', label: 'Quedada en el punto de encuentro' }, { time: '09:30', label: 'Aproximación' }, { time: '10:00', label: 'Actividad' }, { time: '14:00', label: 'Regreso' }],
    needs: canyoning ? ['Bañador y camiseta técnica', 'Calzado de montaña o deportivo', 'Agua y algo de comida', 'Toalla y ropa de cambio'] : ['Ropa deportiva cómoda', 'Calzado de montaña', 'Agua y algo de comida'],
    rules: lines(rules).length ? lines(rules) : ['Seguir en todo momento las indicaciones del guía', 'Usar el material de seguridad facilitado', 'Informar de cualquier problema de salud relevante'],
  };
}

const DOC = /^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z0-9]{6,12})$/i;
export function participantErrors(p: DossierParticipant): string[] {
  const e: string[] = [];
  if (p.fullName.trim().length < 3) e.push('Nombre y apellidos');
  if (!DOC.test(p.docId.trim())) e.push('DNI/NIE o pasaporte');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) e.push('Fecha de nacimiento');
  if (p.phone.replace(/\D/g, '').length < 9) e.push('Teléfono');
  if (p.emergencyName.trim().length < 2) e.push('Contacto de emergencia');
  if (p.emergencyPhone.replace(/\D/g, '').length < 9) e.push('Teléfono de emergencia');
  return e;
}

export function whatsappDossierText(name: string | null, activity: string, link: string) {
  return `Hola${name ? ` ${name}` : ''}, aquí tienes los pasos a seguir para ${activity}: cronograma, qué necesitas, normas y el registro para el seguro. Complétalo aquí: ${link}`;
}

/** Optional rental/extra items the customer can request in the dossier. */
export const EXTRA_OPTIONS = ['Mochila', 'Bote estanco', 'Bolsa estanca', 'Cuerda auxiliar', 'Linterna frontal', 'Guantes'];

export interface DossierSource { title?: string | null; duration?: string | null; meetingPoint?: string | null; startsAt?: string | null; steps?: string | null; rules?: string | null; bring?: string[] | null; includes?: string[] | null }

/** Fills schedule, needs and rules from the confirmed outing (and its catalog data); keeps admin-chosen extras. */
export function syncDossier(base: DossierContent, src: DossierSource): DossierContent {
  const steps = lines(src.steps);
  const start = src.startsAt ? new Date(src.startsAt) : null;
  const t0 = start && !Number.isNaN(start.getTime()) ? start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid' }) : '';
  const meeting = src.meetingPoint?.trim() ? `Quedada en el punto de encuentro: ${src.meetingPoint.trim()}` : null;
  const schedule = steps.length
    ? [...(meeting ? [{ time: t0, label: meeting }] : []), ...steps.map((label, i) => ({ time: i === 0 && !meeting ? t0 : '', label: label.replace(/^[-•\d.)\s]+/, '') || label }))]
    : base.schedule.map((s, i) => (i === 0 && meeting ? { time: t0 || s.time, label: meeting } : s));
  const bring = (src.bring ?? []).map((x) => x.trim()).filter(Boolean);
  const rules = lines(src.rules);
  const notes = [src.duration?.trim() && `Duración: ${src.duration.trim()}`, src.includes?.length ? `Incluido: ${src.includes.join(', ')}` : ''].filter(Boolean).join('\n');
  return { ...base, schedule, needs: bring.length ? bring : base.needs, rules: rules.length ? rules : base.rules, notes: notes || base.notes };
}
