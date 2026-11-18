import { assert, assertStringIncludes } from 'jsr:@std/assert@1';
import { renderActivitySheetEmail } from './activitySheetEmail.ts';
Deno.test('escapa datos del cliente y muestra total', () => {
  const h = renderActivitySheetEmail({ title: '<b>x</b>', customerName: 'Ana', people: 3, pricePerPersonEuros: 50, discipline: 'barranquismo' }, 'https://a.es/ficha/t', 'https://a.es', null);
  assert(!h.includes('<b>x</b>'));
  assertStringIncludes(h, '150');
});
Deno.test('sin fecha cerrada muestra «A acordar contigo»', () => {
  const h = renderActivitySheetEmail({ title: 'Barranco', customerName: 'Ana', people: 2, pricePerPersonEuros: 50, discipline: 'barranquismo', date: '' }, 'https://a.es/ficha/t', 'https://a.es', null);
  assertStringIncludes(h, 'A acordar contigo');
  const conFecha = renderActivitySheetEmail({ title: 'Barranco', customerName: 'Ana', people: 2, pricePerPersonEuros: 50, discipline: 'barranquismo', date: '2026-12-05' }, 'https://a.es/ficha/t', 'https://a.es', null);
  assert(!conFecha.includes('A acordar contigo'));
});
