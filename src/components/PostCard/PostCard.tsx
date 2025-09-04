import { type Post } from '@/repositories/post.repository';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <header className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          <a href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </a>
        </h2>
        {post.date && (
          <time className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString()}
          </time>
        )}
      </header>
      
      {post.excerpt && (
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-muted rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
