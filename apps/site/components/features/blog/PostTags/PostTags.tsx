import { Badge } from '@/components/ui/badge';

interface PostTagsProps {
  tags: string[];
  className?: string;
}

export function PostTags({ tags, className = '' }: PostTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-xs"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
