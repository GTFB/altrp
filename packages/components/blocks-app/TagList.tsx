import { PostRepository } from "@/repositories/post.repository";
import { TagCard } from "@/components/blocks-app/TagCard";

export const dynamic = "force-dynamic";

export async function TagList() {
  const postRepo = PostRepository.getInstance();
  const tags = await postRepo.findAllTags();

  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tags found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tags.map(({ tag, count }) => (
        <TagCard key={tag} tag={tag} count={count} />
      ))}
    </div>
  );
}
