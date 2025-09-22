import { CategoryRepository } from '@/repositories/category.repository';
import { PostRepository } from '@/repositories/post.repository';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { PostCard } from '@/components/features/blog/PostCard/PostCard';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout/Container';
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryRepo = CategoryRepository.getInstance();
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
  const categoryRepo = CategoryRepository.getInstance();
  const category = await categoryRepo.findBySlug(params.slug);
  const t = useTranslations('category');  
  if (!category) {
    notFound();
  }

  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findByCategory(category.slug);

  return (
    <Container className="py-8">
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
          {t('posts_in')} {category.title}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('no_posts_found_in_this_category_yet')}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
