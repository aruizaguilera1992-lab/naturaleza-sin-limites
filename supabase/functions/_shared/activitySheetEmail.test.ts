import { assert, assertStringIncludes } from 'jsr:@std/assert@1';
import { renderActivitySheetEmail } from './activitySheetEmail.ts';
Deno.test('escapa datos del cliente y muestra total', () => {
  const h = renderActivitySheetEmail({ title: '<b>x</b>', customerName: 'Ana', people: 3, pricePerPersonEuros: 50, discipline: 'barranquismo' }, 'https://a.es/ficha/t', 'https://a.es', null);
  assert(!h.includes('<b>x</b>'));
  assertStringIncludes(h, '150');
});
