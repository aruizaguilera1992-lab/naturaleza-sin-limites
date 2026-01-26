import { motion } from 'framer-motion';
import { BlogPost } from '@/data/blogPosts';

interface BlogArticleContentProps {
  post: BlogPost;
}

export function BlogArticleContent({ post }: BlogArticleContentProps) {
  // Simple markdown-like parsing for content
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: JSX.Element[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType;
        elements.push(
          <ListTag key={`list-${elements.length}`} className={listType === 'ol' ? 'list-decimal pl-6 space-y-2 my-4' : 'list-disc pl-6 space-y-2 my-4'}>
            {listItems.map((item, i) => (
              <li key={i} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0].split('|').filter(cell => cell.trim());
        const dataRows = tableRows.slice(2).map(row => row.split('|').filter(cell => cell.trim()));

        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {headerRow.map((cell, i) => (
                    <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-foreground bg-muted/50">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/20">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-muted-foreground">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const parseInline = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Table handling
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        flushList();
        inTable = true;
        tableRows.push(trimmedLine);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Empty line
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl sm:text-3xl font-heading font-bold text-foreground mt-10 mb-4">
            {trimmedLine.substring(3)}
          </h2>
        );
        return;
      }

      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl sm:text-2xl font-heading font-semibold text-foreground mt-8 mb-3">
            {trimmedLine.substring(4)}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4 key={index} className="text-lg sm:text-xl font-heading font-semibold text-foreground mt-6 mb-2">
            {trimmedLine.substring(5)}
          </h4>
        );
        return;
      }

      // Blockquote
      if (trimmedLine.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-primary pl-6 py-2 my-6 italic text-muted-foreground bg-muted/30 rounded-r-lg">
            <p dangerouslySetInnerHTML={{ __html: parseInline(trimmedLine.substring(2)) }} />
          </blockquote>
        );
        return;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
        return;
      }

      // Bullet list
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(trimmedLine.substring(2));
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-muted-foreground leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: parseInline(trimmedLine) }} />
      );
    });

    flushList();
    flushTable();

    return elements;
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="prose-custom max-w-3xl mx-auto px-4 py-8 sm:py-12"
      style={{ fontSize: '18px', lineHeight: '1.7' }}
    >
      {renderContent(post.content)}

      {/* Tags */}
      <div className="mt-12 pt-6 border-t border-border">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-muted/80 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
