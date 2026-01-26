import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/data/blogPosts';
import { toast } from 'sonner';

interface BlogShareBarProps {
  post: BlogPost;
}

export function BlogShareBar({ post }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post.title);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-500',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-700',
    },
  ];

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isSticky ? 1 : 0, x: isSticky ? 0 : -20 }}
        className="hidden lg:flex fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40"
      >
        <div className="bg-card/95 backdrop-blur-sm rounded-full p-2 shadow-lg border border-border/50 flex flex-col gap-2">
          <span className="p-2 text-muted-foreground">
            <Share2 className="w-5 h-5" />
          </span>
          
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full text-muted-foreground hover:text-white transition-all ${link.color}`}
              title={`Compartir en ${link.name}`}
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
          
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            title="Copiar enlace"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Link2 className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 p-3 safe-area-inset-bottom">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Compartir:</span>
          
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-full bg-muted text-muted-foreground hover:text-white transition-all ${link.color}`}
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
          
          <button
            onClick={handleCopyLink}
            className="p-2.5 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Link2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
}
