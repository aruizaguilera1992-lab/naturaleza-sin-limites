import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { BlogPost, categoryLabels, categoryColors } from '@/data/blogPosts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/blog/${post.slug}`}>
        <Card className="group h-full overflow-hidden bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
          {/* Featured Image */}
          <div className="relative overflow-hidden">
            <AspectRatio ratio={16 / 9}>
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </AspectRatio>
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className={`${categoryColors[post.category]} shadow-lg`}>
                {categoryLabels[post.category]}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5 sm:p-6">
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm sm:text-base mb-4 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} min
              </span>
            </div>

            {/* Read More Button */}
            <Button
              variant="ghost"
              className="p-0 h-auto text-primary hover:text-primary/80 font-medium group/btn"
            >
              Leer más
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
