import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { blogPosts } from "@/data/blogPosts";

export default defineTool({
  name: "list_blog_posts",
  title: "Listar artículos del blog",
  description: "Lista los artículos del blog con filtros opcionales por categoría y texto de búsqueda.",
  inputSchema: {
    category: z.string().optional().describe("Categoría del artículo."),
    search: z.string().optional().describe("Texto a buscar en título, extracto o etiquetas."),
    limit: z.number().int().min(1).max(50).default(10).describe("Número máximo de resultados."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, search, limit }) => {
    const q = search?.toLowerCase().trim();
    const posts = blogPosts
      .filter((p) => (category ? p.category === category : true))
      .filter((p) =>
        q ? `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase().includes(q) : true,
      )
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        category: p.category,
        tags: p.tags,
        author: p.author.name,
        publishedAt: p.publishedAt,
        readTime: p.readTime,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
      structuredContent: { count: posts.length, posts },
    };
  },
});
