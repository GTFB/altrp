import { CategoryRepository } from '@/repositories/category.repository';
import { PostRepository } from '@/repositories/post.repository';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CategoryCard } from '@/components/CategoryCard/CategoryCard';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryRepo = new CategoryRepository();
  const category = await categoryRepo.findBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found | Jambo Blog',
      description: 'The requested category could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jambo.example.com';
  const categoryUrl = `${baseUrl}/${params.locale}/categories/${params.slug}`;

  return {
    title: `${category.title} | Categories | Jambo Blog`,
    description: category.excerpt || `Read articles in ${category.title} category`,
    keywords: category.tags?.join(', ') || '',
    openGraph: {
      title: category.title,
      description: category.excerpt || `Read articles in ${category.title} category`,
      type: 'website',
      url: categoryUrl,
      locale: params.locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: 'Jambo Blog',
    },
    twitter: {
      card: 'summary',
      title: category.title,
      description: category.excerpt || `Read articles in ${category.title} category`,
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryRepo = new CategoryRepository();
  const category = await categoryRepo.findBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const postRepo = new PostRepository();
  const posts = await postRepo.findByCategory(category.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Tag className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
        {category.excerpt && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {category.excerpt}
          </p>
        )}
        {category.tags && category.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {category.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {category.content && (
          <div 
            className="prose prose-lg max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: category.content }}
          />
        )}
      </div>

      {/* Category's Posts */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Posts in {category.title}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No posts found in this category yet.
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
                    {post.author && ` • by ${post.author}`}
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
    </div>
  );
}
