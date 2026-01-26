import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogCategory, categoryLabels, categoryColors, getMostReadPosts, searchPosts, blogPosts } from '@/data/blogPosts';

interface BlogSidebarProps {
  onSearch: (query: string) => void;
  onCategoryClick: (category: BlogCategory) => void;
}

export function BlogSidebar({ onSearch, onCategoryClick }: BlogSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const mostReadPosts = getMostReadPosts(5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const categoryCounts = Object.keys(categoryLabels).reduce((acc, category) => {
    acc[category as BlogCategory] = blogPosts.filter(p => p.category === category).length;
    return acc;
  }, {} as Record<BlogCategory, number>);

  return (
    <aside className="space-y-6">
      {/* Search */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Buscar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Buscar artículos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" variant="default">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Most Read Posts */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Más Leídos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mostReadPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex gap-3 items-start"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {post.views?.toLocaleString()} lecturas
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Categorías
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(categoryLabels) as BlogCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${categoryColors[category].split(' ')[0]}`} />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {categoryLabels[category]}
                </span>
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {categoryCounts[category]}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-primary/10 to-adventure-orange/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-heading font-semibold text-foreground mb-2">
            ¿Listo para la aventura?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reserva tu próxima experiencia con nosotros
          </p>
          <Button asChild variant="hero" className="w-full">
            <Link to="/contacto">
              Reservar Ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
