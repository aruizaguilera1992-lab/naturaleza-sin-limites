export const VERTIGO_ASSESSMENT_KEY = 'nsl-vertigo-assessment';
export const VERTIGO_ASSESSMENT_EVENT = 'nsl:vertigo-assessment';

export type VertigoAssessment = {
  disciplina: string;
  limitacion: string;
  disponibilidad: string;
};

export const emptyAssessment: VertigoAssessment = {
  disciplina: '',
  limitacion: '',
  disponibilidad: '',
};

export function readVertigoAssessment(): VertigoAssessment {
  if (typeof window === 'undefined') return emptyAssessment;

  try {
    const saved = window.localStorage.getItem(VERTIGO_ASSESSMENT_KEY);
    if (!saved) return emptyAssessment;
    const parsed = JSON.parse(saved) as Partial<VertigoAssessment>;
    return {
      disciplina: typeof parsed.disciplina === 'string' ? parsed.disciplina : '',
      limitacion: typeof parsed.limitacion === 'string' ? parsed.limitacion : '',
      disponibilidad: typeof parsed.disponibilidad === 'string' ? parsed.disponibilidad : '',
    };
  } catch {
    return emptyAssessment;
  }
}

export function saveVertigoAssessment(value: VertigoAssessment) {
  window.localStorage.setItem(VERTIGO_ASSESSMENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(VERTIGO_ASSESSMENT_EVENT, { detail: value }));
}