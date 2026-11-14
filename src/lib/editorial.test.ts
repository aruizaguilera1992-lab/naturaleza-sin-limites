import { describe, it, expect } from 'vitest';
import { blogPosts } from '@/data/blogPosts';
import { emptyPiece, validatePiece, mergeBlogPosts, safeInlineMarkdown } from './editorial';

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
});