import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { BlogHero } from '@/components/blog/BlogHero';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { blogPosts, BlogCategory, searchPosts } from '@/data/blogPosts';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== 'all') {
      setSelectedCategory(categoryParam as BlogCategory);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: BlogCategory | 'all') => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when changing category
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('all'); // Reset category when searching
  };

  const filteredPosts = useMemo(() => {
    let posts = blogPosts;

    if (searchQuery) {
      posts = searchPosts(searchQuery);
    } else if (selectedCategory !== 'all') {
      posts = posts.filter((post) => post.category === selectedCategory);
    }

    return posts;
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Blog de Aventuras | Naturaleza Sin Límites</title>
        <meta
          name="description"
          content="Descubre guías, técnicas, rutas recomendadas y consejos para tus aventuras de montaña. Blog de barranquismo, escalada y vías ferratas."
        />
        <meta property="og:title" content="Blog de Aventuras | Naturaleza Sin Límites" />
        <meta
          property="og:description"
          content="Descubre guías, técnicas, rutas recomendadas y consejos para tus aventuras de montaña."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://naturalezasinlimites.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          <BlogHero />

          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4">
              <BlogFilters
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-3">
                  {searchQuery && (
                    <div className="mb-6">
                      <p className="text-muted-foreground">
                        Resultados para: <span className="text-foreground font-medium">"{searchQuery}"</span>
                        {' '}({filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''})
                      </p>
                    </div>
                  )}

                  {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                      {filteredPosts.map((post, index) => (
                        <BlogCard key={post.id} post={post} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-xl text-muted-foreground mb-4">
                        No se encontraron artículos
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="text-primary hover:underline"
                      >
                        Ver todos los artículos
                      </button>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <BlogSidebar
                      onSearch={handleSearch}
                      onCategoryClick={handleCategoryChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
      </div>
    </>
  );
}
