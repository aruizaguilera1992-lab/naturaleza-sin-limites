/// <reference types="node" />
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { depositIntentId } from './depositIntent';
beforeEach(() => { sessionStorage.clear(); vi.stubGlobal('crypto', webcrypto); });
afterEach(() => vi.unstubAllGlobals());
it('retains the same intent across retries and module reloads without storing personal data', async () => {
  const body = { eventId: 'fixture', email: 'fixture@example.test', participants: 2 };
  const first = await depositIntentId(body);
  expect(await depositIntentId(body)).toBe(first);
  vi.resetModules();
  const reloaded = await import('./depositIntent');
  expect(await reloaded.depositIntentId(body)).toBe(first);
  expect(sessionStorage.getItem('nsl-deposit-intent:fixture')).not.toContain(body.email);
  expect(await depositIntentId({ ...body, participants: 3 })).not.toBe(first);
});
it('does not submit an unstable key when storage cannot persist it', async () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('storage unavailable'); });
  await expect(depositIntentId({ eventId: 'fixture' })).rejects.toThrow('storage unavailable');
  spy.mockRestore();
});
