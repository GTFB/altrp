import { AuthorRepository } from '@/repositories/author.repository';
import { AuthorCard } from '@/components/AuthorCard/AuthorCard';

export const dynamic = 'force-dynamic';

export async function AuthorList() {
  const authorRepo = AuthorRepository.getInstance();
  const authors = await authorRepo.findAll();

  if (authors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No authors found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {authors.map((author) => (
        <AuthorCard key={author.slug} author={author} />
      ))}
    </div>
  );
}
