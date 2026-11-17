export const assistantFields = { summary: 'Descripción breve', includes: 'Incluye', bring: 'Qué llevar', requirements: 'Requisitos', notes: 'Notas', rules: 'Normas', steps: 'Pasos a seguir' } as const;
export type AssistantField = keyof typeof assistantFields;
export type OutingDraft = Partial<Record<AssistantField, string | null>> & { missing: string[] };
export function allowedDraft(value: unknown, fields: AssistantField[]): OutingDraft {
  if (!value || typeof value !== 'object') throw new Error('Propuesta no válida');
  const data = value as Record<string, unknown>;
  const result: OutingDraft = { missing: Array.isArray(data.missing) ? data.missing.filter((x): x is string => typeof x === 'string').slice(0, 15) : [] };
  for (const field of fields) if (typeof data[field] === 'string') result[field] = data[field].slice(0, 3000);
  return result;
}