import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BlogPost, categoryLabels, categoryColors } from '@/data/blogPosts';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

/** Tarjeta visual: solo foto y título; al pulsar se despliega el resumen y el enlace al artículo. */
export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = `blog-card-${post.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      className="group overflow-hidden rounded-2xl border border-border/50 bg-card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="relative block w-full text-left aspect-[4/5] sm:aspect-[4/3] overflow-hidden active:scale-[0.99] transition-all duration-300"
      >
        <img
          src={post.featuredImage}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${open ? 'scale-110' : 'group-hover:scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Badge className={`absolute top-4 left-4 ${categoryColors[post.category]} shadow-lg`}>
          {categoryLabels[post.category]}
        </Badge>
        <span
          className={`absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
          aria-hidden="true"
        >
          <Plus className="h-5 w-5" />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-heading text-lg sm:text-xl font-bold leading-snug text-foreground line-clamp-3">
            {post.title}
          </h3>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {post.readTime} min
          </span>
        </div>
      </button>

      <div
        id={panelId}
        className={`grid transition-all duration-500 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 p-5 pt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <Link
              to={`/blog/${post.slug}`}
              tabIndex={open ? 0 : -1}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 active:scale-95"
            >
              Profundizar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
