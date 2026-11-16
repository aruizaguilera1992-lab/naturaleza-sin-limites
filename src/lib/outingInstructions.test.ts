import { describe, expect, it } from 'vitest';
import { instructionLines } from './outingInstructions';

describe('outing instructions', () => {
  it('preserves separate instructions and their order after Enter', () => {
    expect(instructionLines('Primero\n\nSegundo\r\n Tercero ')).toEqual(['Primero', 'Segundo', 'Tercero']);
  });
  it('keeps existing outings without instructions compatible', () => {
    expect(instructionLines(undefined)).toEqual([]);
    expect(instructionLines(null)).toEqual([]);
  });
});