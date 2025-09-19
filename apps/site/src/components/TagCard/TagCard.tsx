import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface TagCardProps {
  tag: string;
  count: number;
}

export function TagCard({ tag, count }: TagCardProps) {
  return (
    <Link href={`/tags/${tag}`} className="group">
      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              #{tag}
            </h3>
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {count} posts
          </Badge>
        </div>
      </div>
    </Link>
  );
}
