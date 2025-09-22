import { AuthorRepository } from '@/repositories/author.repository';
import { PostRepository } from '@/repositories/post.repository';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Container } from '@/components/layout/Container';
export const dynamic = 'force-dynamic';

interface AuthorPageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const authorRepo = AuthorRepository.getInstance();
  const author = await authorRepo.findBySlug(params.slug);

  if (!author) {
    return {
      title: 'Author Not Found | Jambo Blog',
      description: 'The requested author could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jambo.example.com';
  const authorUrl = `${baseUrl}/${params.locale}/authors/${params.slug}`;

  return {
    title: `${author.name} | Authors | Jambo Blog`,
    description: author.bio || `Read articles by ${author.name}`,
    authors: [{ name: author.name }],
    openGraph: {
      title: author.name,
      description: author.bio || `Read articles by ${author.name}`,
      type: 'profile',
      url: authorUrl,
      locale: params.locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: 'Jambo Blog',
    },
    twitter: {
      card: 'summary',
      title: author.name,
      description: author.bio || `Read articles by ${author.name}`,
    },
    alternates: {
      canonical: authorUrl,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const authorRepo = AuthorRepository.getInstance();
  const author = await authorRepo.findBySlug(params.slug);

  if (!author) {
    notFound();
  }

  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findByAuthor(author.slug);

  return (
    <Container className="py-8">
      {/* Author Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
        </div>
        <h1 className="text-4xl font-bold mb-4">{author.name}</h1>
        {author.bio && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {author.bio}
          </p>
        )}
        {author.content && (
          <div 
            className="prose prose-lg max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: author.content }}
          />
        )}
      </div>

      {/* Author's Posts */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Posts by {author.name}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {author.name} hasn't written any posts yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.slug} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <header className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    <a href={`/${params.locale}/blog/${post.slug}`} className="hover:text-primary">
                      {post.title}
                    </a>
                  </h3>
                  <div className="text-sm text-muted-foreground mb-2">
                    {post.date && new Date(post.date).toLocaleDateString()}
                  </div>
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
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
