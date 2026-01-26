import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BlogPost, categoryLabels, categoryColors } from '@/data/blogPosts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BlogArticleHeroProps {
  post: BlogPost;
}

export function BlogArticleHero({ post }: BlogArticleHeroProps) {
  return (
    <section className="relative">
      {/* Full-width Image */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-32 sm:-mt-40 md:-mt-48 z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border border-border/50"
          >
            {/* Category Badge */}
            <Badge className={`${categoryColors[post.category]} mb-4`}>
              {categoryLabels[post.category]}
            </Badge>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <span className="font-medium text-foreground">{post.author.name}</span>
              </div>

              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), "d 'de' MMMM, yyyy", { locale: es })}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} min de lectura
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
