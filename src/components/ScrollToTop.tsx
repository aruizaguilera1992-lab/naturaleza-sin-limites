import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-40 right-6 z-40 flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground rounded-full shadow-[0_8px_25px_-5px_rgba(255,107,53,0.5)] hover:shadow-[0_12px_30px_-5px_rgba(255,107,53,0.7)] hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
          aria-label="Volver arriba"
        >
          {/* Inner beveled ring for depth */}
          <span className="absolute inset-0 rounded-full border-b-2 border-white/30 pointer-events-none" />
          <ChevronUp className="relative h-6 w-6 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
