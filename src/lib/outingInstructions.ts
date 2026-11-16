/** Keeps the admin's ordering; blank lines are not customer-facing items. */
export function instructionLines(text: string | null | undefined): string[] {
  return (text ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}