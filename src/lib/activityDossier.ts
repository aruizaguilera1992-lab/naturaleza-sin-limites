export interface ScheduleItem { time: string; label: string }
export interface DossierContent { schedule: ScheduleItem[]; needs: string[]; rules: string[]; canyoning: boolean; notes?: string }
export interface DossierParticipant {
  fullName: string; docId: string; birthDate: string; phone: string;
  emergencyName: string; emergencyPhone: string; health?: string;
  heightCm?: number | null; weightKg?: number | null; chestCm?: number | null; waistCm?: number | null; hipCm?: number | null; footEu?: number | null;
  wetsuitSize?: string | null; bootieSize?: string | null;
}
export type SizeRow = { size: string; heightMin: number; heightMax: number; chestMin?: number; chestMax?: number };
export type BootieRow = { size: string; footMin: number; footMax: number };

/** Official SELAND tables: intentionally empty until the owner provides them — sizes are never invented. */
export const SELAND_WETSUIT: SizeRow[] = [];
export const SELAND_BOOTIES: BootieRow[] = [];

export function suggestWetsuit(p: Pick<DossierParticipant, 'heightCm' | 'chestCm'>, table: SizeRow[] = SELAND_WETSUIT): string | null {
  if (!p.heightCm) return null;
  const r = table.find((t) => p.heightCm! >= t.heightMin && p.heightCm! <= t.heightMax && (p.chestCm == null || t.chestMin == null || (p.chestCm >= t.chestMin && p.chestCm <= (t.chestMax ?? Infinity))));
  return r?.size ?? null;
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
