import { Badge } from '@/components/ui/badge';
import { Calendar, User, Tag } from 'lucide-react';

interface PostMetaProps {
  date?: string;
  author?: string;
  category?: string;
  className?: string;
}

export function PostMeta({ date, author, category, className = '' }: PostMetaProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${className}`}>
      {date && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <time dateTime={date}>
            {new Date(date).toLocaleDateString()}
          </time>
        </div>
      )}
      
      {author && (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{author}</span>
        </div>
      )}
      
      {category && (
        <div className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
      )}
    </div>
  );
}
