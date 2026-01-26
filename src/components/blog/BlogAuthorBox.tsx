import { motion } from 'framer-motion';
import { Instagram, Facebook, Linkedin, User } from 'lucide-react';
import { BlogAuthor } from '@/data/blogPosts';

interface BlogAuthorBoxProps {
  author: BlogAuthor;
}

export function BlogAuthorBox({ author }: BlogAuthorBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {author.avatar && author.avatar !== '/placeholder.svg' ? (
              <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <span className="text-sm text-primary font-medium">Escrito por</span>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground mt-1 mb-3">
              {author.name}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {author.bio}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {author.socialLinks.instagram && (
                <a
                  href={author.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {author.socialLinks.facebook && (
                <a
                  href={author.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted text-muted-foreground hover:text-blue-600 hover:bg-blue-600/10 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {author.socialLinks.linkedin && (
                <a
                  href={author.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted text-muted-foreground hover:text-blue-700 hover:bg-blue-700/10 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
