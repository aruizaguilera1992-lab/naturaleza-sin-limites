import { describe, expect, it } from 'vitest';
import { allowedDraft } from './outingAssistant';
describe('outing assistant safe application', () => {
  it('applies only selected editorial fields, never price, date, capacity or photos', () => {
    expect(allowedDraft({ summary: 'Texto', rules: 'Norma', pricePerPersonEuros: 1, date: '2099-01-01', people: 99, photo: 'inventada', missing: [] }, ['summary'])).toEqual({ summary: 'Texto', missing: [] });
  });
  it('preserves multiline text and omits missing data instead of inventing it', () => {
    expect(allowedDraft({ includes: 'Casco\nArnés', duration: '4h', rules: null, missing: ['Punto de encuentro'] }, ['includes','rules'])).toEqual({ includes: 'Casco\nArnés', missing: ['Punto de encuentro'] });
  });
});