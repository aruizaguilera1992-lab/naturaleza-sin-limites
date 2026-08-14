import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { blogPosts } from "@/data/blogPosts";

export default defineTool({
  name: "get_blog_post",
  title: "Leer artículo del blog",
  description: "Devuelve el contenido completo de un artículo del blog a partir de su slug.",
  inputSchema: {
    slug: z.string().min(1).describe("Slug del artículo, obtenido con list_blog_posts."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) throw new ToolError(`No existe ningún artículo con slug "${slug}".`);
    return {
      content: [
        {
          type: "text",
          text: `# ${post.title}\n\n${post.excerpt}\n\n${post.content}`,
        },
      ],
      structuredContent: {
        post: {
          title: post.title,
          slug: post.slug,
          category: post.category,
          author: post.author.name,
          publishedAt: post.publishedAt,
          content: post.content,
        },
      },
    };
  },
});
