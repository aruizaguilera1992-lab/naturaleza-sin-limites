import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BlogPost, categoryLabels } from '@/data/blogPosts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BlogBreadcrumbsProps {
  post: BlogPost;
}

export function BlogBreadcrumbs({ post }: BlogBreadcrumbsProps) {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/blog" className="text-muted-foreground hover:text-primary">
                Blog
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to={`/blog?category=${post.category}`} 
                className="text-muted-foreground hover:text-primary hidden sm:inline"
              >
                {categoryLabels[post.category]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="hidden sm:block">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium line-clamp-1 max-w-[150px] sm:max-w-[300px]">
              {post.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
