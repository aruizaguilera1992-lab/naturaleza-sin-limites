import { blogPosts, categoryLabels, type BlogCategory, type BlogPost } from '@/data/blogPosts';

export type PublicationStatus = 'borrador' | 'publicado' | 'retirado';
export interface EditorialPiece {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: BlogCategory;
  tags: string[];
  author_name: string;
  author_bio: string;
  meta_title: string;
  meta_description: string;
  updated_at?: string;
  published_at?: string | null;
  status?: PublicationStatus;
}

export const emptyPiece = (): EditorialPiece => ({
  title: '', slug: '', excerpt: '', content: '', featured_image: '',
  category: 'tecnicas-seguridad', tags: [], author_name: '', author_bio: '',
  meta_title: '', meta_description: '',
});

export function validatePiece(piece: EditorialPiece, publish = false): string | null {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(piece.slug)) return 'Introduce una dirección con letras minúsculas, números y guiones.';
  if (blogPosts.some(post => post.slug === piece.slug)) return 'Esta dirección pertenece a un artículo existente.';
  if (!(piece.category in categoryLabels)) return 'Selecciona una categoría válida.';
  if (piece.featured_image && !/^(https:\/\/[^\s]+|\/images\/[^\s]+)$/.test(piece.featured_image)) return 'La imagen debe tener una dirección HTTPS o /images/.';
  if (publish && ['title', 'excerpt', 'content', 'featured_image', 'author_name', 'meta_title', 'meta_description'].some(key => !String(piece[key as keyof EditorialPiece] ?? '').trim())) {
    return 'Completa título, extracto, contenido, imagen, autor y SEO antes de publicar.';
  }
  return null;
}

export function pieceToPost(piece: EditorialPiece): BlogPost {
  return {
    id: `editorial-${piece.id ?? 'preview'}`, title: piece.title, slug: piece.slug,
    excerpt: piece.excerpt, content: piece.content, featuredImage: piece.featured_image,
    category: piece.category, tags: piece.tags,
    author: { name: piece.author_name, bio: piece.author_bio, avatar: '', socialLinks: {} },
    publishedAt: piece.published_at ?? new Date().toISOString(),
    readTime: Math.max(1, Math.ceil(piece.content.trim().split(/\s+/).length / 200)),
    seo: { metaTitle: piece.meta_title, metaDescription: piece.meta_description, ogImage: piece.featured_image },
  };
}

export function mergeBlogPosts(local: BlogPost[], remote: BlogPost[]): BlogPost[] {
  const reserved = new Set(local.map(post => post.slug));
  return [...local, ...remote.filter(post => !reserved.has(post.slug))];
}

// Escape HTML before adding the limited formatting supported by the existing blog.
// Links: internal paths must start with / (never //), external only https:// with
// target="_blank" rel="noopener noreferrer". Any other protocol stays escaped text.
const CODE_CLASS = 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono';
function inlineFormat(escaped: string): string {
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, `<code class="${CODE_CLASS}">$1</code>`);
}
export function safeInlineMarkdown(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return escaped
    .replace(/\[([^\]]+)\]\((\/[^\s)]*|https:\/\/[^\s)]+)\)/g, (match, label: string, url: string) => {
      if (url.startsWith('//')) return match;
      const external = url.startsWith('https://');
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}"${attrs} class="text-primary underline underline-offset-2 hover:opacity-80">${inlineFormat(label)}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, `<code class="${CODE_CLASS}">$1</code>`);
}