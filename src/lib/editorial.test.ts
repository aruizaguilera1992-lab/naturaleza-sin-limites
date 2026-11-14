import { describe, it, expect } from 'vitest';
import { blogPosts } from '@/data/blogPosts';
import { emptyPiece, validatePiece, mergeBlogPosts, safeInlineMarkdown, parseSafeImageMarkdown } from './editorial';

describe('Editorial publication rules', () => {
  it('rejects a reserved existing article address', () => {
    expect(validatePiece({ ...emptyPiece(), slug: blogPosts[0].slug })).toBe('Esta dirección pertenece a un artículo existente.');
  });
  it('keeps existing articles unchanged on a duplicate slug', () => {
    const replacement = { ...blogPosts[0], title: 'Different content' };
    expect(mergeBlogPosts(blogPosts, [replacement])).toEqual(blogPosts);
  });
  it('allows incomplete drafts but not publications', () => {
    const draft = { ...emptyPiece(), slug: 'prueba-editorial' };
    expect(validatePiece(draft)).toBeNull();
    expect(validatePiece(draft, true)).not.toBeNull();
  });
  it('requires a safe supplied image address', () => {
    expect(validatePiece({ ...emptyPiece(), slug: 'prueba', featured_image: 'javascript:alert(1)' })).not.toBeNull();
    expect(validatePiece({ ...emptyPiece(), slug: 'prueba', featured_image: '/images/foto.webp' })).toBeNull();
  });
  it('renders user content without executable HTML', () => {
    const value = safeInlineMarkdown('<img src=x onerror=alert(1)> **seguridad**');
    expect(value).not.toContain('<img');
    expect(value).toContain('&lt;img');
    expect(value).toContain('<strong');
  });
  it('renders internal links as same-tab anchors', () => {
    const value = safeInlineMarkdown('Ver [la guía de barrancos](/blog/guia-barrancos) antes de salir.');
    expect(value).toContain('<a href="/blog/guia-barrancos"');
    expect(value).toContain('>la guía de barrancos</a>');
    expect(value).not.toContain('target="_blank"');
  });
  it('renders external https links with safe attributes', () => {
    const value = safeInlineMarkdown('Más en [Infobarrancos](https://infobarrancos.com/fichas).');
    expect(value).toContain('<a href="https://infobarrancos.com/fichas" target="_blank" rel="noopener noreferrer"');
    expect(value).toContain('>Infobarrancos</a>');
  });
  it('never turns disallowed protocols into links', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,x', 'http://inseguro.es', '//protocolo-relativo.es']) {
      const value = safeInlineMarkdown(`[pulsa aquí](${url})`);
      expect(value).not.toContain('<a href');
      expect(value).toContain('[pulsa aquí]');
    }
  });
  it('parses a valid local image line', () => {
    expect(parseSafeImageMarkdown('![Descenso del río Verde](/images/barrancos/rio-verde.webp)')).toEqual({
      src: '/images/barrancos/rio-verde.webp',
      alt: 'Descenso del río Verde',
    });
    expect(parseSafeImageMarkdown('![Foto](/images/foto.JPEG)')).toEqual({ src: '/images/foto.JPEG', alt: 'Foto' });
  });
  it('rejects path traversal in image lines', () => {
    expect(parseSafeImageMarkdown('![x](/images/../secret.jpg)')).toBeNull();
    expect(parseSafeImageMarkdown('![x](/images//doble.jpg)')).toBeNull();
  });
  it('rejects external protocols and URLs in image lines', () => {
    expect(parseSafeImageMarkdown('![x](javascript:alert(1))')).toBeNull();
    expect(parseSafeImageMarkdown('![x](https://externo.es/foto.jpg)')).toBeNull();
    expect(parseSafeImageMarkdown('![x](//externo.es/foto.jpg)')).toBeNull();
  });
  it('rejects disallowed extensions and attributes in image lines', () => {
    expect(parseSafeImageMarkdown('![x](/images/foto.gif)')).toBeNull();
    expect(parseSafeImageMarkdown('![x](/images/foto.svg)')).toBeNull();
    expect(parseSafeImageMarkdown('![x](/images/foto.jpg "título")')).toBeNull();
    expect(parseSafeImageMarkdown('texto antes ![x](/images/foto.jpg)')).toBeNull();
  });
});