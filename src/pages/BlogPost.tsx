import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { BlogArticleHero } from '@/components/blog/BlogArticleHero';
import { BlogArticleContent } from '@/components/blog/BlogArticleContent';
import { BlogShareBar } from '@/components/blog/BlogShareBar';
import { BlogAuthorBox } from '@/components/blog/BlogAuthorBox';
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { getPostBySlug } from '@/data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Naturaleza Sin Límites',
      logo: {
        '@type': 'ImageObject',
        url: 'https://naturalezasinlimites.com/logo.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
  };

  return (
    <>
      <Helmet>
        <title>{post.seo.metaTitle}</title>
        <meta name="description" content={post.seo.metaDescription} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.seo.metaTitle} />
        <meta property="og:description" content={post.seo.metaDescription} />
        <meta property="og:image" content={post.seo.ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://naturalezasinlimites.com/blog/${post.slug}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo.metaTitle} />
        <meta name="twitter:description" content={post.seo.metaDescription} />
        <meta name="twitter:image" content={post.seo.ogImage} />
        
        {/* Article metadata */}
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        <link rel="canonical" href={`https://naturalezasinlimites.com/blog/${post.slug}`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-16 sm:pt-20 pb-16 lg:pb-0">
          <BlogBreadcrumbs post={post} />
          <BlogArticleHero post={post} />
          <BlogShareBar post={post} />
          <BlogArticleContent post={post} />
          <BlogAuthorBox author={post.author} />
          <BlogRelatedPosts currentPost={post} />
          <BlogCTA />
        </main>

        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
      </div>
    </>
  );
}
