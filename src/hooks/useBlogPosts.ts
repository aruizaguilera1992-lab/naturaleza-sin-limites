import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts } from '@/data/blogPosts';
import { mergeBlogPosts, pieceToPost, type EditorialPiece } from '@/lib/editorial';

export function useBlogPosts() {
  const query = useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_posts_public').select('*').order('published_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(row => pieceToPost(row as EditorialPiece));
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  return { ...query, posts: mergeBlogPosts(blogPosts, query.data ?? []) };
}