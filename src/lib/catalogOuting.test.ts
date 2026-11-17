import { describe, expect, it } from 'vitest';
import { openGroupKeyFor } from './catalogOuting';

const keys = ['barranquismo|guadalmina', 'vias-ferratas|ferrata-teba'];
describe('openGroupKeyFor', () => {
  it('maps an identical canyon product', () => expect(openGroupKeyFor({ key: 'barranquismo:guadalmina', discipline: 'barranquismo' }, keys)).toBe('barranquismo|guadalmina'));
  it('maps ferratas to the vias-ferratas category', () => expect(openGroupKeyFor({ key: 'ferratas:ferrata-teba', discipline: 'ferratas' }, keys)).toBe('vias-ferratas|ferrata-teba'));
  it('does not map a partial canyon section', () => expect(openGroupKeyFor({ key: 'barranquismo:zarzalones-inferior', discipline: 'barranquismo' }, keys)).toBeNull());
  it('never maps documentary references', () => expect(openGroupKeyFor({ key: 'barranquismo:guadalmina', discipline: 'barranquismo', reference: true }, keys)).toBeNull());
});
describe('espeleología open groups', () => {
  it('maps a cave level to its espeleologia product', () => expect(openGroupKeyFor({ key: 'espeleologia:iniciacion', discipline: 'espeleologia' }, ['espeleologia|iniciacion'])).toBe('espeleologia|iniciacion'));
});
