import { PostRepository } from '@/repositories/post.repository';
import { PostCard } from '@/components/blocks-app/blog/PostCard/PostCard';

export const dynamic = 'force-dynamic';

export async function PostList() {
  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findAll();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
