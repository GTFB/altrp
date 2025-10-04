import { PostRepository } from "@/packages/repositories/post.repository";
import { notFound } from "next/navigation";
import { PostCard } from "./PostCard/PostCard";

export async function TagPostList({ slug }: { slug: string }) {
  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findByTag(slug);

  if (posts.length === 0) {
    notFound();
  }
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </>
  );
}
