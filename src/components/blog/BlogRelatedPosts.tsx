import { motion } from 'framer-motion';
import { BlogPost, blogPosts } from '@/data/blogPosts';
import { BlogCard } from './BlogCard';

interface BlogRelatedPostsProps {
  currentPost: BlogPost;
  posts?: BlogPost[];
}

export function BlogRelatedPosts({ currentPost, posts = blogPosts }: BlogRelatedPostsProps) {
  const relatedPosts = posts.filter(post => post.slug !== currentPost.slug && (post.category === currentPost.category || post.tags.some(tag => currentPost.tags.includes(tag)))).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
            Artículos Relacionados
          </h2>
          <p className="text-muted-foreground">
            Continúa explorando más sobre aventura y montaña
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {relatedPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
