import { motion } from 'framer-motion';
import { BlogCategory, categoryLabels } from '@/data/blogPosts';

interface BlogFiltersProps {
  selectedCategory: BlogCategory | 'all';
  onCategoryChange: (category: BlogCategory | 'all') => void;
}

const categories: (BlogCategory | 'all')[] = [
  'all',
  'tecnicas-seguridad',
  'rutas-recomendadas',
  'equipo-material',
  'formacion',
  'historias-experiencias',
  'consejos-principiantes',
];

const getCategoryLabel = (category: BlogCategory | 'all'): string => {
  if (category === 'all') return 'Todas';
  return categoryLabels[category];
};

export function BlogFilters({ selectedCategory, onCategoryChange }: BlogFiltersProps) {
  return (
    <div className="mb-8 md:mb-12">
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300
              ${selectedCategory === category
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }
            `}
          >
            {getCategoryLabel(category)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
